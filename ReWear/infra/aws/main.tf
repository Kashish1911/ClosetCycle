locals {
  name         = var.project_name
  azs          = slice(data.aws_availability_zones.available.names, 0, 2)
  tags         = { Project = local.name, ManagedBy = "Terraform", Environment = "student-pilot" }
  db_name      = "closetcycle"
  db_user      = "closet_cycle_app"
  frontend_url = var.frontend_origin == "" ? "https://${aws_cloudfront_distribution.front.domain_name}" : "https://${var.frontend_origin}"
}

resource "aws_vpc" "main" {
  cidr_block           = "10.42.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags                 = merge(local.tags, { Name = "${local.name}-vpc" })
}
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags   = local.tags
}
resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(aws_vpc.main.cidr_block, 8, count.index)
  availability_zone       = local.azs[count.index]
  map_public_ip_on_launch = true
  tags                    = merge(local.tags, { Name = "${local.name}-public-${count.index}" })
}
resource "aws_subnet" "database" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(aws_vpc.main.cidr_block, 8, count.index + 10)
  availability_zone = local.azs[count.index]
  tags              = merge(local.tags, { Name = "${local.name}-db-${count.index}" })
}
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  tags   = local.tags
}
resource "aws_route" "internet" {
  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.main.id
}
resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_security_group" "alb" {
  name        = "${local.name}-alb"
  description = "HTTPS public ingress"
  vpc_id      = aws_vpc.main.id
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = local.tags
}
resource "aws_security_group" "api" {
  name   = "${local.name}-api"
  vpc_id = aws_vpc.main.id
  ingress {
    from_port       = 8080
    to_port         = 8080
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = local.tags
}
resource "aws_security_group" "database" {
  name   = "${local.name}-database"
  vpc_id = aws_vpc.main.id
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.api.id]
  }
  tags = local.tags
}

resource "aws_db_subnet_group" "main" {
  name       = "${local.name}-db-subnets"
  subnet_ids = aws_subnet.database[*].id
  tags       = local.tags
}
resource "random_password" "db" {
  length  = 32
  special = false
}
resource "random_password" "jwt" {
  length  = 48
  special = false
}
resource "aws_secretsmanager_secret" "app" {
  name = "${local.name}/application"
  tags = local.tags
}
resource "aws_secretsmanager_secret_version" "app" {
  secret_id = aws_secretsmanager_secret.app.id
  secret_string = jsonencode({
    database_password = random_password.db.result
    jwt_secret        = random_password.jwt.result
  })
}
resource "aws_db_instance" "main" {
  identifier              = local.name
  engine                  = "postgres"
  engine_version          = "16"
  instance_class          = var.db_instance_class
  allocated_storage       = 20
  max_allocated_storage   = 50
  storage_type            = "gp3"
  storage_encrypted       = true
  db_name                 = local.db_name
  username                = local.db_user
  password                = random_password.db.result
  db_subnet_group_name    = aws_db_subnet_group.main.name
  vpc_security_group_ids  = [aws_security_group.database.id]
  publicly_accessible     = false
  multi_az                = false
  backup_retention_period = 3
  deletion_protection     = false
  skip_final_snapshot     = true
  apply_immediately       = true
  tags                    = local.tags
}

resource "aws_s3_bucket" "media" {
  bucket = "${local.name}-${data.aws_caller_identity.current.account_id}-media"
  tags   = local.tags
}
resource "aws_s3_bucket_public_access_block" "media" {
  bucket                  = aws_s3_bucket.media.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
resource "aws_s3_bucket_server_side_encryption_configuration" "media" {
  bucket = aws_s3_bucket.media.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
resource "aws_s3_bucket_versioning" "media" {
  bucket = aws_s3_bucket.media.id
  versioning_configuration {
    status = "Enabled"
  }
}
resource "aws_s3_bucket_lifecycle_configuration" "media" {
  bucket = aws_s3_bucket.media.id
  rule {
    id     = "remove-incomplete-multipart"
    status = "Enabled"
    filter {}
    abort_incomplete_multipart_upload {
      days_after_initiation = 2
    }
  }
}

resource "aws_ecr_repository" "api" {
  name                 = local.name
  image_tag_mutability = "IMMUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
  tags = local.tags
}
resource "aws_cloudwatch_log_group" "api" {
  name              = "/ecs/${local.name}"
  retention_in_days = 30
  tags              = local.tags
}
resource "aws_ecs_cluster" "main" {
  name = local.name
  tags = local.tags
}
resource "aws_iam_role" "execution" {
  name               = "${local.name}-execution"
  assume_role_policy = jsonencode({ Version = "2012-10-17", Statement = [{ Effect = "Allow", Principal = { Service = "ecs-tasks.amazonaws.com" }, Action = "sts:AssumeRole" }] })
  tags               = local.tags
}
resource "aws_iam_role_policy_attachment" "execution" {
  role       = aws_iam_role.execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}
resource "aws_iam_role_policy" "secrets" {
  name   = "read-app-secrets"
  role   = aws_iam_role.execution.id
  policy = jsonencode({ Version = "2012-10-17", Statement = [{ Effect = "Allow", Action = ["secretsmanager:GetSecretValue"], Resource = [aws_secretsmanager_secret.app.arn] }] })
}
resource "aws_iam_role" "task" {
  name               = "${local.name}-task"
  assume_role_policy = jsonencode({ Version = "2012-10-17", Statement = [{ Effect = "Allow", Principal = { Service = "ecs-tasks.amazonaws.com" }, Action = "sts:AssumeRole" }] })
  tags               = local.tags
}
resource "aws_iam_role_policy" "media" {
  name   = "media-object-access"
  role   = aws_iam_role.task.id
  policy = jsonencode({ Version = "2012-10-17", Statement = [{ Effect = "Allow", Action = ["s3:PutObject", "s3:GetObject"], Resource = ["${aws_s3_bucket.media.arn}/*"] }] })
}

resource "aws_lb" "api" {
  name               = substr("${local.name}-alb", 0, 32)
  load_balancer_type = "application"
  subnets            = aws_subnet.public[*].id
  security_groups    = [aws_security_group.alb.id]
  tags               = local.tags
}
resource "aws_lb_target_group" "api" {
  name        = substr("${local.name}-api", 0, 32)
  port        = 8080
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.main.id
  health_check {
    path     = "/actuator/health"
    matcher  = "200"
    interval = 30
  }
  tags = local.tags
}
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.api.arn
  port              = 80
  protocol          = "HTTP"
  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.api.arn
  port              = 443
  protocol          = "HTTPS"
  certificate_arn   = var.certificate_arn
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }
}
resource "aws_route53_record" "api" {
  zone_id = var.api_zone_id
  name    = var.api_hostname
  type    = "A"
  alias {
    name                   = aws_lb.api.dns_name
    zone_id                = aws_lb.api.zone_id
    evaluate_target_health = true
  }
}
resource "aws_ecs_task_definition" "api" {
  family                   = local.name
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.api_cpu
  memory                   = var.api_memory
  execution_role_arn       = aws_iam_role.execution.arn
  task_role_arn            = aws_iam_role.task.arn
  container_definitions = jsonencode([{
    name         = "api", image = var.api_image, essential = true
    portMappings = [{ containerPort = 8080, protocol = "tcp" }]
    environment = [
      { name = "SPRING_PROFILES_ACTIVE", value = "prod" },
      { name = "PORT", value = "8080" },
      { name = "DATABASE_URL", value = "jdbc:postgresql://${aws_db_instance.main.address}:${aws_db_instance.main.port}/${local.db_name}" },
      { name = "DATABASE_USER", value = local.db_user },
      { name = "CLOSET_CYCLE_MEDIA_BUCKET", value = aws_s3_bucket.media.bucket },
      { name = "AWS_REGION", value = var.aws_region },
      { name = "CLOSET_CYCLE_ALLOWED_ORIGINS", value = local.frontend_url }
    ]
    secrets = [
      { name = "DATABASE_PASSWORD", valueFrom = "${aws_secretsmanager_secret.app.arn}:database_password::" },
      { name = "CLOSET_CYCLE_JWT_SECRET", valueFrom = "${aws_secretsmanager_secret.app.arn}:jwt_secret::" }
    ]
    logConfiguration = { logDriver = "awslogs", options = { "awslogs-group" = aws_cloudwatch_log_group.api.name, "awslogs-region" = var.aws_region, "awslogs-stream-prefix" = "api" } }
    healthCheck      = { command = ["CMD-SHELL", "curl -fsS http://localhost:8080/actuator/health || exit 1"], interval = 30, timeout = 5, retries = 3, startPeriod = 60 }
  }])
  depends_on = [aws_secretsmanager_secret_version.app]
  tags       = local.tags
}
resource "aws_ecs_service" "api" {
  name                              = local.name
  cluster                           = aws_ecs_cluster.main.id
  task_definition                   = aws_ecs_task_definition.api.arn
  desired_count                     = var.api_desired_count
  launch_type                       = "FARGATE"
  health_check_grace_period_seconds = 90
  network_configuration {
    subnets          = aws_subnet.public[*].id
    security_groups  = [aws_security_group.api.id]
    assign_public_ip = true
  }
  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api"
    container_port   = 8080
  }
  depends_on = [aws_lb_listener.https, aws_iam_role_policy_attachment.execution]
  tags       = local.tags
}
resource "aws_appautoscaling_target" "api" {
  max_capacity       = 8
  min_capacity       = var.api_desired_count
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.api.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}
resource "aws_appautoscaling_policy" "api_cpu" {
  name               = "${local.name}-cpu-target"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.api.resource_id
  scalable_dimension = aws_appautoscaling_target.api.scalable_dimension
  service_namespace  = aws_appautoscaling_target.api.service_namespace
  target_tracking_scaling_policy_configuration {
    target_value       = 65
    scale_in_cooldown  = 180
    scale_out_cooldown = 60
    predefined_metric_specification { predefined_metric_type = "ECSServiceAverageCPUUtilization" }
  }
}

resource "aws_s3_bucket" "frontend" {
  bucket = "${local.name}-${data.aws_caller_identity.current.account_id}-frontend"
  tags   = local.tags
}
resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket                  = aws_s3_bucket.frontend.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "${local.name}-frontend"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}
resource "aws_cloudfront_distribution" "front" {
  enabled             = true
  default_root_object = "index.html"
  aliases             = var.frontend_origin == "" ? [] : [var.frontend_origin]
  origin {
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id                = "frontend"
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
  }
  default_cache_behavior {
    target_origin_id       = "frontend"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }
  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  viewer_certificate {
    cloudfront_default_certificate = var.frontend_certificate_arn == ""
    acm_certificate_arn            = var.frontend_certificate_arn == "" ? null : var.frontend_certificate_arn
    ssl_support_method             = var.frontend_certificate_arn == "" ? null : "sni-only"
    minimum_protocol_version       = var.frontend_certificate_arn == "" ? null : "TLSv1.2_2021"
  }
  tags = local.tags
}
resource "aws_route53_record" "frontend" {
  count   = var.frontend_origin == "" ? 0 : 1
  zone_id = var.api_zone_id
  name    = var.frontend_origin
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.front.domain_name
    zone_id                = aws_cloudfront_distribution.front.hosted_zone_id
    evaluate_target_health = false
  }
}
resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  policy = jsonencode({ Version = "2012-10-17", Statement = [{ Sid = "AllowCloudFrontRead", Effect = "Allow", Principal = { Service = "cloudfront.amazonaws.com" }, Action = ["s3:GetObject"], Resource = ["${aws_s3_bucket.frontend.arn}/*"], Condition = { StringEquals = { "AWS:SourceArn" = aws_cloudfront_distribution.front.arn } } }] })
}
resource "aws_cloudwatch_metric_alarm" "unhealthy_targets" {
  alarm_name          = "${local.name}-unhealthy-targets"
  namespace           = "AWS/ApplicationELB"
  metric_name         = "UnHealthyHostCount"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 2
  period              = 60
  statistic           = "Maximum"
  threshold           = 1
  dimensions          = { TargetGroup = aws_lb_target_group.api.arn_suffix, LoadBalancer = aws_lb.api.arn_suffix }
  tags                = local.tags
}
resource "aws_budgets_budget" "monthly" {
  name         = "${local.name}-monthly"
  budget_type  = "COST"
  limit_amount = tostring(var.monthly_budget_usd)
  limit_unit   = "USD"
  time_unit    = "MONTHLY"
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = [var.budget_email]
  }
}
