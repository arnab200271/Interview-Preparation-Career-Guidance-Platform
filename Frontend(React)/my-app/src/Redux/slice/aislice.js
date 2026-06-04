import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { end_point } from "../../../api/api_url/api_Url";
import axiosInstance from "../../../api/axiosInstance/axiosInstnace";
const {aichat} = end_point


export const chatWithAIThunk = createAsyncThunk(
  "ai/chatWithAI",
  async (message, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(aichat, {
        message,
      });

      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get AI response"
      );
    }
  }
);

const initialState = {
  messages: [],
  loading: false,
  error: null,
}


const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {
    addUserMessage: (state, action) => {
      state.messages.push({
        role: "candidate",
        text: action.payload,
      });
    },

    clearChat: (state) => {
      state.messages = [];
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(chatWithAIThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(chatWithAIThunk.fulfilled, (state, action) => {
        state.loading = false;

        state.messages.push({
          role: "ai",
          text: action.payload.reply,
        });
      })

      .addCase(chatWithAIThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addUserMessage, clearChat } = aiSlice.actions;

export default aiSlice.reducer;