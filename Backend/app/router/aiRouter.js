const express = require("express");
const router = express.Router();

const AiController = require("../controller/aiController");

router.post("/chat", AiController.chatWithAI);

module.exports = router;