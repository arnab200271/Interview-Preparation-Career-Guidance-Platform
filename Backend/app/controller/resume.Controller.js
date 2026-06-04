const resumeModel = require("../model/resume.Model");
const Usermodel = require("../model/users.Model");
const cloudinary = require("../utils/Cloudinary.config");
const getTemplate = require("../utils/getTemplate");
const generateResumePDF = require("../utils/puppeteer");
const fs = require("fs");
const path = require("path");
class resumeController {
  //Get AllTemplate
  async getTemplateAll(req, res) {
    try {
      const templateDir = path.join(__dirname, "../../templates");

      const files = fs.readdirSync(templateDir);

      const templates = files
        .filter((file) => file.endsWith(".html"))
        .map((file) => {
          const id = file.replace(".html", "");

          return {
            id,
            name: id.charAt(0).toUpperCase() + id.slice(1) + " Resume",
            previewImage: `/templates/${id}.png`,
          };
        });

      return res.status(200).json({
        success: true,
        data: templates,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to load templates",
      });
    }
  }
  //create resume
  async createResume(req, res) {
    try {
      const {
        title,
        summary,
        skills,
        education,
        experience,
        projects,
        languages,
        certifications,
        linkedin,
        github,
        portfolio,
        template,
        themeColor,
        fullName,
        email,
        phone,
        location,
      } = req.body;
      const userId = req.user.id;
      const user = userId;
      let resumeImage_url = "";
      let resumePublic_id = "";
      //image
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "resumeImage",
        });
        ((resumeImage_url = result.secure_url),
          (resumePublic_id = result.public_id));
      }
      const resume = await resumeModel.create({
        user: user,
        title,
        summary,
        skills,
        education,
        experience,
        projects,
        languages,
        certifications,
        linkedin,
        github,
        portfolio,
        template,
        themeColor,
        fullName,
        email,
        phone,
        location,
        resumeImage: resumeImage_url,
        resumeImagepublic_Id: resumePublic_id,
      });
      return res.status(201).json({
        success: true,
        data: resume,
        message: "Resume create successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internel server error",
      });
    }
  }
  //// Get My Resumes

  async getMyResumes(req, res) {
    try {
      // logged in user id
      const userId = req.user.id;

      // find resumes
      const resumes = await resumeModel.find({
        user: userId,
      });

      // response
      return res.status(200).json({
        success: true,
        total: resumes.length,
        data: resumes,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
  // Update Resume

  async updateResume(req, res) {
    try {
      // resume id
      const resumeId = req.params.id;

      // logged in user
      const userId = req.user.id;

      // find resume
      const resume = await resumeModel.findById(resumeId);

      // check resume
      if (!resume) {
        return res.status(404).json({
          success: false,
          message: "Resume not found",
        });
      }

      // ownership check
      if (resume.user.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized access",
        });
      }

      // destructure body
      const {
        title,
        summary,
        skills,
        education,
        experience,
        projects,
        languages,
        certifications,
        linkedin,
        github,
        portfolio,
        template,
        themeColor,
        fullName,
        email,
        phone,
        location,
      } = req.body;

      // update resume// image update
      // update image
      if (req.file) {
        // delete old image
        if (resume.resumeImagepublic_Id) {
          await cloudinary.uploader.destroy(resume.resumeImagepublic_Id);
        }

        // upload new image
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "resumeImage",
        });

        // update image fields
        resume.resumeImage = result.secure_url;

        resume.resumeImagepublic_Id = result.public_id;
      }
      resume.title = title || resume.title;

      resume.summary = summary || resume.summary;

      resume.skills = skills || resume.skills;

      resume.education = education || resume.education;

      resume.experience = experience || resume.experience;

      resume.projects = projects || resume.projects;

      resume.languages = languages || resume.languages;

      resume.certifications = certifications || resume.certifications;

      resume.linkedin = linkedin !== undefined ? linkedin : resume.linkedin;

      resume.github = github !== undefined ? github : resume.github;

      resume.portfolio = portfolio !== undefined ? portfolio : resume.portfolio;

      resume.template = template || resume.template;

      resume.themeColor = themeColor || resume.themeColor;

      resume.fullName = fullName !== undefined ? fullName : resume.fullName;

      resume.email = email !== undefined ? email : resume.email;

      resume.phone = phone !== undefined ? phone : resume.phone;

      resume.location = location !== undefined ? location : resume.location;

      // save
      await resume.save();

      return res.status(200).json({
        success: true,
        data: resume,
        message: "Resume updated successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
  //dowunlod pdf resume
  async downloadResume(req, res) {
    try {
      const resumeId = req.params.id;
      const userId = req.user.id;

      //  Find resume
      const resumeDoc = await resumeModel.findById(resumeId).populate("user");

      if (!resumeDoc) {
        return res.status(404).json({
          success: false,
          message: "Resume not found",
        });
      }

      //  Ownership check
      const resumeUserId =
        resumeDoc.user && resumeDoc.user._id
          ? resumeDoc.user._id.toString()
          : resumeDoc.user.toString();
      if (resumeUserId !== userId) {
        return res.status(403).json({
          success: false,
          message: "Not authorized",
        });
      }

      // Convert to plain object to allow adding properties dynamically
      const resume = resumeDoc.toObject();

      // Use custom resume fields if set, otherwise fallback to the user profile defaults
      resume.name = resume.fullName || (resume.user ? resume.user.name : "");
      resume.email = resume.email || (resume.user ? resume.user.email : "");
      resume.phone = resume.phone || (resume.user ? resume.user.phone : "");
      resume.location = resume.location || (resume.user ? resume.user.location : "");
      resume.github = resume.github || (resume.user ? resume.user.github : "");
      resume.linkedin = resume.linkedin || (resume.user ? resume.user.linkedin : "");
      resume.portfolio = resume.portfolio || (resume.user ? resume.user.portfolio : "");

      //  Get template name
      const templateName = resume.template || "modern";

      //  Load HTML template
      let html = getTemplate(templateName);

      //  Replace basic fields globally
      html = html.replace(/{{name}}/g, resume.name || "");
      html = html.replace(/{{email}}/g, resume.email || "");
      html = html.replace(/{{summary}}/g, resume.summary || "");
      html = html.replace(/{{phone}}/g, resume.phone || "");
      html = html.replace(/{{location}}/g, resume.location || "");
      html = html.replace(/{{linkedin}}/g, resume.linkedin || "");
      html = html.replace(/{{github}}/g, resume.github || "");
      html = html.replace(/{{portfolio}}/g, resume.portfolio || "");
      html = html.replace(/{{title}}/g, resume.title || "");
      html = html.replace(/{{jobTitle}}/g, resume.title || "");
      html = html.replace(/{{headline}}/g, resume.title || "");
      html = html.replace(/{{resumeImage}}/g, resume.resumeImage || "");

      //  Skills
      const skillsHTML = (resume.skills || [])
        .map((skill) => `<span class="tag">${skill}</span>`)
        .join("");

      html = html.replace(/{{skills}}/g, skillsHTML);

      // Education
      const educationHTML = (resume.education || [])
        .map(
          (e) => `
         <div class="education-item">
            <div class="edu-header">
               <span class="edu-degree"><b>${e.degree || ""}</b>${e.fieldOfStudy ? " in " + e.fieldOfStudy : ""}</span>
               <span class="edu-date">${e.startYear || ""}-${e.endYear || ""}</span>
            </div>
            <div class="edu-institute">${e.institute || ""}</div>
            ${e.grade ? `<div class="edu-grade">Grade: ${e.grade}</div>` : ""}
         </div>
      `,
        )
        .join("");

      html = html.replace(/{{education}}/g, educationHTML);

      // Experience
      const experienceHTML = (resume.experience || [])
        .map(
          (e) => `
         <div class="experience-item">
            <div class="exp-header">
               <span class="exp-role"><b>${e.position || ""}</b></span>
               <span class="exp-date">${e.startDate || ""}-${e.endDate || (e.currentlyWorking ? "Present" : "")}</span>
            </div>
            <div class="exp-company">${e.company || ""}</div>
            <p class="exp-desc">${e.description || ""}</p>
         </div>
      `,
        )
        .join("");

      html = html.replace(/{{experience}}/g, experienceHTML);

      //  Projects
      const projectHTML = (resume.projects || [])
        .map(
          (p) => `
         <div class="project-item">
            <div class="project-header">
               <span class="project-title"><b>${p.title || ""}</b></span>
               <span class="project-links">
                 ${p.githubLink ? `<a href="${p.githubLink}" target="_blank">GitHub</a>` : ""}
                 ${p.liveLink ? `${p.githubLink ? " | " : ""}<a href="${p.liveLink}" target="_blank">Live Demo</a>` : ""}
               </span>
            </div>
            <p class="project-desc">${p.description || ""}</p>
            ${p.technologies && p.technologies.length > 0 ? `<div class="project-tech"><b>Technologies:</b> ${p.technologies.join(", ")}</div>` : ""}
         </div>
      `,
        )
        .join("");

      html = html.replace(/{{projects}}/g, projectHTML);

      //  Languages
      html = html.replace(/{{languages}}/g, (resume.languages || []).join(", "));

      //  Certifications
      const certHTML = (resume.certifications || [])
        .map((c) => {
          if (typeof c === "object" && c !== null) {
            return `
               <div class="certification-item">
                 <div class="cert-header">
                   <span class="cert-title"><b>${c.title || ""}</b></span>
                   ${c.issueDate ? `<span class="cert-date">${c.issueDate}</span>` : ""}
                 </div>
                 ${c.issuer ? `<div class="cert-issuer">${c.issuer}</div>` : ""}
                 ${c.certificateLink ? `<div class="cert-link"><a href="${c.certificateLink}" target="_blank">View Certificate</a></div>` : ""}
               </div>
             `;
          }
          return `<p>${c}</p>`;
        })
        .join("");

      html = html.replace(/{{certifications}}/g, certHTML);

      //  Links block
      const linkHTML = `
         <p>${resume.github || ""}</p>
         <p>${resume.linkedin || ""}</p>
         <p>${resume.portfolio || ""}</p>
      `;

      html = html.replace(/{{links}}/g, linkHTML);

      //  Generate PDF
      const pdfBuffer = await generateResumePDF(html);

      //  Send response
      res.set({
        "Content-Type": "application/pdf",

        "Content-Disposition": "attachment; filename=resume.pdf",
      });

      return res.send(pdfBuffer);
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
  //delete resume
  async deleteResume(req, res) {
    try {
      const resumeId = req.params.id;
      const user = req.user.id;
      const resume = await resumeModel.findById(resumeId);
      //find resume
      if (!resume) {
        return res.status(404).json({
          success: false,
          message: "Resume not found",
        });
      }
      //ownrship check
      if (resume.user.toString() !== user) {
        return res.status(400).json({
          success: false,
          message: "You are not owner",
        });
      }
      //clean up cloudinery
      if (resume.resumeImagepublic_Id) {
        await cloudinary.uploader.destroy(resume.resumeImagepublic_Id);
      }
      //remove resume from db
      await resumeModel.findByIdAndDelete(resumeId);
      return res.status(200).json({
        success: true,
        message: "Resume delete successfuly",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internel server error",
      });
    }
  }
}

module.exports = new resumeController();
