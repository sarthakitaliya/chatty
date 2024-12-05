import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { updateProfile } from "../controllers/profile.controller.js";

const router = express.Router();


router.put("/update-profile", protectRoute, updateProfile);

export default router;