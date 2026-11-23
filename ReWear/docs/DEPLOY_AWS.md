# AWS deployment handoff

## Before provisioning

Use a team-owned AWS account and agree on a budget. Confirm student-credit eligibility in that account, choose the Mumbai region (`ap-south-1`) unless the instructor specifies otherwise, assign a person who can receive budget emails, register/choose a domain, and request an ACM certificate for the API hostname in the AWS region. If using a custom CloudFront hostname, its ACM certificate must be in `us-east-1`. Store Terraform state in an encrypted, versioned, access-controlled backend; state includes generated credentials. Keep `.tfstate` out of Git.

The stack runs tasks in public subnets with public IPs so it avoids NAT gateway charges. The task security group accepts API traffic only from the load balancer. The database is in isolated subnets and accepts PostgreSQL only from the API security group. The RDS instance is single-AZ for a student pilot. Review whether the risk and availability fit the demonstration.

## Deploy sequence

1. Install Terraform, AWS CLI, Docker, Java 25 LTS, Maven, Node.js, and pnpm. Configure short-lived AWS SSO/role credentials in the team account. Confirm the active identity with `aws sts get-caller-identity`.
2. In `infra/aws/`, copy `terraform.tfvars.example` to a private `terraform.tfvars` and replace every placeholder, including the budget recipient. Never commit the private file.
3. Run `terraform init`, then review `terraform plan` with the instructor/team. To create only the ECR repository for image upload, review and apply `terraform plan -target=aws_ecr_repository.api` followed by `terraform apply -target=aws_ecr_repository.api`. This target apply is a bootstrap exception; after it, use full plans for normal changes.
4. Build the API image from `backend/`, authenticate Docker to the ECR URL output by Terraform, and push an immutable tag. Update `api_image` in the private tfvars file to that pushed image URI.
5. Run a full `terraform plan`, review every resource and the current monthly price estimate with the account owner, and apply only after explicit team/instructor budget approval. The task service should then start with the real image.
6. From repository root, build the frontend with the output API URL set:

   ```powershell
   $env:VITE_API_BASE_URL = "https://api.example.edu"
   pnpm install --frozen-lockfile
   pnpm build
   aws s3 sync dist/ "s3://<frontend_bucket output>/" --delete
   aws cloudfront create-invalidation --distribution-id <distribution id> --paths "/*"
   ```

7. Confirm the frontend origin exactly matches the API CORS setting. If using a custom frontend hostname, set `frontend_origin` and `frontend_certificate_arn`, apply again, and wait for CloudFront deployment.
8. Capture a timestamped health response, sign-in, browse, item image, exchange/settlement, CloudWatch log, alarm/budget configuration, backup setting, and Terraform outputs for the report. Redact account IDs, email, credentials, and member information as required by the instructor.

## Cost and teardown

This stack creates billable ALB, Fargate, RDS, CloudFront, storage, logs, and budget resources. The budget feature sends an email warning and does not stop spending. Verify exact costs in AWS Pricing Calculator, check the account every day during the demo, and shut down or run `terraform destroy` after collecting evidence. Export needed evidence first. Do not destroy a team-owned shared resource without the account owner’s approval.

The stack has no SMTP, payment provider, email verification, password reset, custom moderation backend, or automated backup restore drill. Those remain later work, not implied by infrastructure creation.
