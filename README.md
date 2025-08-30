# qd-app-fizzbuzzboom (Quizdash API for FizzBuzz 2.0 game)

This project contains source code and supporting files for a serverless application that you can deploy with the SAM CLI. It includes the following files and folders.

The application uses several AWS resources, including Lambda functions and an API Gateway API. These resources are defined in the `template.yaml` file in this project. You can update the template to add AWS resources through the same deployment process that updates your application code.

## Dev PC Software Prerequisites
For deploying the application:
* Linux Bash CLI (for running examples here)
* AWS CLI
* SAM CLI - [Install the SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
* NodeJS  - [Install Node.js 22](https://nodejs.org/en/), including the NPM package management tool.
* AWS profile 'quizdash' configured for a target AWS account, which has requiremed AWS permissions

## Deployment Dependencies
The following stacks have already been deployed to your target AWS environment:
1. qd-infra-base
2. qd-app-login


To build and deploy your application, run the following in your shell:

```bash
deploy.sh
```


See the [AWS SAM developer guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html) for an introduction to SAM specification, the SAM CLI, and serverless application concepts.
