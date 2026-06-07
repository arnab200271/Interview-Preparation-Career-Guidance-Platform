const CodingTest = require("../model/codingTest.Model");
const CodingQuestion = require("../model/codingQuestion.Model");
const categoryModel = require("../model/category.Model");
const { getIO } = require("../../SoketIo/socket");
const notificationmodel = require("../model/notification.Model");

// Simple local slugify helper
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
};

class codingTestController {
  // ==========================================
  // CREATE CODING TEST (Admin Only)
  // ==========================================
  async createCodingTest(req, res) {
    try {
      const { title, slug, description, category, duration, difficulty, instructions } = req.body;
      const userId = req.user.id || req.user._id;

      // Validate required fields
      if (!title || !description || !category || !duration) {
        return res.status(400).json({
          success: false,
          message: "Title, description, category, and duration are required fields",
        });
      }

      // Check category existence
      const categoryExists = await categoryModel.findById(category);
      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      // Handle slug generation or verification
      let finalSlug = slug ? generateSlug(slug) : generateSlug(title);
      const slugExists = await CodingTest.findOne({ slug: finalSlug });
      if (slugExists) {
        // Append random string to ensure uniqueness if custom slug conflicts
        finalSlug = `${finalSlug}-${Math.random().toString(36).substring(2, 7)}`;
      }

      const codingTest = await CodingTest.create({
        title,
        slug: finalSlug,
        description,
        category,
        duration,
        difficulty: difficulty || "easy",
        instructions: instructions || "",
        codingQuestions: [],
        createdBy: userId,
      });

      return res.status(201).json({
        success: true,
        message: "Coding test created successfully",
        data: codingTest,
      });
    } catch (error) {
      console.error("Create Coding Test Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // ==========================================
  // UPDATE CODING TEST (Admin Only)
  // ==========================================
  async updateCodingTest(req, res) {
    try {
      const { id } = req.params;
      const { title, slug, description, category, duration, difficulty, instructions, isPublished, isActive } = req.body;
      const userId = req.user.id || req.user._id;

      const codingTest = await CodingTest.findById(id);
      if (!codingTest) {
        return res.status(404).json({
          success: false,
          message: "Coding test not found",
        });
      }

      // Verify creator/admin permissions if strict checks are needed
      if (req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin role required.",
        });
      }

      // Validate category if updated
      if (category) {
        const categoryExists = await categoryModel.findById(category);
        if (!categoryExists) {
          return res.status(404).json({
            success: false,
            message: "Category not found",
          });
        }
        codingTest.category = category;
      }

      // Handle slug update
      if (slug) {
        const finalSlug = generateSlug(slug);
        const slugExists = await CodingTest.findOne({ slug: finalSlug, _id: { $ne: id } });
        if (slugExists) {
          return res.status(400).json({
            success: false,
            message: "Slug already exists. Please choose a different slug.",
          });
        }
        codingTest.slug = finalSlug;
      } else if (title && title !== codingTest.title) {
        // If title changes but no custom slug is specified, update slug
        let finalSlug = generateSlug(title);
        const slugExists = await CodingTest.findOne({ slug: finalSlug, _id: { $ne: id } });
        if (slugExists) {
          finalSlug = `${finalSlug}-${Math.random().toString(36).substring(2, 7)}`;
        }
        codingTest.slug = finalSlug;
      }

      if (title) codingTest.title = title;
      if (description) codingTest.description = description;
      if (duration) codingTest.duration = duration;
      if (difficulty) codingTest.difficulty = difficulty;
      if (instructions !== undefined) codingTest.instructions = instructions;
      const wasPublished = codingTest.isPublished;
      if (isPublished !== undefined) codingTest.isPublished = isPublished;
      if (isActive !== undefined) codingTest.isActive = isActive;

      await codingTest.save();

      // Emit notification when a test is freshly published
      if (!wasPublished && codingTest.isPublished) {
        const notifPayload = {
          title: "New Coding Challenge Published",
          message: `"${codingTest.title}" is now live. Take the challenge!`,
          type: "challenge",
          createdAt: new Date().toISOString(),
        };
        await notificationmodel.create(notifPayload);
        const io = getIO();
        if (io) io.emit("newNotification", notifPayload);
      }

      return res.status(200).json({
        success: true,
        message: "Coding test updated successfully",
        data: codingTest,
      });
    } catch (error) {
      console.error("Update Coding Test Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // ==========================================
  // DELETE CODING TEST (Admin Only)
  // ==========================================
  async deleteCodingTest(req, res) {
    try {
      const { id } = req.params;

      const codingTest = await CodingTest.findById(id);
      if (!codingTest) {
        return res.status(404).json({
          success: false,
          message: "Coding test not found",
        });
      }

      // Clean up all associated questions to prevent orphans
      await CodingQuestion.deleteMany({ codingTest: id });

      // Delete the test itself
      await CodingTest.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: "Coding test and associated questions deleted successfully",
      });
    } catch (error) {
      console.error("Delete Coding Test Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // ==========================================
  // GET ALL CODING TESTS (Authenticated)
  // ==========================================
  async getAllCodingTests(req, res) {
    try {
      const user = req.user;
      let filter = {};

      // If user is candidate, filter by active and published
      if (!user || user.role !== "admin") {
        filter = { isActive: true, isPublished: true };
      }

      const codingTests = await CodingTest.find(filter)
        .populate("category", "name slug")
        .populate("createdBy", "name email role")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        total: codingTests.length,
        data: codingTests,
      });
    } catch (error) {
      console.error("Get All Coding Tests Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // ==========================================
  // GET SINGLE CODING TEST (Authenticated)
  // ==========================================
  async getSingleCodingTest(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      // Find test by ID or slug
      const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
      const query = isObjectId ? { _id: id } : { slug: id.toLowerCase() };

      const codingTest = await CodingTest.findOne(query)
        .populate("category", "name slug")
        .populate("createdBy", "name email role")
        .populate({
          path: "codingQuestions",
          // For candidates, we don't send the full testcases to avoid leaks
          // But we populate title, slug, statement, difficulty, etc.
          select: user.role === "admin" 
            ? "-createdAt -updatedAt" 
            : "-testCases -createdAt -updatedAt"
        });

      if (!codingTest) {
        return res.status(404).json({
          success: false,
          message: "Coding test not found",
        });
      }

      // Candidates cannot view draft or inactive tests
      if ((!user || user.role !== "admin") && (!codingTest.isPublished || !codingTest.isActive)) {
        return res.status(403).json({
          success: false,
          message: "This test is not available",
        });
      }

      return res.status(200).json({
        success: true,
        data: codingTest,
      });
    } catch (error) {
      console.error("Get Single Coding Test Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
}

module.exports = new codingTestController();
