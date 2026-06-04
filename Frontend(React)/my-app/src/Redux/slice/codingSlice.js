import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { end_point } from "../../../api/api_url/api_Url";
import axiosInstance from "../../../api/axiosInstance/axiosInstnace";

const {
  //codingtest
  createCodingTest,
  getCodingTest,
  getSinglecodingtest,
  updateCodingTest,
  deleteCodingTest,
  //coding question
  createcodingquestion,
  getcodingQuestionTest,
  updatecodingQuestion,
  deletecodingQuestion,
  getAllCodingQuestion,
  //coding submisson
  codingsubmissonrun,
  codingsubmissonResult,
  codingsubmitDb,
  getUserSubmissonhistory,
  codingLeaderboard,
} = end_point;

// =========================
// CREATE CODING TEST
// =========================

export const createCodingTestThunk = createAsyncThunk(
  "coding/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(createCodingTest, data);

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create coding test",
      );
    }
  },
);

// =========================
// GET ALL CODING TEST ==>(Admin Only)
// =========================

export const getCodingTestThunk = createAsyncThunk(
  "coding/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(getCodingTest);
      console.log("Redux res", res.data);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch coding tests",
      );
    }
  },
);
// =========================
// GET single CODING TEST
// =========================
export const getSingleCodingTestThunk = createAsyncThunk(
  "codingTest/getSingle",
  async (testId, { rejectWithValue }) => {
    try {
      const url = getSinglecodingtest.replace(":id", testId);

      const res = await axiosInstance.get(url);

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch coding test",
      );
    }
  },
);

// =========================
// UPDATE CODING TEST
// =========================

export const updateCodingTestThunk = createAsyncThunk(
  "coding/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(
        updateCodingTest.replace(":id", id),
        data,
      );

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update coding test",
      );
    }
  },
);

// =========================
// DELETE CODING TEST
// =========================

export const deleteCodingTestThunk = createAsyncThunk(
  "coding/delete",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete(
        deleteCodingTest.replace(":id", id),
      );

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete coding test",
      );
    }
  },
);
// ==========================
// CREATE CODING QUESTION
// ==========================

export const createCodingQuestionThunk = createAsyncThunk(
  "codingQuestion/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(createcodingquestion, data);

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create coding question",
      );
    }
  },
);

// ==========================
// GET QUESTIONS BY TEST
// ==========================

export const getCodingQuestionThunk = createAsyncThunk(
  "codingQuestion/get",
  async (testId, { rejectWithValue }) => {
    try {
      const url = getcodingQuestionTest.replace(":testId", testId);

      const res = await axiosInstance.get(url);

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch coding questions",
      );
    }
  },
);
//================================
//Get All coding question Only Admin
//===============================
export const getAllCodingQuestionThunk = createAsyncThunk(
  "coding/getAllCodingQuestion",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get(getAllCodingQuestion);

      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  },
);
// ==========================
// UPDATE
// ==========================

export const updateCodingQuestionThunk = createAsyncThunk(
  "codingQuestion/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const url = updatecodingQuestion.replace(":id", id);

      const res = await axiosInstance.patch(url, data);

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update coding question",
      );
    }
  },
);

// ==========================
// DELETE
// ==========================

export const deleteCodingQuestionThunk = createAsyncThunk(
  "codingQuestion/delete",
  async (id, { rejectWithValue }) => {
    try {
      const url = deletecodingQuestion.replace(":id", id);

      const res = await axiosInstance.delete(url);

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete coding question",
      );
    }
  },
);
//=================
// Run Code
//=================
export const runCodingCodeThunk = createAsyncThunk(
  "codingSubmission/runCode",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(codingsubmissonrun, payload);

      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Run code failed");
    }
  },
);
//=================
// Submit Code
//=================
export const submitCodingCodeThunk = createAsyncThunk(
  "codingSubmission/submitCode",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(codingsubmitDb, payload);

      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Submit failed");
    }
  },
);
//=============================
// Save Submission Result
//=============================
export const saveSubmissionResultThunk = createAsyncThunk(
  "codingSubmission/saveResult",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(codingsubmissonResult, payload);

      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Save result failed");
    }
  },
);
//=================
// History
//=================
export const getSubmissionHistoryThunk = createAsyncThunk(
  "codingSubmission/history",
  async (query = "", { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`${getUserSubmissonhistory}${query}`);

      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "History fetch failed");
    }
  },
);
//=================
// Leaderboard
//=================
export const getLeaderboardThunk = createAsyncThunk(
  "codingSubmission/leaderboard",
  async (testId, { rejectWithValue }) => {
    try {
      const url = codingLeaderboard.replace(":testId", testId);

      const res = await axiosInstance.get(url);

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Leaderboard fetch failed",
      );
    }
  },
);
// =========================
// INITIAL STATE
// =========================

const initialState = {
  codingTests: [],
  codingQuestions: [],
  singleCodingTest: null,
  runResult: null,
  submissionResult: null,
  submissionHistory: [],
  leaderboard: [],
  isLoading: false,
  error: null,
  success: false,
};

// =========================
// SLICE
// =========================

const codingSlice = createSlice({
  name: "coding",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    // =========================
    // CREATE CODING TEST
    // =========================

    builder
      .addCase(createCodingTestThunk.pending, (state) => {
        state.isLoading = true;

        state.error = null;

        state.success = false;
      })

      .addCase(createCodingTestThunk.fulfilled, (state, action) => {
        state.isLoading = false;

        state.success = true;

        state.codingTests.unshift(action.payload.data);
      })

      .addCase(createCodingTestThunk.rejected, (state, action) => {
        state.isLoading = false;

        state.success = false;

        state.error = action.payload;
      })

      // =========================
      // GET ALL CODING TEST
      // =========================

      .addCase(getCodingTestThunk.pending, (state) => {
        state.isLoading = true;

        state.error = null;
      })

      .addCase(getCodingTestThunk.fulfilled, (state, action) => {
        state.isLoading = false;

        state.codingTests = action.payload.data;
      })

      .addCase(getCodingTestThunk.rejected, (state, action) => {
        state.isLoading = false;

        state.error = action.payload;
      })
      ///===================
      ///Get Singale Coding Test
      //======================
      .addCase(getSingleCodingTestThunk.pending, (state) => {
        state.isLoading = true;
      })

      .addCase(getSingleCodingTestThunk.fulfilled, (state, action) => {
        state.isLoading = false;

        if (action.payload.success) {
          state.singleCodingTest = action.payload.data;
        }
      })

      .addCase(getSingleCodingTestThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // =========================
      // UPDATE CODING TEST
      // =========================

      .addCase(updateCodingTestThunk.pending, (state) => {
        state.isLoading = true;

        state.error = null;
      })

      .addCase(updateCodingTestThunk.fulfilled, (state, action) => {
        state.isLoading = false;

        state.success = true;

        state.codingTests = state.codingTests.map((item) =>
          item._id === action.payload.data._id ? action.payload.data : item,
        );
      })

      .addCase(updateCodingTestThunk.rejected, (state, action) => {
        state.isLoading = false;

        state.success = false;

        state.error = action.payload;
      })

      // =========================
      // DELETE CODING TEST
      // =========================

      .addCase(deleteCodingTestThunk.pending, (state) => {
        state.isLoading = true;

        state.error = null;
      })

      .addCase(deleteCodingTestThunk.fulfilled, (state, action) => {
        state.isLoading = false;

        state.success = true;

        state.codingTests = state.codingTests.filter(
          (item) => item._id !== action.meta.arg,
        );
      })

      .addCase(deleteCodingTestThunk.rejected, (state, action) => {
        state.isLoading = false;

        state.success = false;

        state.error = action.payload;
      })
      // ==========================
      // CREATE CODING QUESTION
      // ==========================

      .addCase(createCodingQuestionThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCodingQuestionThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;

        state.codingQuestions.unshift(action.payload?.data);
      })
      .addCase(createCodingQuestionThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ==========================
      // GET CODING QUESTIONS By Test
      // ==========================

      .addCase(getCodingQuestionThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCodingQuestionThunk.fulfilled, (state, action) => {
        state.isLoading = false;

        state.codingQuestions = action.payload?.data || [];
      })
      .addCase(getCodingQuestionThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      //==============
      //Get All coding Question
      //=================

      .addCase(getAllCodingQuestionThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllCodingQuestionThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.codingQuestions = action.payload.data;
        console.log("PAYLOAD:", action.payload.data);
      })
      .addCase(getAllCodingQuestionThunk.rejected, (state) => {
        state.isLoading = false;
      })
      // ==========================
      // UPDATE
      // ==========================

      .addCase(updateCodingQuestionThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCodingQuestionThunk.fulfilled, (state, action) => {
        state.isLoading = false;

        const index = state.codingQuestions.findIndex(
          (item) => item._id === action.payload?.data?._id,
        );

        if (index !== -1) {
          state.codingQuestions[index] = action.payload.data;
        }
      })
      .addCase(updateCodingQuestionThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ==========================
      // DELETE
      // ==========================

      .addCase(deleteCodingQuestionThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCodingQuestionThunk.fulfilled, (state, action) => {
        state.isLoading = false;

        state.codingQuestions = state.codingQuestions.filter(
          (item) => item._id !== action.meta.arg,
        );
      })
      .addCase(deleteCodingQuestionThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      ///===========================
      //Submisson coding
      //============================
      // RUN CODE
      .addCase(runCodingCodeThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(runCodingCodeThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.runResult = action.payload.data;
      })
      .addCase(runCodingCodeThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // SUBMIT
      .addCase(submitCodingCodeThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(submitCodingCodeThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.submissionResult = action.payload.data;
      })
      .addCase(submitCodingCodeThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // SAVE RESULT
      .addCase(saveSubmissionResultThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(saveSubmissionResultThunk.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(saveSubmissionResultThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // HISTORY
      .addCase(getSubmissionHistoryThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSubmissionHistoryThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.submissionHistory = action.payload.data;
      })
      .addCase(getSubmissionHistoryThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // LEADERBOARD
      .addCase(getLeaderboardThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getLeaderboardThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.leaderboard = action.payload.leaderboard ?? action.payload.data ?? [];
      })
      .addCase(getLeaderboardThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default codingSlice.reducer;
