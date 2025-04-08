'use client';

import { useEffect, useRef, useState } from 'react';

import { clearActiveTimerState, loadActiveTimerState, saveActiveTimerState } from '@/utils/storage';

interface ActiveTimerProps {
    id: string;
    initialTime: number; // in seconds
    onComplete: (id: string, description: string) => void;
    initialDescription?: string;
}

const ActiveTimer = ({ id, initialTime, onComplete, initialDescription = '' }: ActiveTimerProps) => {
    const [displayTime, setDisplayTime] = useState(initialTime);
    const [isRunning, setIsRunning] = useState(true);
    const [description, setDescription] = useState(initialDescription);
    const [isEditing, setIsEditing] = useState(false);
    const isCompletedRef = useRef(false);

    // Use refs to store the end time and timer state
    const endTimeRef = useRef<number | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const persistenceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Load from localStorage on component mount
    useEffect(() => {
        const loadSavedTimer = () => {
            const savedTimer = loadActiveTimerState(id);
            if (savedTimer) {
                const { endTime, description: savedDescription } = savedTimer;
                if (endTime) {
                    endTimeRef.current = endTime;
                    const now = Date.now();
                    const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
                    setDisplayTime(remaining);
                }
                if (savedDescription) {
                    setDescription(savedDescription);
                }
            }
        };

        loadSavedTimer();
    }, [id]);

    // Initialize the timer with the end time
    useEffect(() => {
        // Set the initial end time when the component mounts
        if (endTimeRef.current === null && isRunning) {
            endTimeRef.current = Date.now() + initialTime * 1000;
            // Save to localStorage immediately on initialization
            persistTimerState();
        }
    }, [initialTime, isRunning]);

    // Function to save timer state to localStorage
    const persistTimerState = () => {
        if (!endTimeRef.current) return;

        saveActiveTimerState(id, endTimeRef.current, description);
    };

    // Set up timer persistence interval
    useEffect(() => {
        // Clear any existing persistence timer
        if (persistenceTimerRef.current) {
            clearInterval(persistenceTimerRef.current);
        }

        // Only set up persistence timer if the main timer is running
        if (isRunning && !isCompletedRef.current) {
            persistenceTimerRef.current = setInterval(() => {
                persistTimerState();
            }, 10000); // Save every 10 seconds
        }

        return () => {
            if (persistenceTimerRef.current) {
                clearInterval(persistenceTimerRef.current);
                persistenceTimerRef.current = null;
            }
        };
    }, [isRunning, description, id]);

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

                    // Clean up localStorage
                    clearActiveTimerState(id);

                    // Use setTimeout to ensure state updates are properly batched
                    setTimeout(() => {
                        onComplete(id, description);
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
    }, [isRunning, id, onComplete, description]);

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
                    // Clean up localStorage
                    clearActiveTimerState(id);
                    onComplete(id, description);
                }
            }
        };

        // Add visibility change listener
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Clean up
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [id, isRunning, onComplete, description]);

    // Add cleanup effect for component unmount
    useEffect(() => {
        // This cleanup function will run when the component unmounts
        return () => {
            // Clear all timers
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }

            if (persistenceTimerRef.current) {
                clearInterval(persistenceTimerRef.current);
                persistenceTimerRef.current = null;
            }

            // If timer has completed, remove from localStorage to avoid orphaned entries
            if (isCompletedRef.current) {
                clearActiveTimerState(id);
            }
            // If timer hasn't completed but component is unmounting, save current state
            else if (endTimeRef.current) {
                saveActiveTimerState(id, endTimeRef.current, description);
            }
        };
    }, [id, description]);

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

        // Save the current state after toggling
        setTimeout(persistTimerState, 0);
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(e.target.value);
    };

    const handleDescriptionSave = () => {
        setIsEditing(false);
        persistTimerState();
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

            {/* Description area */}
            <div className='mt-3'>
                {isEditing ? (
                    <div className='mt-2'>
                        <textarea
                            value={description}
                            onChange={handleDescriptionChange}
                            className='w-full rounded-md border border-yellow-400 bg-yellow-50 p-2 text-sm dark:border-yellow-700 dark:bg-yellow-900'
                            placeholder='Add a description for this task...'
                            rows={3}
                            maxLength={500}
                            autoFocus
                        />
                        <div className='mt-2 flex justify-end'>
                            <button
                                onClick={handleDescriptionSave}
                                className='rounded-md bg-yellow-500 px-3 py-1 text-sm text-white hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700'
                                aria-label='Save description'>
                                Save
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        onClick={() => setIsEditing(true)}
                        className='cursor-text rounded-md border border-dashed border-yellow-400 p-2 text-sm text-gray-600 hover:bg-yellow-100 dark:border-yellow-700 dark:text-gray-300 dark:hover:bg-yellow-900'>
                        {description ? (
                            description
                        ) : (
                            <span className='text-gray-400 dark:text-gray-500'>Add a description for this task...</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActiveTimer;
