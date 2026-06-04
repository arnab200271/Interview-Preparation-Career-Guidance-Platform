import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notifications: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: "notification",

  initialState,

  reducers: {
    addNotification: (state, action) => {
      // Avoid duplicate notifications in quick succession (e.g. from rapid backend emits or StrictMode)
      const isDuplicate = state.notifications.slice(0, 5).some(
        (n) => n.title === action.payload.title && n.message === action.payload.message
      );
      if (!isDuplicate) {
        state.notifications.unshift({
          ...action.payload,
          createdAt: action.payload.createdAt || new Date().toISOString(),
          isRead: action.payload.isRead || false,
        });
        state.unreadCount += 1;
      }
    },

    setNotifications: (state, action) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((item) => !item.isRead).length;
    },

    markAllRead: (state) => {
      state.notifications = state.notifications.map((item) => ({
        ...item,
        isRead: true,
      }));

      state.unreadCount = 0;
    },
  },
});

export const { addNotification, setNotifications, markAllRead } =
  notificationSlice.actions;

export default notificationSlice.reducer;
