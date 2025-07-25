//routes/uploadRoute.ts

import express, { Request, Response } from "express";
import { upload } from "../middleware/upload";
import { uploadToS3 } from "../../utils/s3";

const router = express.Router();

router.post("/", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    const url = await uploadToS3(req.file);
    res.status(200).json({ url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "S3 upload failed" });
  }
});

export default router;
