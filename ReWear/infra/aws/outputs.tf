output "api_url" { value = "https://${var.api_hostname}" }
output "frontend_url" { value = "https://${aws_cloudfront_distribution.front.domain_name}" }
output "frontend_bucket" { value = aws_s3_bucket.frontend.bucket }
output "media_bucket" { value = aws_s3_bucket.media.bucket }
output "ecr_repository_url" { value = aws_ecr_repository.api.repository_url }
