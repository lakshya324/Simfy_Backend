import dotenv from "dotenv";

dotenv.config();

export const port = process.env.PORT || 8080;
export const mongoDbUri = process.env.MONGODB_URI!;
export const secretKey = process.env.SECRET_KEY!;
export const saltRounds = +process.env.SALT_ROUNDS!;
export const transporter ={
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
}
export const url = process.env.URL!;
export const tempTime = process.env.TEMP_TIME || 120; // 120 seconds = 2 minutes
export const jwtExpireTime = process.env.JWT_EXPIRE_TIME || "1h"; // 1 hour
export const emailCoolDownTimeinMin = +process.env.EMAIL_COOLDOWN_TIME!; // in minute
export const expireTimeOTP = +process.env.OTP_EXPIRE_TIME!; // in minute
export const imageSize = +process.env.IMAGE_SIZE!; // in Mb

export const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID!;
export const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY!;
export const awsRegion = process.env.AWS_REGION || "ap-south-1";
export const s3BucketName = process.env.S3_BUCKET_NAME!;
//foldername /images/uploads/
export const uploadFolderName = process.env.UPLOAD_FOLDER_NAME!;