const express = require("express");
const router = express.Router();
const upload = require("../utils/Cloudinary.uplod");
const resumeController = require("../controller/resume.Controller");
const authCheck = require("../middleware/authChek");
 //Get All template for Page
 router.get("/template/resume",resumeController.getTemplateAll)
//create resume
router.post("/create/resume",authCheck,upload.single("resumeImage"),resumeController.createResume)
//get resume
router.get("/resume",authCheck,resumeController.getMyResumes)
//update resume
router.put("/update/resume/:id",authCheck,upload.single("resumeImage"),resumeController.updateResume)
//single update
router.patch("/updatesingale/resume/:id",authCheck,upload.single("resumeImage"),resumeController.updateResume)
//dowunload resume
router.get("/resume/dowunload/:id",authCheck,resumeController.downloadResume)
//delete resume
router.delete("/resume/delete/:id",authCheck,resumeController.deleteResume)

module.exports = router