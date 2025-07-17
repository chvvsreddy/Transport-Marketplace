//middleware/upload.ts

import multer from "multer";

// Store files in memory (buffer)
export const upload = multer({
  storage: multer.memoryStorage(),
});
