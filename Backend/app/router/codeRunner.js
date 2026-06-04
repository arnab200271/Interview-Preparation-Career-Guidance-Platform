const express = require("express");
const router = express.Router();

const runCodeController = require("../controller/runCode.controller");

router.post("/run-code", runCodeController.runCode);

module.exports = router;