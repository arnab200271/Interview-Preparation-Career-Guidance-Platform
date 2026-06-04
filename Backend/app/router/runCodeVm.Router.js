const express = require('express');
const runcodeVmconntroller = require('../controller/runcodeVmconntroller');
const router = express.Router()
router.post("/run-code-vm", runcodeVmconntroller.runCode);
module.exports = router