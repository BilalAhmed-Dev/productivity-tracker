'use client';

import { useEffect, useRef, useState } from 'react';

interface ActiveTimerProps {
    id: string;
    initialTime: number; // in seconds
    onComplete: (id: string) => void;
}

const ActiveTimer = ({ id, initialTime, onComplete }: ActiveTimerProps) => {
    const [displayTime, setDisplayTime] = useState(initialTime);
    const [isRunning, setIsRunning] = useState(true);
    const isCompletedRef = useRef(false);

    // Use refs to store the end time and timer state
    const endTimeRef = useRef<number | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize the timer with the end time
    useEffect(() => {
        // Set the initial end time when the component mounts
        if (endTimeRef.current === null && isRunning) {
            endTimeRef.current = Date.now() + initialTime * 1000;
        }
    }, [initialTime, isRunning]);

    // Handle the timer logic
    useEffect(() => {
        // Clear any existing timer
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        if (isRunning && !isCompletedRef.current) {
            // Function to update the timer based on current time
            const updateTimer = () => {
                if (!endTimeRef.current) return;

                const now = Date.now();
                const remaining = Math.max(0, Math.floor((endTimeRef.current - now) / 1000));

                setDisplayTime(remaining);

                // Check if timer has completed
                if (remaining <= 0 && !isCompletedRef.current) {
                    isCompletedRef.current = true;
                    clearInterval(timerRef.current!);
                    timerRef.current = null;

                    // Use setTimeout to ensure state updates are properly batched
                    setTimeout(() => {
                        onComplete(id);
                    }, 10);
                }
            };

            // Update immediately then start interval
            updateTimer();
            timerRef.current = setInterval(updateTimer, 100); // Using a shorter interval for better precision
        }

        // Cleanup function
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isRunning, id, onComplete]);

    // Handle tab visibility changes
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && isRunning && endTimeRef.current) {
                // Force an immediate update when tab becomes visible again
                const now = Date.now();
                const remaining = Math.max(0, Math.floor((endTimeRef.current - now) / 1000));
                setDisplayTime(remaining);

                // Check if timer should have completed while tab was hidden
                if (remaining <= 0 && !isCompletedRef.current) {
                    isCompletedRef.current = true;
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                    }
                    onComplete(id);
                }
            }
        };

        // Add visibility change listener
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Clean up
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [id, isRunning, onComplete]);

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return `${minutes}:${remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds}`;
    };

    const toggleTimer = () => {
        const newIsRunning = !isRunning;
        setIsRunning(newIsRunning);

        // Adjust end time when pausing/resuming
        if (newIsRunning) {
            // If resuming, recalculate the end time based on remaining time
            endTimeRef.current = Date.now() + displayTime * 1000;
        }
    };

    const progress = (displayTime / initialTime) * 100;

    return (
        <div className='mb-2 rounded-md bg-yellow-200 p-4 dark:bg-yellow-800'>
            <div className='mb-2 flex items-center justify-between'>
                <span className='text-lg font-bold'>{formatTime(displayTime)}</span>
                <button
                    onClick={toggleTimer}
                    className='rounded-full p-2 transition-colors hover:bg-yellow-300 dark:hover:bg-yellow-700'
                    aria-label={isRunning ? 'Pause timer' : 'Resume timer'}
                    tabIndex={0}>
                    {isRunning ? (
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            width='20'
                            height='20'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'>
                            <rect x='6' y='4' width='4' height='16' />
                            <rect x='14' y='4' width='4' height='16' />
                        </svg>
                    ) : (
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            width='20'
                            height='20'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'>
                            <polygon points='5 3 19 12 5 21 5 3' />
                        </svg>
                    )}
                </button>
            </div>
            <div className='h-2 w-full rounded-full bg-yellow-300 dark:bg-yellow-900'>
                <div
                    className='h-2 rounded-full bg-yellow-500 transition-all duration-300 ease-linear'
                    style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    );
};

export default ActiveTimer;
