'use client';

import { useEffect, useState } from 'react';

interface ActiveTimerProps {
    id: string;
    initialTime: number; // in seconds
    onComplete: (id: string) => void;
}

const ActiveTimer = ({ id, initialTime, onComplete }: ActiveTimerProps) => {
    const [timeRemaining, setTimeRemaining] = useState(initialTime);
    const [isRunning, setIsRunning] = useState(true);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        let isCompleted = false;

        if (isRunning && timeRemaining > 0) {
            timer = setInterval(() => {
                setTimeRemaining((prevTime) => {
                    const newTime = prevTime - 1;
                    if (newTime <= 0 && !isCompleted) {
                        clearInterval(timer);
                        isCompleted = true; // Mark as completed to prevent duplicate calls
                        onComplete(id);

                        return 0;
                    }

                    return newTime;
                });
            }, 1000);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [isRunning, timeRemaining, id, onComplete]);

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return `${minutes}:${remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds}`;
    };

    const toggleTimer = () => {
        setIsRunning((prev) => !prev);
    };

    const progress = (timeRemaining / initialTime) * 100;

    return (
        <div className='mb-2 rounded-md bg-yellow-200 p-4 dark:bg-yellow-800'>
            <div className='mb-2 flex items-center justify-between'>
                <span className='text-lg font-bold'>{formatTime(timeRemaining)}</span>
                <button
                    onClick={toggleTimer}
                    className='rounded-full p-2 transition-colors hover:bg-yellow-300 dark:hover:bg-yellow-700'
                    aria-label={isRunning ? 'إيقاف مؤقت' : 'استمرار'}
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
