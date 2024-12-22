import { validateTimerForm } from "./validation";
import { toast } from "sonner";

// Mock the sonner toast
jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
  },
}));

// Mock window.innerWidth for testing responsive toast positioning
Object.defineProperty(window, "innerWidth", {
  writable: true,
  configurable: true,
  value: 1024, // Default to desktop width
});

describe("validateTimerForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validFormData = {
    title: "Test Timer",
    description: "Test Description",
    hours: 1,
    minutes: 30,
    seconds: 0,
  };

  describe("Title validation", () => {
    it("should return false and show error toast for empty title", () => {
      const result = validateTimerForm({
        ...validFormData,
        title: "",
      });

      expect(result).toBe(false);
      expect(toast.error).toHaveBeenCalledWith("Title is required", {
        position: "top-right",
      });
    });

    it("should return false and show error toast for title > 50 characters", () => {
      const result = validateTimerForm({
        ...validFormData,
        title: "a".repeat(51),
      });

      expect(result).toBe(false);
      expect(toast.error).toHaveBeenCalledWith(
        "Title must be less than 50 characters",
        { position: "top-right" }
      );
    });
  });

  describe("Time validation", () => {
    it("should return false and show error toast for negative time values", () => {
      const result = validateTimerForm({
        ...validFormData,
        hours: -1,
      });

      expect(result).toBe(false);
      expect(toast.error).toHaveBeenCalledWith(
        "Time values cannot be negative",
        {
          position: "top-right",
        }
      );
    });

    it("should return false and show error toast for minutes > 59", () => {
      const result = validateTimerForm({
        ...validFormData,
        minutes: 60,
      });

      expect(result).toBe(false);
      expect(toast.error).toHaveBeenCalledWith(
        "Minutes and seconds must be between 0 and 59",
        { position: "top-right" }
      );
    });

    it("should return false and show error toast for seconds > 59", () => {
      const result = validateTimerForm({
        ...validFormData,
        seconds: 60,
      });

      expect(result).toBe(false);
      expect(toast.error).toHaveBeenCalledWith(
        "Minutes and seconds must be between 0 and 59",
        { position: "top-right" }
      );
    });

    it("should return false and show error toast for zero duration", () => {
      const result = validateTimerForm({
        ...validFormData,
        hours: 0,
        minutes: 0,
        seconds: 0,
      });

      expect(result).toBe(false);
      expect(toast.error).toHaveBeenCalledWith(
        "Please set a time greater than 0",
        {
          position: "top-right",
        }
      );
    });

    it("should return false and show error toast for duration > 24 hours", () => {
      const result = validateTimerForm({
        ...validFormData,
        hours: 25,
      });

      expect(result).toBe(false);
      expect(toast.error).toHaveBeenCalledWith("Timer cannot exceed 24 hours", {
        position: "top-right",
      });
    });
  });

  describe("Responsive toast positioning", () => {
    it("should show toast at bottom-center on mobile", () => {
      window.innerWidth = 375;

      const result = validateTimerForm({
        ...validFormData,
        title: "",
      });

      expect(result).toBe(false);
      expect(toast.error).toHaveBeenCalledWith("Title is required", {
        position: "bottom-center",
      });
    });

    it("should show toast at top-right on desktop", () => {
      window.innerWidth = 1024;

      const result = validateTimerForm({
        ...validFormData,
        title: "",
      });

      expect(result).toBe(false);
      expect(toast.error).toHaveBeenCalledWith("Title is required", {
        position: "top-right",
      });
    });
  });

  describe("Valid form data", () => {
    it("should return true for valid form data", () => {
      const result = validateTimerForm(validFormData);

      expect(result).toBe(true);
      expect(toast.error).not.toHaveBeenCalled();
    });
  });
});
