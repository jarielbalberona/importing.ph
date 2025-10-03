# AWS Configuration
aws_region                 = "ap-southeast-1"
aws_s3_bucket_tfstate_name = "lbta-app-tofu-state"
project                    = "lbta-app"

# Note: AWS credentials should be provided via:
# 1. Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
# 2. IAM roles (recommended for EC2/ECS)
# 3. AWS CLI configuration
# 4. IAM user with appropriate permissions

# Remove hardcoded credentials for security
# aws_access_key = "your-access-key"
# aws_secret_key = "your-secret-key"
