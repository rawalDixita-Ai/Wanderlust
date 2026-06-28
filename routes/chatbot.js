const express = require("express");
const router = express.Router();
const chatbotController = require("../controllers/chatbot.js");

// Chatbot panel page
router.get("/", chatbotController.getChatbot);

// API endpoint for chat messages
router.post("/message", chatbotController.chatMessage);

module.exports = router;