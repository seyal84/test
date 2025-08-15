terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# TODO: Add VPC, RDS (Postgres), ECR repos, ECS cluster/services (Fargate), ALB, ACM certs,
# Secrets Manager parameters, CloudWatch log groups, IAM roles, and CodeDeploy for blue/green.

variable "aws_region" {
  type    = string
  default = "us-east-1"
}