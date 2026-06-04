const Testmodel = require("../model/test.Model");
const categoryModel = require("../model/category.Model");

class testController {
  //create test
  async createTest(req, res) {
    // ===============================
    // Create Test
    // ===============================
    try {
      const { title, categoryId, description, duration, difficulty } = req.body;
      const user = req.user;
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      if (user.role !== "admin") {
        return res.status(400).json({
          status: false,
          message: "Only admin can create test",
        });
      }
      if (!title || !categoryId || !description || !duration || !difficulty) {
        return res.status(403).json({
          success: false,
          message: "All fields are required",
        });
      }
      const categoryexist = await categoryModel.findById(categoryId);

      if (!categoryexist) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }
      const test = await Testmodel.create({
        title,
        categoryId,
        description,
        duration,
        difficulty,
        isPublished: false,
        createBy: user._id,
      });
      return res.status(201).json({
        success: true,
        data: test,
        message: "Test create successfully",
      });
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        success: false,
        message: "Internel server error",
      });
    }
  }
  // ===============================
  // GET ALL TESTS
  // ===============================
  async getTests(req, res) {
    try {
      const user = req.user;

      let tests;

      // ADMIN → all tests
      if (user && user.role === "admin") {
        tests = await Testmodel.find()
          .populate("categoryId", "name slug")
          .populate("createdBy", "name email")
          .sort({ createdAt: -1 });
      } else {
        // NORMAL USER → only published tests
        tests = await Testmodel.find({
          isPublished: true,
        })
          .populate("categoryId", "name slug")
          .populate("createdBy", "name email")
          .sort({ createdAt: -1 });
      }

      return res.status(200).json({
        success: true,
        total: tests.length,
        data: tests,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // ===============================
  // GET SINGLE TEST
  // ===============================
  async getSingleTest(req, res) {
    try {
      const { id } = req.params;

      const user = req.user;

      // FIND TEST
      const test = await Testmodel.findById(id)
        .populate("category", "name slug")
        .populate("createdBy", "name email");

      // TEST NOT FOUND
      if (!test) {
        return res.status(404).json({
          success: false,
          message: "Test not found",
        });
      }

      // NORMAL USER CAN'T SEE DRAFT TEST
      if ((!user || user.role !== "admin") && test.isPublished === false) {
        return res.status(403).json({
          success: false,
          message: "This test is not published yet",
        });
      }

      return res.status(200).json({
        success: true,
        data: test,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
  //====================
  //Update Test
  //=====================

  async Updatetest(req, res) {
    try {
      const user = req.user;

      const testId = req.params.id;

      const {
        title,
        categoryId,
        description,
        duration,
        difficulty,
        isPublished,
      } = req.body;

      // user check
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // admin check
      if (user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Only admin can update test",
        });
      }

      // find test
      const test = await Testmodel.findById(testId);

      if (!test) {
        return res.status(404).json({
          success: false,
          message: "Test not found",
        });
      }

      // category check
      if (categoryId) {
        const category = await categoryModel.findById(categoryId);

        if (!category) {
          return res.status(404).json({
            success: false,
            message: "Invalid category",
          });
        }

        test.category = categoryId;
      }

      // update fields
      if (title) test.title = title;

      if (description) test.description = description;

      if (duration) test.duration = duration;

      if (difficulty) test.difficulty = difficulty;

      if (typeof isPublished === "boolean") {
        test.isPublished = isPublished;
      }

      // save
      await test.save();

      return res.status(200).json({
        success: true,
        message: "Test updated successfully",
        data: test,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  //=====================
  //Delete test
  //=====================
  async deleteTest(req, res) {
    try {
      const user = req.user;

      const testId = req.params.id;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized user",
        });
      }

      if (user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Only admin can delete test",
        });
      }

      const test = await Testmodel.findById(testId);

      if (!test) {
        return res.status(404).json({
          success: false,
          message: "Test not found",
        });
      }

      

      await Testmodel.findByIdAndDelete(testId);

      return res.status(200).json({
        success: true,
        message: "Test deleted successfully",
      });
    } catch (error) {
      console.log(error)
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
module.exports = new testController();
