
Amazon Web Services, Inc. <no-reply-aws@amazon.com>
Mon, Apr 7, 9:33 AM
to me

[Starting September 15, 2025, emails about AWS Health events will be delivered via the AWS User Notifications service. You can opt-in to this enhanced experience today. See footer for details.]

Hello,

[AWS Health may periodically trigger reminder notifications about this communication if resources remain unresolved.]

We are contacting you as we have identified that your AWS Account currently has one or more AWS Lambda functions using the Node.js 18 runtime.

We are ending support for Node.js 18 in Lambda on September 1, 2025. This follows Node.js 18 End-Of-Life (EOL) reached on April 30, 2025 [1]. End of support does not impact function execution. Your functions will continue to run. However, they will be running on an unsupported runtime which is no longer maintained or patched by the AWS Lambda team.

As described in the Lambda runtime support policy [2], end of support for language runtimes in Lambda happens in several stages.

- Starting on September 1, 2025, Lambda will no longer apply security patches and other updates to the Node.js 18 runtime used by Lambda functions, and functions using Node.js 18 will no longer be eligible for technical support. Also, Node.js 18 will no longer be available in the AWS Console, although you can still create and update functions using Node.js 18 via AWS CloudFormation, the AWS CLI, AWS Serverless Application Model (SAM), or other tools.

- Starting October 1, 2025, you will no longer be able to create new Lambda functions using the Node.js 18 runtime.

- Starting November 1, 2025, you will no longer be able to update existing functions using the Node.js 18 runtime.

We recommend that you upgrade your existing Node.js 18 functions to the latest available Node.js runtime in Lambda before September 1, 2025.

Your impacted Lambda functions using the Node.js 18 runtime are listed on the 'Affected resources' tab of your AWS Health Dashboard.

This notification is generated for functions using the Node.js 18 runtime for the $LATEST function version. The following command shows how to use the AWS CLI [3] to list all functions in a specific region that is using Node.js 18, including published function versions. To find all such functions in your account, repeat the following command for each region:

aws lambda list-functions --region us-east-1 --output text --query "Functions[?Runtime=='nodejs18.x'].FunctionArn"

Starting 180 days before deprecation, you can also use Trusted Advisor to identify all functions using the Node.js 18 runtime [4].

If you have any concerns or require further assistance, please contact AWS Support [5].

[1] https://github.com/nodejs/Release
[2] https://docs.aws.amazon.com/lambda/latest/dg/runtime-support-policy.html
[3] https://aws.amazon.com/cli/
[4] https://docs.aws.amazon.com/awssupport/latest/user/security-checks.html#aws-lambda-functions-deprecated-runtimes
[5] https://aws.amazon.com/support

Sincerely,
Amazon Web Services

Amazon Web Services, Inc. is a subsidiary of Amazon.com, Inc. Amazon.com is a registered trademark of Amazon.com, Inc. This message was produced and distributed by Amazon Web Services Inc., 410 Terry Ave. North, Seattle, WA 98109-5210

---
Reference: https://health.aws.amazon.com/health/home#/account/event-log?Event%20ARN=arn:aws:health:sa-east-1::event/LAMBDA/AWS_LAMBDA_PLANNED_LIFECYCLE_EVENT/AWS_LAMBDA_PLANNED_LIFECYCLE_EVENT_95a8af1e0c1223664993ebb43e1a49500ad11c4bc40f4d00d69a561190ce7414&amp;eventID=arn:aws:health:sa-east-1::event/LAMBDA/AWS_LAMBDA_PLANNED_LIFECYCLE_EVENT/AWS_LAMBDA_PLANNED_LIFECYCLE_EVENT_95a8af1e0c1223664993ebb43e1a49500ad11c4bc40f4d00d69a561190ce7414&amp;eventTab=details
