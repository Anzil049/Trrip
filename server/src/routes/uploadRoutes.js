import { Router } from "express";
import multer from "multer";
import { protect } from "../middleware/auth.js";
import { analyzeUpload, extractUpload } from "../controllers/uploadController.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/analyze", protect, upload.single("file"), analyzeUpload);
router.post("/extract", protect, upload.single("file"), extractUpload);

export default router;

