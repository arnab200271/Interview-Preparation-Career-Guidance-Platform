export const basurl = process.env.NEXT_PUBLIC_API_URL;
export const socket_url = process.env.NEXT_PUBLIC_SOCKET_URL;
 console.log("baseurl",basurl)
export const end_point = {
  //===================
  //authentication
  //===================
  register: "/auth/register",
  login: "/auth/login",
  verify: "/auth/verify/:token",
  resendverify: "/resend/verification",
  profile: "/profile",
  profileUpdate: "/profile/update",
  forgetPassword: "/auth/forget-password",
  resetPassword: "/auth/reset-password/:token",
  changePassword: "/chanagepassword",
  getAllUsers: "/auth/users",
  //==================
  //resume
  //==================
  Alltemplate: "/template/resume",
  createResume: "/create/resume",
  getResume: "/resume",
  updateResume: "/update/resume/:id",
  updatesinglefield: "/updatesingale/resume/:id",
  dowuloadResume: "/resume/dowunload/:id",
  deleteResume: "/resume/delete/:id",
  //============================
  //Category
  //============================
  //Category
  createcategory: "/create/category", //==>(Only Admin)
  getAllcategory: "/category", //(Public,Admin)==>both access
  singleCategory: "/category/single/:id", //(Public,Admin)==>both access
  updatecategory: "/update/category", //==>(Only Admin)
  deletecategory: "/delete/category", //==>(Only Admin)
  //======================
  //Test
  //======================
  createTest: "/create/test", //==>(Only Admin)
  getTest: "/test", //(Public,Admin)==>both access
  getsingleTest: "/single/test/:id", //(Public,Admin)==>both access
  updateTest: "/update/test/:id", //==>(Only Admin)
  deleteTest: "/delete/test/:id", //==>(Only Admin)
  //======================
  // Question
  //======================
  createquestion: "/create/question", //==>(Only Admin)
  getquestion: "/test/:testId", //(Public,Admin)==>both access
  getAllquestion: "/questions/all", ////==>(Only Admin)
  updatequestion: "/update/question/:id", //==>(Only Admin)
  deletequestion: "/delete/question/:id", //==>(Only Admin)
  //==========================
  //Answer submit & get result
  //==========================
  submitTest: "/submit/ans",
  singleResult: "/result",
  myResult: "/my-results",
  leaderboard: "/leaderboard",
  //=====================
  // Coding prcticale api
  //=======================
  vmcodeRunner: "/run-code-vm",
  //========Test===========
  createCodingTest: "/coding-test/create", //==>(Only Admin)
  getCodingTest: "/coding-test/all", //(Public,Admin)==>both access
  getSinglecodingtest: "/coding-test/single/:id", //(Public,Admin)==>both access
  updateCodingTest: "/coding-test/update/:id", //==>(Only Admin)
  deleteCodingTest: "/coding-test/delete/:id", //==>(Only Admin)
  //============Question================
  createcodingquestion: "/coding-question/create", //==>(Only Admin)
  getcodingQuestionTest: "/coding-question/test/:testId", //(Public,Admin)==>both access
  getAllCodingQuestion: "/coding-question/all", ////==>(Only Admin)
  updatecodingQuestion: "/coding-question/update/:id", //==>(Only Admin)
  deletecodingQuestion: "/coding-question/delete/:id", //==>(Only Admin)

  //===============Submisson================
  codingsubmissonrun: "/coding-submission/run", //RUN CODE (Sandbox Run - Sample Tests Only)//==>(Public)
  codingsubmitDb: "/coding-submission/submit", // SUBMIT CODE (Runs All Tests & Saves to DB)//==>(Public)
  codingsubmissonResult: "/coding-submission/save", // SAVE SUBMISSION RESULT (Simulated Webhook / Async Save)//==>(Public)
  getUserSubmissonhistory: "/coding-submission/history", // GET USER SUBMISSIONS (Query filter: testId, questionId, targetUser)//==>(Public)
  codingLeaderboard: "/coding-test/:testId/leaderboard", // GET CODING TEST LEADERBOARD //==>(Public)

  //=====================
  // Analytics / Admin Stats
  //=====================
  getAnalytics: "/admin/analytics",

  //=====================
  // Ai Chat using gemini
  ///====================
  aichat: "/chat",
};
