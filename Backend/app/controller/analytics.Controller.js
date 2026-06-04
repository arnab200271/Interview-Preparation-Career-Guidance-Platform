const User = require("../model/users.Model");
const Test = require("../model/test.Model");
const Question = require("../model/question.model");
const CodingTest = require("../model/codingTest.Model");
const CodingQuestion = require("../model/codingQuestion.Model");
const ResultModel = require("../model/answer.Model");
const CodingSubmission = require("../model/codingSubmission.Model");

class AnalyticsController {
  async getAnalytics(req, res) {
    try {
      // 1. Summary Cards Calculations
      const totalUsers = await User.countDocuments();
      const mcqTestsCount = await Test.countDocuments();
      const codingTestsCount = await CodingTest.countDocuments();
      const totalTests = mcqTestsCount + codingTestsCount;

      const mcqQuestionsCount = await Question.countDocuments();
      const codingQuestionsCount = await CodingQuestion.countDocuments();
      const totalQuestions = mcqQuestionsCount + codingQuestionsCount;

      const publishedMcqTests = await Test.countDocuments({ isPublished: true });
      const publishedCodingTests = await CodingTest.countDocuments({ isPublished: true });
      const publishedTests = publishedMcqTests + publishedCodingTests;

      // Active Users: unique candidates who attempted MCQ tests or submitted coding solutions
      const mcqActiveUsers = await ResultModel.distinct("user");
      const codingActiveUsers = await CodingSubmission.distinct("user");
      const activeUsersSet = new Set([
        ...mcqActiveUsers.map(id => id.toString()),
        ...codingActiveUsers.map(id => id.toString())
      ]);
      const activeUsers = activeUsersSet.size;

      // 2. Setup Last 6 Months Labels for Line/Bar Charts
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthsList = [];
      const now = new Date();

      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthsList.push({
          name: `${months[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`,
          month: d.getMonth(),
          year: d.getFullYear()
        });
      }

      // 3. Line Chart - Test Publishing Trends over Time
      const mcqTests = await Test.find({ isPublished: true }, "createdAt");
      const codingTests = await CodingTest.find({ isPublished: true }, "createdAt");
      const allPublishedTests = [
        ...mcqTests.map(t => ({ createdAt: t.createdAt })),
        ...codingTests.map(t => ({ createdAt: t.createdAt }))
      ];

      const testTrends = monthsList.map(m => {
        const count = allPublishedTests.filter(t => {
          if (!t.createdAt) return false;
          const d = new Date(t.createdAt);
          return d.getMonth() === m.month && d.getFullYear() === m.year;
        }).length;
        return { label: m.name, count };
      });

      // 4. Bar Chart - User Activity (Registrations, MCQ attempts, Coding Submissions)
      const allUsers = await User.find({}, "createdAt");
      const allAttempts = await ResultModel.find({}, "createdAt");
      const allSubmissions = await CodingSubmission.find({}, "createdAt");

      const userActivity = monthsList.map(m => {
        const registrations = allUsers.filter(u => {
          if (!u.createdAt) return false;
          const d = new Date(u.createdAt);
          return d.getMonth() === m.month && d.getFullYear() === m.year;
        }).length;

        const attempts = allAttempts.filter(a => {
          if (!a.createdAt) return false;
          const d = new Date(a.createdAt);
          return d.getMonth() === m.month && d.getFullYear() === m.year;
        }).length;

        const submissions = allSubmissions.filter(s => {
          if (!s.createdAt) return false;
          const d = new Date(s.createdAt);
          return d.getMonth() === m.month && d.getFullYear() === m.year;
        }).length;

        return {
          label: m.name,
          registrations,
          attempts,
          submissions
        };
      });

      // 5. Doughnut Chart - Question Difficulty Distribution (Easy, Medium, Hard)
      let easyCount = 0;
      let mediumCount = 0;
      let hardCount = 0;

      // Group MCQ Questions by Test Difficulty
      const mcqTestsList = await Test.find({}, "difficulty");
      const testDifficultyMap = {};
      mcqTestsList.forEach(t => {
        testDifficultyMap[t._id.toString()] = t.difficulty;
      });

      const mcqQuestionsList = await Question.find({}, "test");
      mcqQuestionsList.forEach(q => {
        if (q.test) {
          const diff = testDifficultyMap[q.test.toString()] || "Easy";
          if (diff.toLowerCase() === "easy") easyCount++;
          else if (diff.toLowerCase() === "medium") mediumCount++;
          else if (diff.toLowerCase() === "hard") hardCount++;
        } else {
          easyCount++; // fallback
        }
      });

      // Group Coding Questions by their direct difficulty field
      const codingQuestionsList = await CodingQuestion.find({}, "difficulty");
      codingQuestionsList.forEach(q => {
        const diff = q.difficulty || "easy";
        if (diff.toLowerCase() === "easy") easyCount++;
        else if (diff.toLowerCase() === "medium") mediumCount++;
        else if (diff.toLowerCase() === "hard") hardCount++;
      });

      const difficultyDistribution = [
        { name: "Easy", count: easyCount },
        { name: "Medium", count: mediumCount },
        { name: "Hard", count: hardCount }
      ];

      // 6. Pie Chart - Submission Results
      const codingSubmissionsList = await CodingSubmission.find({}, "finalResult");
      const resultsCounts = {
        accepted: 0,
        partially_accepted: 0,
        wrong_answer: 0,
        compile_error: 0,
        runtime_error: 0,
        time_limit_exceeded: 0,
        memory_limit_exceeded: 0,
        none: 0
      };

      codingSubmissionsList.forEach(s => {
        const res = s.finalResult || "none";
        if (resultsCounts.hasOwnProperty(res)) {
          resultsCounts[res]++;
        } else {
          resultsCounts.none++;
        }
      });

      const submissionVerdict = Object.keys(resultsCounts).map(key => ({
        name: key.replace(/_/g, " ").toUpperCase(),
        count: resultsCounts[key]
      })).filter(item => item.count > 0); // Only return results that have counts to make pie chart neat, or fallback to zero if everything is empty

      // If everything is zero, add default empty item to prevent empty charts
      if (submissionVerdict.length === 0) {
        submissionVerdict.push({ name: "NO SUBMISSIONS", count: 0 });
      }

      // 7. Recent Activities & Latest Submissions
      const recentMcqAttempts = await ResultModel.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "name email")
        .populate("test", "title difficulty");

      const recentCodingSubmissions = await CodingSubmission.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "name email")
        .populate("codingTest", "title difficulty")
        .populate("question", "title");

      return res.status(200).json({
        success: true,
        data: {
          summary: {
            totalUsers,
            totalTests,
            totalQuestions,
            publishedTests,
            activeUsers
          },
          testTrends,
          userActivity,
          difficultyDistribution,
          submissionVerdict,
          recentMcqAttempts,
          recentCodingSubmissions
        }
      });
    } catch (error) {
      console.error("Analytics aggregation error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error aggregating analytics data."
      });
    }
  }
}

module.exports = new AnalyticsController();
