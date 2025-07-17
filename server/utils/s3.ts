//utils/s3.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

export const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
const requiredEnvs = [
  "AWS_REGION",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_S3_BUCKET",
];
for (const env of requiredEnvs) {
  if (!process.env[env]) throw new Error(`Missing env variable: ${env}`);
}

export const uploadToS3 = async (file: File | Express.Multer.File) => {
  const buffer = file instanceof File ? await file.arrayBuffer() : file.buffer;

  const fileName = file instanceof File ? file.name : file.originalname;

  const sanitizedKey = `${Date.now()}-${fileName.replace(
    /[^a-zA-Z0-9.\-_]/g,
    "_"
  )}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: sanitizedKey,
    Body: Buffer.from(buffer),
    ContentType: file instanceof File ? file.type : file.mimetype,
  });

  await s3.send(command);

  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${sanitizedKey}`;
};
