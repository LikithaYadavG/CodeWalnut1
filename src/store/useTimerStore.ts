import { configureStore, createSlice } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { Timer } from "../types/timer";

// Load initial state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem("timerState");
    if (serializedState === null) {
      return { timers: [] };
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("Error loading state from localStorage:", err);
    return { timers: [] };
  }
};

// Save state to localStorage
const saveState = (state: { timers: Timer[] }) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("timerState", serializedState);
  } catch (err) {
    console.error("Error saving state to localStorage:", err);
  }
};

const initialState = loadState();

const timerSlice = createSlice({
  name: "timer",
  initialState,
  reducers: {
    addTimer: (state, action) => {
      state.timers.push({
        ...action.payload,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      });
      saveState(state);
    },
    deleteTimer: (state, action) => {
      state.timers = state.timers.filter(
        (timer) => timer.id !== action.payload
      );
      saveState(state);
    },
    toggleTimer: (state, action) => {
      const timer = state.timers.find((timer) => timer.id === action.payload);
      if (timer) {
        if (timer.remainingTime > 0) {
          timer.isRunning = !timer.isRunning;
        } else {
          timer.isRunning = false;
        }
      }
      saveState(state);
    },
    updateTimer: (state, action) => {
      const timer = state.timers.find((timer) => timer.id === action.payload);
      if (timer && timer.isRunning && timer.remainingTime > 0) {
        timer.remainingTime = Math.max(0, timer.remainingTime - 1);
        if (timer.remainingTime === 0) {
          timer.isRunning = false;
        }
        saveState(state);
      }
    },
    restartTimer: (state, action) => {
      const timer = state.timers.find((timer) => timer.id === action.payload);
      if (timer) {
        timer.remainingTime = timer.duration;
        timer.isRunning = false;
        saveState(state);
      }
    },
    editTimer: (state, action) => {
      const timer = state.timers.find(
        (timer) => timer.id === action.payload.id
      );
      if (timer) {
        Object.assign(timer, action.payload.updates);
        timer.remainingTime = action.payload.updates.duration || timer.duration;
        timer.isRunning = false;
        saveState(state);
      }
    },
  },
});

// Configure store with middleware to save state on every action
const store = configureStore({
  reducer: timerSlice.reducer,
  preloadedState: initialState,
});

// Subscribe to store changes to save state
store.subscribe(() => {
  saveState(store.getState());
});

export { store };

export const {
  addTimer,
  deleteTimer,
  toggleTimer,
  updateTimer,
  restartTimer,
  editTimer,
} = timerSlice.actions;

export const useTimerStore = () => {
  const dispatch = useDispatch();
  const timers = useSelector((state: { timers: Timer[] }) => state.timers);

  return {
    timers,
    addTimer: (timer: Omit<Timer, "id" | "createdAt">) =>
      dispatch(addTimer(timer)),
    deleteTimer: (id: string) => dispatch(deleteTimer(id)),
    toggleTimer: (id: string) => dispatch(toggleTimer(id)),
    updateTimer: (id: string) => dispatch(updateTimer(id)),
    restartTimer: (id: string) => dispatch(restartTimer(id)),
    editTimer: (id: string, updates: Partial<Timer>) =>
      dispatch(editTimer({ id, updates })),
  };
};
