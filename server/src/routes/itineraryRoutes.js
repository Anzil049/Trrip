import { Router } from "express";
import {
  createFromTemplate,
  createShareLink,
  getItinerary,
  listItineraries,
  updatePublicVisibility,
  generateFromForm,
  deleteItinerary,
  searchItineraries,
} from "../controllers/itineraryController.js";
import { protect, optionalAuth } from "../middleware/auth.js";

const router = Router();

router.get("/search", optionalAuth, searchItineraries);

router.use(protect);
router.get("/", listItineraries);
router.post("/templates", createFromTemplate);
router.post("/generate", generateFromForm);
router.get("/:id", getItinerary);
router.delete("/:id", deleteItinerary);
router.post("/:id/share", createShareLink);
router.patch("/:id/visibility", updatePublicVisibility);

export default router;
