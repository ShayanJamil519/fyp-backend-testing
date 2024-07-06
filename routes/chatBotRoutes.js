import express from "express";
import { getGPTResponse } from "../controllers/chatBotController.js";
const router = express.Router();

router.post("/getAIResponse", getGPTResponse);

export default router;
