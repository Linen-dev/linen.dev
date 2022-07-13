function isUsingAwsRole() {
  // fargate has roles already, no need to set up
  return (process.env.LONG_RUNNING as string) === 'true';
}

export const awsCredentials = isUsingAwsRole()
  ? {}
  : {
      region: process.env.S3_UPLOAD_REGION as string,
      credentials: {
        accessKeyId: process.env.S3_UPLOAD_KEY as string,
        secretAccessKey: process.env.S3_UPLOAD_SECRET as string,
      },
    };
