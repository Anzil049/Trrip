import { Router } from "express";
import { getSharedItinerary } from "../controllers/shareController.js";

const router = Router();

router.get("/:shareToken", getSharedItinerary);

export default router;

