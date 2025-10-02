# VPC
resource "aws_vpc" "main" {

  cidr_block = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = {
    Name = "${var.environment}-${var.aws_project_name}-vpc"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main_igw" {
  vpc_id = aws_vpc.main.id
  tags = {
    Name = "${var.environment}-${var.aws_project_name}-main-igw"
  }
}

# Route Table for Public Subnets
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main_igw.id
  }
  tags = {
    Name = "${var.environment}-${var.aws_project_name}-public-rt"
  }
}

# Public Subnet 1
resource "aws_subnet" "subnet_1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "ap-southeast-1a"
  tags = {
    Name = "${var.environment}-${var.aws_project_name}-subnet-1"
  }
}

# Public Subnet 2
resource "aws_subnet" "subnet_2" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "ap-southeast-1b"
  tags = {
    Name = "${var.environment}-${var.aws_project_name}-subnet-2"
  }
}

# Associate Public Subnets with the Route Table
resource "aws_route_table_association" "subnet_1_assoc" {
  subnet_id      = aws_subnet.subnet_1.id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_route_table_association" "subnet_2_assoc" {
  subnet_id      = aws_subnet.subnet_2.id
  route_table_id = aws_route_table.public_rt.id
}


# Security Group
resource "aws_security_group" "alb_sg" {
  name   = "${var.environment}-${var.aws_project_name}-alb-sg"
  vpc_id = aws_vpc.main.id

  # Allow HTTP traffic from the internet
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow HTTPS traffic from the internet
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow outbound traffic to ECS tasks (Next.js + Express API)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.environment}-${var.aws_project_name}-alb-sg"
  }
}


## Shared
resource "aws_lb" "alb" {
  name               = "lbta-app-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = [aws_subnet.subnet_1.id, aws_subnet.subnet_2.id]
  idle_timeout       = 30 # Default is 60, reducing to 30 to save cost
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.alb.arn
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
  tags = {
    Name = "${var.environment}-${var.aws_project_name}-alb-listener-http"
  }
}

# API Load Balancer, Target Groups
resource "aws_security_group" "ecs_api_sg" {
  vpc_id = aws_vpc.main.id

  # Allow only ALB to access Express API (port 4000 or any API port)
  ingress {
    from_port       = 4000 # Change to your Express API port
    to_port         = 4000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id] # ALB security group
  }

  # Allow Express API to access RDS
  egress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.module_rds_aws_security_group_id] # RDS security group
  }

  # Allow Express API to access external resources (S3, etc.)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = {
    Name = "${var.environment}-${var.aws_project_name}-ecs-api-sg"
  }
}

resource "aws_lb_target_group" "api_tg" {
  name        = "api-target-group"
  port        = 4000 # Change to your Express API port
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    path                = "/health" # Update based on your API
    interval            = 30
    timeout             = 5
    healthy_threshold   = 3
    unhealthy_threshold = 3
  }
  tags = {
    Name = "${var.environment}-${var.aws_project_name}-api-tg"
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.alb.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = var.module_route53_acm_certificate_ssl_cert

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api_tg.arn
  }
  tags = {
    Name = "${var.environment}-${var.aws_project_name}-alb-listener-https"
  }
}

resource "aws_lb_listener_rule" "api_rule" {
  listener_arn = aws_lb_listener.https.arn

  condition {
    host_header {
      values = [var.project_api_domain]
    }
  }

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api_tg.arn
  }
  tags = {
    Name = "${var.environment}-${var.aws_project_name}-api-rule"
  }
}


# App Load Balancer, Target Groups
resource "aws_security_group" "ecs_app_sg" {
  name   = "${var.environment}-${var.aws_project_name}-ecs-app-sg"
  vpc_id = aws_vpc.main.id

  # Allow only ALB to access NextJS App (port 3000 or any API port)
  ingress {
    from_port       = 3000 # Change to your NextJS App port
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id] # ALB security group
  }

  # Allow NextJS App to access external resources
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  tags = {
    Name = "${var.environment}-${var.aws_project_name}-ecs-app-sg"
  }
}

resource "aws_lb_target_group" "app_tg" {
  name        = "app-target-group"
  port        = 3000 # Change to your NextJS App port
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    path                = "/api/health"  # Health check endpoint
    interval            = 30
    timeout             = 5
    healthy_threshold   = 3
    unhealthy_threshold = 3
    matcher            = "200"  # HTTP 200 response indicates healthy
  }

  tags = {
    Name = "${var.environment}-${var.aws_project_name}-app-tg"
  }
}

resource "aws_lb_listener_rule" "app_rule" {
  listener_arn = aws_lb_listener.https.arn

  condition {
    host_header {
      values = [var.project_app_domain]
    }
  }

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app_tg.arn
  }
  tags = {
    Name = "${var.environment}-${var.aws_project_name}-app-rule"
  }
}
