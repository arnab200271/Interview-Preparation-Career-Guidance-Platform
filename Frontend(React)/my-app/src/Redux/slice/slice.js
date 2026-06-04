import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { end_point } from "../../../api/api_url/api_Url";
import axiosInstance from "../../../api/axiosInstance/axiosInstnace";

const {
  //auth
  register,
  login,
  verify,
  resendverify,
  profile,
  profileUpdate,
  forgetPassword,
  resetPassword,
  changePassword,
  getAllUsers,
  //resume
  Alltemplate,
  createResume,
  getResume,
  updateResume,
  updatesinglefield,
  dowuloadResume,
  deleteResume,
  //category
  createcategory: createcategoryApi,
  getAllcategory: getcategoryApi,
  singleCategory: singleCategoryApi,
  updatecategory: updateCategoryApi,
  deletecategory: deleteCategoryApi,
  //test
  createTest,
  getTest,
  getsingleTest,
  updateTest,
  deleteTest,
  //question
  createquestion,
  getquestion,
  updatequestion,
  deletequestion,
  getAllquestion,
  //answer submit
  submitTest,
  singleResult,
  myResult,
  leaderboard,
  getAnalytics,
} = end_point;

// =========================
// INITIAL STATE
// =========================

const initialState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
  success: null,
  loginStatus: null, // null | 'success' | 'error'
  registerStatus: null, // null | 'success' | 'error'
  resendStatus: null, // null | 'success' | 'error'
  forgotPasswordStatus: null, // null | 'pending' | 'success' | 'error'
  resetPasswordStatus: null, // null | 'pending' | 'success' | 'error'
  registeredEmail: null, // email saved after register so resend page can pre-fill
  templates: [], // list of templates
  userResumes: [], // resumes created by user
  currentResume: null, // active resume
  isResumeLoading: false,
  resumeError: null,
  categories: [],
  singleCategory: null,
  tests: [],
  questions: [],
  singleTest: null,
  // submit result response
  submittedResult: null,

  // single result (detail page)
  singleResult: null,

  // user all results history
  myResults: [],

  // leaderboard data
  leaderboard: [],

  // stats (optional future use)
  stats: {
    totalAttempts: 0,
    totalPass: 0,
    totalFail: 0,
  },
  analyticsData: null,
  analyticsLoading: false,
  analyticsError: null,
  users: [],
  usersLoading: false,
  usersError: null,
};

// =========================
// REGISTER
// =========================

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, thunkAPI) => {
    try {
      const res = await axiosInstance.post(register, userData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Registration Failed",
      );
    }
  },
);

// =========================
// LOGIN
// =========================

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, thunkAPI) => {
    try {
      const res = await axiosInstance.post(login, userData);

      // save token
      // token save
      localStorage.setItem("token", res.data.token);

      // user save
      localStorage.setItem("user", JSON.stringify(res.data.data));

      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Login Failed");
    }
  },
);

// =========================
// VERIFY EMAIL
// =========================

export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  async (token, thunkAPI) => {
    try {
      const res = await axiosInstance.get(verify.replace(":token", token));

      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Verification Failed",
      );
    }
  },
);

// =========================
// RESEND VERIFICATION
// =========================

export const resendVerification = createAsyncThunk(
  "auth/resendVerification",
  async (email, thunkAPI) => {
    try {
      const res = await axiosInstance.post(resendverify, { email });

      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Resend Failed");
    }
  },
);

// =========================
// GET PROFILE
// =========================

export const getProfile = createAsyncThunk(
  "auth/getProfile",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get(profile);

      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Profile Fetch Failed",
      );
    }
  },
);

// =========================
// UPDATE PROFILE
// =========================

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, thunkAPI) => {
    try {
      const res = await axiosInstance.put(profileUpdate, profileData);

      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Profile Update Failed",
      );
    }
  },
);

// =========================
// FORGOT PASSWORD
// =========================

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email, thunkAPI) => {
    try {
      const res = await axiosInstance.post(forgetPassword, { email });

      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Forgot Password Failed",
      );
    }
  },
);

// =========================
// RESET PASSWORD
// =========================

export const resetUserPassword = createAsyncThunk(
  "auth/resetUserPassword",
  async ({ token, newPassword, confirmPassword }, thunkAPI) => {
    try {
      const res = await axiosInstance.post(
        resetPassword.replace(":token", token),
        { newPassword, confirmPassword },
      );

      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Reset Password Failed",
      );
    }
  },
);

// =========================
// CHANGE PASSWORD
// =========================

export const changeUserPassword = createAsyncThunk(
  "auth/changeUserPassword",
  async (passwordData, thunkAPI) => {
    try {
      const res = await axiosInstance.post(changePassword, passwordData);

      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Change Password Failed",
      );
    }
  },
);

// =========================
// RESUME ACTIONS
// =========================

export const fetchTemplates = createAsyncThunk(
  "resume/fetchTemplates",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get(Alltemplate);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to fetch templates",
      );
    }
  },
);

export const fetchUserResumes = createAsyncThunk(
  "resume/fetchUserResumes",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get(getResume);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to fetch resumes",
      );
    }
  },
);

export const createUserResume = createAsyncThunk(
  "resume/createUserResume",
  async (resumeData, thunkAPI) => {
    try {
      const res = await axiosInstance.post(createResume, resumeData);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to create resume",
      );
    }
  },
);

export const updateUserResume = createAsyncThunk(
  "resume/updateUserResume",
  async ({ id, resumeData }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(
        updateResume.replace(":id", id),
        resumeData,
      );
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to update resume",
      );
    }
  },
);

export const updateResumeSingleField = createAsyncThunk(
  "resume/updateResumeSingleField",
  async ({ id, fieldData }, thunkAPI) => {
    try {
      const res = await axiosInstance.put(
        updatesinglefield.replace(":id", id),
        fieldData,
      );
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to update resume field",
      );
    }
  },
);

export const deleteUserResume = createAsyncThunk(
  "resume/deleteUserResume",
  async (id, thunkAPI) => {
    try {
      const res = await axiosInstance.delete(deleteResume.replace(":id", id));
      return { id, data: res.data };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to delete resume",
      );
    }
  },
);
// ================= CREATE CATEGORY =================
export const createCategory = createAsyncThunk(
  "category/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(createcategoryApi, data);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Create category failed");
    }
  },
);
// ================= GET ALL CATEGORY =================
export const getAllCategory = createAsyncThunk(
  "category/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(getcategoryApi);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Fetch category failed");
    }
  },
);
// ================= GET SINGLE CATEGORY =================
export const getSingleCategory = createAsyncThunk(
  "category/getSingle",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${singleCategoryApi}/${id}`);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Single category fetch failed",code
      );
    }
  },
);
// ================= UPDATE CATEGORY =================
export const updateCategory = createAsyncThunk(
  "category/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        `${updateCategoryApi}/${id}`,
        data,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Update category failed");
    }
  },
);
// ================= DELETE CATEGORY =================
export const deleteCategory = createAsyncThunk(
  "category/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`${deleteCategoryApi}/${id}`);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Delete category failed");
    }
  },
);
// CREATE TEST
export const createTestThunk = createAsyncThunk(
  "test/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(createTest, data);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Create test failed");
    }
  },
);

// GET ALL TEST
export const getTestThunk = createAsyncThunk(
  "test/getall",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(getTest);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Fetch test failed");
    }
  },
);

// GET SINGLE TEST
export const getSingleTestThunk = createAsyncThunk(
  "test/single",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        getsingleTest.replace(":id", id),
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Fetch single test failed",
      );
    }
  },
);

// UPDATE TEST
export const updateTestThunk = createAsyncThunk(
  "test/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        updateTest.replace(":id", id),
        data,
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Update test failed");
    }
  },
);

// DELETE TEST
export const deleteTestThunk = createAsyncThunk(
  "test/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(
        deleteTest.replace(":id", id),
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Delete test failed");
    }
  },
);
//======================
//Question
//======================
//CREATE QUESTION
export const createQuestionThunk = createAsyncThunk(
  "question/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(createquestion, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          success: false,
          message: "Something went wrong",
        },
      );
    }
  },
);
//GET QUESTION By test Id
export const getQuestionThunk = createAsyncThunk(
  "question/get",
  async (testId, { rejectWithValue }) => {
    try {
      const url = getquestion.replace(":testId", testId);
      const response = await axiosInstance.get(url);
      console.log("Get responce from redux", response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          success: false,
          message: "Something went wrong",
        },
      );
    }
  },
);
//Get All question
export const getAllQuestionThunk = createAsyncThunk(
  "questions/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(getAllquestion);

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch questions",
      );
    }
  },
);
//UPDATE QUESTION
export const updateQuestionThunk = createAsyncThunk(
  "question/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const url = updatequestion.replace(":id", id);
      const response = await axiosInstance.put(url, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          success: false,
          message: "Something went wrong",
        },
      );
    }
  },
);
//DELETE QUESTION
export const deleteQuestionThunk = createAsyncThunk(
  "question/delete",
  async (id, { rejectWithValue }) => {
    try {
      const url = deletequestion.replace(":id", id);
      const response = await axiosInstance.delete(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          success: false,
          message: "Something went wrong",
        },
      );
    }
  },
);
//=================
/// Submit Answer
//=================
export const submitTestThunk = createAsyncThunk(
  "result/submitTest",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(submitTest, payload);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Submit test failed",
      );
    }
  },
);
//===================
//Get Single Result
//===================
export const getSingleResultThunk = createAsyncThunk(
  "result/single",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`${singleResult}/${id}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get result",
      );
    }
  },
);
//===============
// My Result
//================
export const getMyResultsThunk = createAsyncThunk(
  "result/myResults",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(myResult);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get my results",
      );
    }
  },
);

//===================
// Get Admin Analytics
//===================
export const getAdminAnalytics = createAsyncThunk(
  "admin/analytics",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(getAnalytics);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get analytics",
      );
    }
  },
);

//===================
// Get All Users (Admin)
//===================
export const getAllUsersThunk = createAsyncThunk(
  "admin/getAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(getAllUsers);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get users",
      );
    }
  },
);
//=================
//Leader Board
//=================
export const getLeaderboardThunk = createAsyncThunk(
  "result/leaderboard",
  async (testId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`${leaderboard}/${testId}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to load leaderboard",
      );
    }
  },
);
// =========================
// Slice
// =========================

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.templates = [];
      state.userResumes = [];
      state.currentResume = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    },

    setCurrentResume: (state, action) => {
      state.currentResume = action.payload;
    },
    clearResumeError: (state) => {
      state.resumeError = null;
    },
    clearStatus: (state) => {
      state.loginStatus = "";
      state.registerStatus = null;
      state.resendStatus = null;
      state.forgotPasswordStatus = null;
      state.resetPasswordStatus = null;
      state.error = null;
      state.success = false;
    },
     // RESET RESULT STATE
    resetResultState: (state) => {
      state.submittedResult = null;
      state.singleResult = null;
      state.error = null;
    },
  },
  
  extraReducers: (builder) => {
    builder

      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.registerStatus = null;
        state.error = null;
      })

      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload;
        state.registerStatus = "success";
        // Save the email so resend page can pre-fill
        state.registeredEmail = action.payload?.email || null;
      })

      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.registerStatus = "error";
      })

      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.loginStatus = null;
        state.error = null;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data;
        state.token = action.payload.token;
        state.error = null;
        state.loginStatus = "success";
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.loginStatus = "error";
      })

      // RESEND VERIFICATION
      .addCase(resendVerification.pending, (state) => {
        state.isLoading = true;
        state.resendStatus = null;
        state.error = null;
      })

      .addCase(resendVerification.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = action.payload;
        state.error = null;
        state.resendStatus = "success";
      })

      .addCase(resendVerification.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.resendStatus = "error";
      })

      // FORGOT PASSWORD
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.forgotPasswordStatus = "pending";
        state.error = null;
      })

      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.forgotPasswordStatus = "success";
        state.success = action.payload;
        state.error = null;
      })

      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.forgotPasswordStatus = "error";
        state.error = action.payload;
      })

      // RESET PASSWORD
      .addCase(resetUserPassword.pending, (state) => {
        state.isLoading = true;
        state.resetPasswordStatus = "pending";
        state.error = null;
      })

      .addCase(resetUserPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resetPasswordStatus = "success";
        state.success = action.payload;
        state.error = null;
      })

      .addCase(resetUserPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.resetPasswordStatus = "error";
        state.error = action.payload;
      })

      // PROFILE GET
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data;
        state.error = null;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.error = action.payload;
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      })

      // PROFILE UPDATE
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        // Merge updated fields into user
        if (action.payload?.data) {
          state.user = action.payload.data;
        }
      })

      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // FETCH TEMPLATES
      .addCase(fetchTemplates.pending, (state) => {
        state.isResumeLoading = true;
        state.resumeError = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.isResumeLoading = false;
        state.templates = action.payload?.data || action.payload || [];
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.isResumeLoading = false;
        state.resumeError = action.payload;
      })

      // FETCH USER RESUMES
      .addCase(fetchUserResumes.pending, (state) => {
        state.isResumeLoading = true;
        state.resumeError = null;
      })
      .addCase(fetchUserResumes.fulfilled, (state, action) => {
        state.isResumeLoading = false;
        state.userResumes = action.payload?.data || action.payload || [];
      })
      .addCase(fetchUserResumes.rejected, (state, action) => {
        state.isResumeLoading = false;
        state.resumeError = action.payload;
      })

      // CREATE RESUME
      .addCase(createUserResume.pending, (state) => {
        state.isResumeLoading = true;
        state.resumeError = null;
      })
      .addCase(createUserResume.fulfilled, (state, action) => {
        state.isResumeLoading = false;
        const newResume = action.payload?.data || action.payload;
        state.currentResume = newResume;
        if (newResume) {
          state.userResumes.push(newResume);
        }
      })
      .addCase(createUserResume.rejected, (state, action) => {
        state.isResumeLoading = false;
        state.resumeError = action.payload;
      })

      // UPDATE RESUME
      .addCase(updateUserResume.pending, (state) => {
        state.isResumeLoading = true;
        state.resumeError = null;
      })
      .addCase(updateUserResume.fulfilled, (state, action) => {
        state.isResumeLoading = false;
        const updated = action.payload?.data || action.payload;
        state.currentResume = updated;
        state.userResumes = state.userResumes.map((r) =>
          r._id === updated?._id ? updated : r,
        );
      })
      .addCase(updateUserResume.rejected, (state, action) => {
        state.isResumeLoading = false;
        state.resumeError = action.payload;
      })

      // UPDATE SINGLE FIELD
      .addCase(updateResumeSingleField.fulfilled, (state, action) => {
        const updated = action.payload?.data || action.payload;
        state.currentResume = updated;
        state.userResumes = state.userResumes.map((r) =>
          r._id === updated?._id ? updated : r,
        );
      })

      // DELETE RESUME
      .addCase(deleteUserResume.pending, (state) => {
        state.isResumeLoading = true;
        state.resumeError = null;
      })
      .addCase(deleteUserResume.fulfilled, (state, action) => {
        state.isResumeLoading = false;
        state.userResumes = state.userResumes.filter(
          (r) => r._id !== action.payload.id,
        );
        if (state.currentResume?._id === action.payload.id) {
          state.currentResume = null;
        }
      })
      .addCase(deleteUserResume.rejected, (state, action) => {
        state.isResumeLoading = false;
        state.resumeError = action.payload;
      })
      //================
      //Category Management
      //==================
      // ================= CREATE =================
      .addCase(createCategory.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(createCategory.fulfilled, (state, action) => {
        state.isLoading = false;

        state.categories.push(action.payload.data);

        state.message = action.payload.message;
      })

      .addCase(createCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = true;

        state.message = action.payload?.message;
      })

      // ================= GET ALL =================
      .addCase(getAllCategory.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(getAllCategory.fulfilled, (state, action) => {
        state.isLoading = false;

        state.categories = action.payload.data;
      })

      .addCase(getAllCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = true;

        state.message = action.payload?.message;
      })

      // ================= GET SINGLE =================
      .addCase(getSingleCategory.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(getSingleCategory.fulfilled, (state, action) => {
        state.isLoading = false;

        state.singleCategory = action.payload.data;
      })

      .addCase(getSingleCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = true;

        state.message = action.payload?.message;
      })

      // ================= UPDATE =================
      .addCase(updateCategory.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(updateCategory.fulfilled, (state, action) => {
        state.isLoading = false;

        state.categories = state.categories.map((item) =>
          item._id === action.payload.data._id ? action.payload.data : item,
        );

        state.message = action.payload.message;
      })

      .addCase(updateCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = true;

        state.message = action.payload?.message;
      })

      // ================= DELETE =================
      .addCase(deleteCategory.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = true;

        state.categories = state.categories.filter(
          (item) => item._id !== action.meta.arg,
        );

        state.message = action.payload.message;
      })

      .addCase(deleteCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = true;
        state.message = action.payload?.message;
      })
      //===========Create Tset=========
      .addCase(createTestThunk.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(createTestThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;

        const newTest = action.payload?.data || action.payload?.test;
        if (newTest) {
          state.tests.unshift(newTest);
        }
        state.message = action.payload?.message || action.payload?.message;
      })

      .addCase(createTestThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = true;
        state.message = action.payload?.message;
      })
      //=========GetTest=======================
      .addCase(getTestThunk.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(getTestThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tests =
          action.payload?.data ||
          action.payload?.tests ||
          (Array.isArray(action.payload) ? action.payload : []);
        console.log(action.payload);
      })

      .addCase(getTestThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = true;

        state.message = action.payload?.message;
      })
      //============Get Singale Test=================
      .addCase(getSingleTestThunk.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(getSingleTestThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.singleTest = action.payload.data;
      })

      .addCase(getSingleTestThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = true;
        state.message = action.payload.message;
      })
      //=======Update Test==========================
      .addCase(updateTestThunk.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(updateTestThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;

        const updatedTest = action.payload?.data || action.payload?.test;
        if (updatedTest) {
          state.tests = state.tests.map((item) =>
            item._id === updatedTest._id ? updatedTest : item,
          );
        }
        state.message = action.payload?.message;
      })

      .addCase(updateTestThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = true;
        state.message = action.payload.message;
      })
      //===========Delete Test==================
      .addCase(deleteTestThunk.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(deleteTestThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;

        state.tests = state.tests.filter(
          (item) => item._id !== action.meta.arg,
        );

        state.message = action.payload.message;
      })

      .addCase(deleteTestThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = true;
        state.message = action.payload.message;
      })
      //=============Create Quetion=============
      .addCase(createQuestionThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createQuestionThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.questions.push(action.payload.data);
        }
      })
      .addCase(createQuestionThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      //=============Get Quetion by test id =============
      .addCase(getQuestionThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getQuestionThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        console.log(action.payload);
        if (action.payload.success) {
          state.questions = action.payload.data;
        }
      })
      .addCase(getQuestionThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // =========================
      // GET ALL QUESTIONS
      // =========================
      .addCase(getAllQuestionThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(getAllQuestionThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.questions = action.payload?.data || [];
      })

      .addCase(getAllQuestionThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch questions";
      })
      //=============Update Quetion=============
      .addCase(updateQuestionThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateQuestionThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.questions = state.questions.map((item) =>
            item._id === action.payload.data._id ? action.payload.data : item,
          );
        }
      })
      .addCase(updateQuestionThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      //=============Delete Quetion=============
      .addCase(deleteQuestionThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteQuestionThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.meta.arg) {
          state.questions = state.questions.filter(
            (item) => item._id !== action.meta.arg,
          );
        }
      })
      .addCase(deleteQuestionThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
    // =========================
    // SUBMIT TEST
    // =========================
    builder
      .addCase(submitTestThunk.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(submitTestThunk.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.submittedResult = action.payload.data;
      })
      .addCase(submitTestThunk.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      });

    // =========================
    // SINGLE RESULT
    // =========================
    builder
      .addCase(getSingleResultThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSingleResultThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.singleResult = action.payload.data;
      })
      .addCase(getSingleResultThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // =========================
    // MY RESULTS
    // =========================
    builder
      .addCase(getMyResultsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMyResultsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myResults = action.payload.data;
      })
      .addCase(getMyResultsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // =========================
    // LEADERBOARD
    // =========================
    builder
      .addCase(getLeaderboardThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getLeaderboardThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.leaderboard = action.payload.data;
      })
      .addCase(getLeaderboardThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // =========================
    // GET ADMIN ANALYTICS
    // =========================
    builder
      .addCase(getAdminAnalytics.pending, (state) => {
        state.analyticsLoading = true;
        state.analyticsError = null;
      })
      .addCase(getAdminAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.analyticsData = action.payload.data;
      })
      .addCase(getAdminAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.analyticsError = action.payload || "Failed to load analytics";
      });

    // =========================
    // GET ALL USERS (ADMIN)
    // =========================
    builder
      .addCase(getAllUsersThunk.pending, (state) => {
        state.usersLoading = true;
        state.usersError = null;
      })
      .addCase(getAllUsersThunk.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload.data || [];
      })
      .addCase(getAllUsersThunk.rejected, (state, action) => {
        state.usersLoading = false;
        state.usersError = action.payload || "Failed to load users";
      });
  },
});

export const { logout, setCurrentResume, clearResumeError,resetResultState } = authSlice.actions;
export default authSlice.reducer;
export const { clearStatus } = authSlice.actions;
