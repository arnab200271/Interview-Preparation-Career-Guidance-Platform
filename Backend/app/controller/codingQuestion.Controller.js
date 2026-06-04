const CodingQuestion = require("../model/codingQuestion.Model");
const CodingTest = require("../model/codingTest.Model");
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

// Sanitization utility to strip hidden test cases from candidate responses
const sanitizeQuestionForCandidate = (question) => {
  const q = question.toObject ? question.toObject() : { ...question };
  if (q.testCases) {
    // Only return sample/public test cases to candidates
    q.testCases = q.testCases.filter(
      (tc) => tc.isSample === true && tc.isHidden === false,
    );
  }
  return q;
};
//statercode
const starterCodeMap = {
  javascript: [{ language: "javascript", code: "// write JS code" }],
  nodejs: [{ language: "nodejs", code: "// write Node code" }],
  react: [{ language: "react", code: "// write React code" }],
};
class codingQuestionController {
  // ==========================================
  // CREATE CODING QUESTION (Admin Only)
  // ==========================================
  async createCodingQuestion(req, res) {
    try {
      const {
        title,
        slug,
        problemStatement,
        difficulty,
        category,
        codingTest,
        marks,
        constraints,
        examples,
        boilerplateCode,
        functionName,
        supportedLanguages,
        testCases,
        timeLimit,
        memoryLimit,
        isPublished,
        isActive,
      } = req.body;

      const userId = req.user.id || req.user._id;

      //  REQUIRED FIELDS CHECK
      if (
        !title ||
        !problemStatement ||
        !category ||
        !codingTest ||
        !testCases
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Title, problemStatement, category, codingTest, and testCases are required",
        });
      }

      //  MARKS VALIDATION
      const questionMarks = Number(marks);
      if (isNaN(questionMarks) || questionMarks < 0) {
        return res.status(400).json({
          success: false,
          message: "Marks must be a non-negative number",
        });
      }

      //  CATEGORY CHECK
      const categoryExists = await categoryModel.findById(category);
      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      //  AUTO STARTER CODE FROM CATEGORY
      const categoryKey = (categoryExists.slug || categoryExists.name || "")
        .toLowerCase()
        .trim();

      // Look for custom starterCode in request, filtering out empty entries
      let starterCode = [];
      if (req.body.starterCode && Array.isArray(req.body.starterCode)) {
        starterCode = req.body.starterCode.filter(
          (item) => item.code && item.code.trim() !== "",
        );
      }

      // Fallback if none provided or all were empty
      if (starterCode.length === 0) {
        starterCode = starterCodeMap[categoryKey];

        if (!starterCode) {
          return res.status(400).json({
            success: false,
            message: `Invalid category '${categoryKey}' for starter code`,
          });
        }
      }

      //  TEST CHECK
      const testExists = await CodingTest.findById(codingTest);
      if (!testExists) {
        return res.status(404).json({
          success: false,
          message: "Coding test not found",
        });
      }

      //  SUPPORTED LANGUAGES
      const allowedLanguages = ["javascript", "react", "nodejs"];

      if (supportedLanguages && Array.isArray(supportedLanguages)) {
        const invalidLanguages = supportedLanguages.filter(
          (l) => !allowedLanguages.includes(l),
        );

        if (invalidLanguages.length > 0) {
          return res.status(400).json({
            success: false,
            message: `Invalid language(s): ${invalidLanguages.join(", ")}`,
          });
        }
      }

      //  STARTER CODE VALIDATION (NOW SAFE)
      for (const starter of starterCode) {
        if (!starter.language || !starter.code || starter.code.trim() === "") {
          return res.status(400).json({
            success: false,
            message: "Starter code is invalid",
          });
        }
      }

      // TEST CASE VALIDATION
      if (!Array.isArray(testCases) || testCases.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one test case is required",
        });
      }

      for (const tc of testCases) {
        if (tc.input === undefined || tc.expectedOutput === undefined) {
          return res.status(400).json({
            success: false,
            message: "Each test case must contain input and expectedOutput",
          });
        }
      }

      //  SLUG GENERATION
      let finalSlug = slug ? generateSlug(slug) : generateSlug(title);

      const slugExists = await CodingQuestion.findOne({ slug: finalSlug });
      if (slugExists) {
        finalSlug = `${finalSlug}-${Math.random().toString(36).substring(2, 7)}`;
      }

      //  CREATE QUESTION
      const newQuestion = await CodingQuestion.create({
        title,
        slug: finalSlug,
        problemStatement,
        difficulty: difficulty || "easy",
        category,
        codingTest,
        marks: questionMarks,
        constraints: constraints || [],
        examples: examples || [],
        starterCode,
        boilerplateCode: boilerplateCode || "",
        functionName: functionName || "",
        supportedLanguages: supportedLanguages || ["javascript"],
        testCases,
        timeLimit: timeLimit || 2000,
        memoryLimit: memoryLimit || 512,
        isPublished: isPublished ?? false,
        isActive: isActive ?? true,
        createdBy: userId,
      });

      //  UPDATE TEST

      testExists.codingQuestions.push(newQuestion._id);
      testExists.totalMarks += questionMarks;
      testExists.isPublished = true;
      await notificationmodel.create({
        title: "New Test Published",
        message: "A new test is available now",
        type: "test",
      });
     const  io = getIO();
      io.emit("newNotification", {
        title: "New Test Published",
        message: "A new test is available now",
        type: "test",
      });
      await testExists.save();

      return res.status(201).json({
        success: true,
        message: "Coding question created successfully",
        data: newQuestion,
      });
    } catch (error) {
      console.error("Create Coding Question Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // ==========================================
  // UPDATE CODING QUESTION (Admin Only)
  // ==========================================
  async updateCodingQuestion(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const {
        category,
        codingTest,
        marks,
        slug,
        title,
        testCases,
        supportedLanguages,
      } = updates;

      const question = await CodingQuestion.findById(id);
      if (!question) {
        return res.status(404).json({
          success: false,
          message: "Coding question not found",
        });
      }

      // Verify category if updated
      if (category) {
        const categoryExists = await categoryModel.findById(category);
        if (!categoryExists) {
          return res.status(404).json({
            success: false,
            message: "Category not found",
          });
        }
        question.category = category;
      }

      // Verify languages if updated
      const allowedLanguages = ["javascript", "react", "nodejs"];
      if (supportedLanguages && Array.isArray(supportedLanguages)) {
        const invalidLanguages = supportedLanguages.filter(
          (l) => !allowedLanguages.includes(l),
        );
        if (invalidLanguages.length > 0) {
          return res.status(400).json({
            success: false,
            message: `Invalid language(s): ${invalidLanguages.join(", ")}`,
          });
        }
        question.supportedLanguages = supportedLanguages;
      }

      // Verify test cases if updated
      if (testCases !== undefined) {
        if (!Array.isArray(testCases) || testCases.length === 0) {
          return res.status(400).json({
            success: false,
            message: "Test cases cannot be empty",
          });
        }
        for (const tc of testCases) {
          if (tc.input === undefined || tc.expectedOutput === undefined) {
            return res.status(400).json({
              success: false,
              message: "Each testcase must have input and expectedOutput",
            });
          }
        }
        question.testCases = testCases;
      }

      // Handle marks adjustment in CodingTest
      if (marks !== undefined) {
        const newMarks = Number(marks);
        if (isNaN(newMarks) || newMarks < 0) {
          return res.status(400).json({
            success: false,
            message: "Marks must be a non-negative number",
          });
        }

        const oldMarks = question.marks;
        question.marks = newMarks;

        // If the question belongs to a test, adjust its totalMarks
        if (question.codingTest) {
          const test = await CodingTest.findById(question.codingTest);
          if (test) {
            test.totalMarks = test.totalMarks - oldMarks + newMarks;
            await test.save();
          }
        }
      }

      // Handle slug update
      if (slug) {
        const finalSlug = generateSlug(slug);
        const slugExists = await CodingQuestion.findOne({
          slug: finalSlug,
          _id: { $ne: id },
        });
        if (slugExists) {
          return res.status(400).json({
            success: false,
            message: "Slug already exists. Please choose a different slug.",
          });
        }
        question.slug = finalSlug;
      } else if (title && title !== question.title) {
        let finalSlug = generateSlug(title);
        const slugExists = await CodingQuestion.findOne({
          slug: finalSlug,
          _id: { $ne: id },
        });
        if (slugExists) {
          finalSlug = `${finalSlug}-${Math.random().toString(36).substring(2, 7)}`;
        }
        question.slug = finalSlug;
      }

      // Apply other fields
      const fieldsToUpdate = [
        "title",
        "problemStatement",
        "difficulty",
        "constraints",
        "examples",
        "starterCode",
        "boilerplateCode",
        "functionName",
        "timeLimit",
        "memoryLimit",
        "isPublished",
        "isActive",
      ];

      for (const field of fieldsToUpdate) {
        if (updates[field] !== undefined) {
          question[field] = updates[field];
        }
      }

      // Handle codingTest relocation (if question is moved to another test)
      if (
        codingTest &&
        codingTest.toString() !== question.codingTest?.toString()
      ) {
        const newTest = await CodingTest.findById(codingTest);
        if (!newTest) {
          return res.status(404).json({
            success: false,
            message: "New Coding test not found",
          });
        }

        // Remove from old test
        if (question.codingTest) {
          const oldTest = await CodingTest.findById(question.codingTest);
          if (oldTest) {
            oldTest.codingQuestions = oldTest.codingQuestions.filter(
              (qId) => qId.toString() !== id.toString(),
            );
            oldTest.totalMarks = Math.max(
              0,
              oldTest.totalMarks - question.marks,
            );
            await oldTest.save();
          }
        }

        // Add to new test
        newTest.codingQuestions.push(id);
        newTest.totalMarks += question.marks;
        await newTest.save();

        question.codingTest = codingTest;
      }

      await question.save();

      return res.status(200).json({
        success: true,
        message: "Coding question updated successfully",
        data: question,
      });
    } catch (error) {
      console.error("Update Coding Question Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // ==========================================
  // DELETE CODING QUESTION (Admin Only)
  // ==========================================
  async deleteCodingQuestion(req, res) {
    try {
      const { id } = req.params;

      const question = await CodingQuestion.findById(id);
      if (!question) {
        return res.status(404).json({
          success: false,
          message: "Coding question not found",
        });
      }

      // Remove from associated CodingTest and adjust totalMarks
      if (question.codingTest) {
        const test = await CodingTest.findById(question.codingTest);
        if (test) {
          test.codingQuestions = test.codingQuestions.filter(
            (qId) => qId.toString() !== id.toString(),
          );
          test.totalMarks = Math.max(0, test.totalMarks - question.marks);
          await test.save();
        }
      }

      await CodingQuestion.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message:
          "Coding question deleted and test marks recalculated successfully",
      });
    } catch (error) {
      console.error("Delete Coding Question Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  // ==========================================
  // GET CODING QUESTIONS BY TEST (Authenticated)
  // ==========================================
  async getQuestionsByTest(req, res) {
    try {
      const { testId } = req.params;
      const user = req.user;

      const test = await CodingTest.findById(testId);
      if (!test) {
        return res.status(404).json({
          success: false,
          message: "Coding test not found",
        });
      }

      // Candidates cannot get questions if test is draft/inactive
      if (
        (!user || user.role !== "admin") &&
        (!test.isPublished || !test.isActive)
      ) {
        return res.status(403).json({
          success: false,
          message: "This coding test questions are not accessible",
        });
      }

      let filter = { codingTest: testId };
      if (!user || user.role !== "admin") {
        filter.isActive = true;
        filter.isPublished = true;
      }

      const questions = await CodingQuestion.find(filter)
        .populate("category", "name slug")
        .sort({ createdAt: 1 });

      // Apply sanitization for candidate users (remove hidden test cases expected outputs)
      const sanitizedQuestions = questions.map((q) => {
        if (!user || user.role !== "admin") {
          return sanitizeQuestionForCandidate(q);
        }
        return q;
      });

      return res.status(200).json({
        success: true,
        total: sanitizedQuestions.length,
        data: sanitizedQuestions,
      });
    } catch (error) {
      console.error("Get Questions By Test Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
  //====================
  //Get All Coding Question
  //======================
  // Controller
  async getAllCodingQuestions(req, res) {
    try {
      const questions = await CodingQuestion.find()
        .populate("category", "name")
        .populate("codingTest", "title")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        total: questions.length,
        data: questions,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new codingQuestionController();
