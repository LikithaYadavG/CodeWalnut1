import React, { useEffect, useRef, useState } from "react";
import { Trash2, RotateCcw, Pencil } from "lucide-react";
import { Timer } from "../types/timer";
import { formatTime } from "../utils/time";
import { useTimerStore } from "../store/useTimerStore";
import { toast } from "sonner";
import { TimerModal } from "./TimerModal";
import { TimerAudio } from "../utils/audio";
import { TimerControls } from "./TimerControls";
import { TimerProgress } from "./TimerProgress";
import { Button } from "./Button";

interface TimerItemProps {
  timer: Timer;
}

export const TimerItem: React.FC<TimerItemProps> = ({ timer }) => {
  const { toggleTimer, deleteTimer, updateTimer, restartTimer } =
    useTimerStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const timerAudio = TimerAudio.getInstance();
  const hasEndedRef = useRef(false);
  const toastIdRef = useRef<string | number | null>(null);

  useEffect(() => {
    let interval: number | null = null;

    if (timer.isRunning && timer.remainingTime > 0) {
      interval = window.setInterval(() => {
        updateTimer(timer.id);

        // Check if timer just ended
        if (timer.remainingTime <= 1 && !hasEndedRef.current) {
          hasEndedRef.current = true;
          const audioInstance = timerAudio.play();

          toastIdRef.current = toast.success(
            `Timer "${timer.title}" has ended!`,
            {
              duration: Infinity,
              action: {
                label: "Dismiss",
                onClick: () => {
                  audioInstance.then((instance) => instance.stop());
                  if (toastIdRef.current) {
                    toast.dismiss(toastIdRef.current);
                  }
                },
              },
            }
          );
        }
      }, 1000);

      intervalRef.current = interval;
    }

    return () => {
      if (interval) {
        clearInterval(interval);
        intervalRef.current = null;
      }
    };
  }, [timer.isRunning, timer.remainingTime, timer.id, timer.title]);

  const handleToggle = () => {
    if (timer.remainingTime <= 0) {
      hasEndedRef.current = false;
      restartTimer(timer.id);
    } else {
      toggleTimer(timer.id);
    }
  };

  const handleRestart = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    hasEndedRef.current = false;
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
      toastIdRef.current = null;
    }
    timerAudio.stop();
    restartTimer(timer.id);
  };

  const handleDelete = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
      toastIdRef.current = null;
    }
    timerAudio.stop();
    deleteTimer(timer.id);
  };

  return (
    <>
      <div className="relative bg-white rounded-xl shadow-lg p-6 transition-transform hover:scale-102 overflow-hidden">
        <div className="absolute inset-0 w-full h-full -z-10 opacity-5">
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M50 20V50L70 70"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="relative">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                {timer.title}
              </h3>
              <p className="text-gray-600 mt-1">{timer.description}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="icon"
                icon={Pencil}
                onClick={() => setIsEditModalOpen(true)}
                title="Edit Timer"
              />
              <Button
                variant="icon"
                icon={RotateCcw}
                onClick={handleRestart}
                title="Restart Timer"
              />
              <Button
                variant="icon"
                icon={Trash2}
                onClick={handleDelete}
                className="text-red-500 hover:bg-red-50"
                title="Delete Timer"
              />
            </div>
          </div>
          <div className="flex flex-col items-center mt-6">
            <div className="text-4xl font-mono font-bold text-gray-800 mb-4">
              {formatTime(timer.remainingTime)}
            </div>

            <TimerProgress
              progress={(timer.remainingTime / timer.duration) * 100}
            />

            <TimerControls
              isRunning={timer.isRunning}
              remainingTime={timer.remainingTime}
              duration={timer.duration}
              onToggle={handleToggle}
              onRestart={handleRestart}
            />
          </div>
        </div>
      </div>

      <TimerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        mode="edit"
        timer={timer}
      />
    </>
  );
};
