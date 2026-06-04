import { configureStore } from "@reduxjs/toolkit";
import aichatting from "../slice/aislice"
import interviewReducer from "../slice/slice";
import codingReducer from "../slice/codingSlice";
import notificationreducer from "../slice/notificationslice"
const store = configureStore({
  reducer: {
    mainstore: interviewReducer,
    codingStore: codingReducer,
    aiStore:aichatting,
    notificationStore:notificationreducer
  },
});

export default store;
