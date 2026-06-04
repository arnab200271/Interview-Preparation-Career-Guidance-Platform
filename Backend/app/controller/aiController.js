const { askGemini } = require("../service/geminiService");

class AiController {
  async chatWithAI(req, res) {
    try {
      const { message } = req.body;

      const reply = await askGemini(message);

      return res.status(200).json({
        success: true,
        reply,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new AiController();