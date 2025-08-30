environment=prod

appName=qd-app-fizzbuzzboom
stackName=$appName-$environment
deployBucket=mydeploybucket

infraBaseCFName="qd-infra-base-${environment}"
appLoginCFName="qd-app-login-${environment}"

#npm install
sam build --cached

sam deploy --template-file .aws-sam/build/template.yaml --stack-name $stackName \
--s3-bucket $deployBucket --s3-prefix $appName \
--capabilities CAPABILITY_NAMED_IAM --region ap-southeast-2 --parameter-overrides Environment=$environment \
  InfraBaseCFName="$infraBaseCFName" \
  AppLoginCFName="$appLoginCFName" \
--no-fail-on-empty-changeset \
--tags Environment=$environment StackName=$stackName  \
--profile quizdash
