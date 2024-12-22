import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { TimerItem } from "./TimerItem";
import { useTimerStore } from "../store/useTimerStore";
import { TimerAudio } from "../utils/audio";
import { toast } from "sonner";

// Mock dependencies
jest.mock("../store/useTimerStore");
jest.mock("../utils/audio");
jest.mock("sonner");

describe("TimerItem", () => {
  // Mock timer data
  const mockTimer = {
    id: "1",
    title: "Test Timer",
    description: "Test Description",
    duration: 3600,
    remainingTime: 3600,
    isRunning: false,
  };

  // Mock store actions
  const mockToggleTimer = jest.fn();
  const mockDeleteTimer = jest.fn();
  const mockUpdateTimer = jest.fn();
  const mockRestartTimer = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTimerStore as jest.Mock).mockReturnValue({
      toggleTimer: mockToggleTimer,
      deleteTimer: mockDeleteTimer,
      updateTimer: mockUpdateTimer,
      restartTimer: mockRestartTimer,
    });
  });

  it("renders timer information correctly", () => {
    render(<TimerItem timer={mockTimer} />);

    expect(screen.getByText("Test Timer")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(screen.getByText("01:00:00")).toBeInTheDocument(); // Formatted time
  });

  describe("Timer Controls", () => {
    it("handles play/pause toggle", () => {
      render(<TimerItem timer={mockTimer} />);

      const toggleButton = screen.getByTitle(/toggle timer/i);
      fireEvent.click(toggleButton);

      expect(mockToggleTimer).toHaveBeenCalledWith(mockTimer.id);
    });

    it("handles restart", () => {
      render(<TimerItem timer={mockTimer} />);

      const restartButton = screen.getByTitle("Restart Timer");
      fireEvent.click(restartButton);

      expect(mockRestartTimer).toHaveBeenCalledWith(mockTimer.id);
    });

    it("handles delete", () => {
      render(<TimerItem timer={mockTimer} />);

      const deleteButton = screen.getByTitle("Delete Timer");
      fireEvent.click(deleteButton);

      expect(mockDeleteTimer).toHaveBeenCalledWith(mockTimer.id);
    });
  });

  describe("Timer Progress", () => {
    it("shows correct progress percentage", () => {
      const halfwayTimer = {
        ...mockTimer,
        remainingTime: 1800, // Half of duration
      };

      render(<TimerItem timer={halfwayTimer} />);

      const progressElement = screen.getByRole("progressbar");
      expect(progressElement).toHaveAttribute("aria-valuenow", "50");
    });
  });

  describe("Timer Completion", () => {
    it("shows completion toast and plays sound when timer ends", () => {
      jest.useFakeTimers();

      const almostEndedTimer = {
        ...mockTimer,
        remainingTime: 1,
        isRunning: true,
      };

      render(<TimerItem timer={almostEndedTimer} />);

      jest.advanceTimersByTime(1000);

      expect(TimerAudio.getInstance().play).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith(
        'Timer "Test Timer" has ended!',
        expect.any(Object)
      );

      jest.useRealTimers();
    });
  });

  describe("Edit Modal", () => {
    it("opens edit modal when edit button is clicked", () => {
      render(<TimerItem timer={mockTimer} />);

      const editButton = screen.getByTitle("Edit Timer");
      fireEvent.click(editButton);

      expect(screen.getByText("Edit Timer")).toBeInTheDocument();
    });

    it("closes edit modal when cancel is clicked", () => {
      render(<TimerItem timer={mockTimer} />);

      // Open modal
      fireEvent.click(screen.getByTitle("Edit Timer"));

      // Close modal
      fireEvent.click(screen.getByText("Cancel"));

      expect(screen.queryByText("Edit Timer")).not.toBeInTheDocument();
    });
  });
});
