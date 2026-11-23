variable "aws_region" {
  type    = string
  default = "ap-south-1"
}
variable "project_name" {
  type    = string
  default = "closet-cycle-sem5"
}
variable "api_hostname" {
  type        = string
  description = "DNS name for the API, covered by certificate_arn and hosted in api_zone_id."
}
variable "api_zone_id" {
  type        = string
  description = "Route 53 hosted zone ID for api_hostname."
}
variable "certificate_arn" {
  type        = string
  description = "ACM certificate ARN in aws_region covering api_hostname."
}
variable "api_image" {
  type        = string
  description = "ECR image URI including immutable tag or digest."
}
variable "db_instance_class" {
  type    = string
  default = "db.t4g.micro"
}
variable "api_desired_count" {
  type    = number
  default = 1
}
variable "api_cpu" {
  type    = number
  default = 256
}
variable "api_memory" {
  type    = number
  default = 512
}
variable "frontend_origin" {
  type        = string
  default     = ""
  description = "Optional custom hostname for CloudFront. Configure its DNS after deployment."
}
variable "frontend_certificate_arn" {
  type        = string
  default     = ""
  description = "Optional ACM certificate in us-east-1 for frontend_origin."
}
variable "monthly_budget_usd" {
  type        = number
  default     = 100
  description = "AWS budget alert threshold; this is not a spending cap."
}
variable "budget_email" {
  type        = string
  description = "Team email that receives AWS budget alerts."
}
