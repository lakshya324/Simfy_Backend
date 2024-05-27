import { S3Client } from "@aws-sdk/client-s3";
import { awsAccessKeyId, awsSecretAccessKey, awsRegion } from "./config";

const s3Client = new S3Client({
  credentials: {
    accessKeyId: awsAccessKeyId,
    secretAccessKey: awsSecretAccessKey,
  },
  region: awsRegion,
});

export default s3Client;
