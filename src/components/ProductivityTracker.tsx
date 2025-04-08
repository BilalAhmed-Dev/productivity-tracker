'use client';

import { useEffect, useState } from 'react';

import { sendNotification } from '@/utils/notifications';
import {
    type TimeBlockData,
    clearLocalStorageData,
    generateTimeBlocks,
    loadDataFromLocalStorage,
    saveDataToLocalStorage
} from '@/utils/storage';

import ActiveTimer from './ActiveTimer';
import NotificationSettings from './NotificationSettings';
import TimeBlock from './TimeBlock';

const ProductivityTracker = () => {
    const [waitingBlocks, setWaitingBlocks] = useState<TimeBlockData[]>([]);
    const [inProgressBlocks, setInProgressBlocks] = useState<TimeBlockData[]>([]);
    const [completedBlocks, setCompletedBlocks] = useState<TimeBlockData[]>([]);
    const [breakTimeMinutes, setBreakTimeMinutes] = useState<number>(0);
    const [isEditingBreakTime, setIsEditingBreakTime] = useState<boolean>(false);
    const [breakTimeInput, setBreakTimeInput] = useState<string>('0');

    // Load initial data
    useEffect(() => {
        const savedData = loadDataFromLocalStorage();

        if (savedData) {
            setWaitingBlocks(savedData.waitingBlocks);
            setInProgressBlocks(savedData.inProgressBlocks);
            setCompletedBlocks(savedData.completedBlocks);
            setBreakTimeMinutes(savedData.breakTimeMinutes || 0);
        } else {
            // Initialize with default blocks if no saved data
            setWaitingBlocks(generateTimeBlocks(8));
        }
    }, []);

    // Save data when it changes
    useEffect(() => {
        if (waitingBlocks.length || inProgressBlocks.length || completedBlocks.length || breakTimeMinutes > 0) {
            saveDataToLocalStorage({
                waitingBlocks,
                inProgressBlocks,
                completedBlocks,
                breakTimeMinutes
            });
        }
    }, [waitingBlocks, inProgressBlocks, completedBlocks, breakTimeMinutes]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
        e.dataTransfer.setData('id', id);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDropToInProgress = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('id');

        // Only allow dropping if it's from waiting blocks and there's no block in progress
        if (inProgressBlocks.length === 0) {
            const blockIndex = waitingBlocks.findIndex((block) => block.id === id);

            if (blockIndex !== -1) {
                const blockToMove = { ...waitingBlocks[blockIndex], status: 'in-progress' as const };

                setWaitingBlocks((prev) => prev.filter((block) => block.id !== id));
                setInProgressBlocks((prev) => [...prev, blockToMove]);
            }
        }
    };

    const handleTimerComplete = async (id: string, description: string) => {
        // First check if this block is already in completedBlocks
        const isDuplicate = completedBlocks.some((block) => block.id === id);
        if (isDuplicate) {
            console.log(`Block ${id} is already in completed blocks, ignoring duplicate completion`);
            return; // Exit early if already completed
        }

        const blockIndex = inProgressBlocks.findIndex((block) => block.id === id);
        if (blockIndex !== -1) {
            const completedBlock = {
                ...inProgressBlocks[blockIndex],
                status: 'completed' as const,
                description: description || inProgressBlocks[blockIndex].description || ''
            };

            // Remove from in-progress blocks
            setInProgressBlocks((prev) => prev.filter((block) => block.id !== id));

            // Add to completed blocks with a unique ID to prevent duplicates
            setCompletedBlocks((prev) => {
                // Double-check to prevent duplicates (in case of multiple rapid completions)
                if (prev.some((block) => block.id === id)) {
                    return prev;
                }
                return [...prev, completedBlock];
            });

            // Add 10 minutes to break time
            setBreakTimeMinutes((prev) => prev + 10);

            // Send notification
            await sendNotification('Productivity Tracker', 'Productivity block completed!');
        }
    };

    const handleUpdateTimeBlock = (id: string, updates: { description?: string; imagePath?: string }) => {
        setCompletedBlocks((prev) => prev.map((block) => (block.id === id ? { ...block, ...updates } : block)));
    };

    const handleReset = async () => {
        // Delete all uploaded images first
        try {
            await fetch('/api/uploads?delete_all=true', {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Failed to delete uploaded images:', error);
        }

        // Clear local storage and reset the state
        clearLocalStorageData();
        setWaitingBlocks(generateTimeBlocks(8));
        setInProgressBlocks([]);
        setCompletedBlocks([]);
        setBreakTimeMinutes(0);
    };

    const startBreakTimeEdit = () => {
        setBreakTimeInput(breakTimeMinutes.toString());
        setIsEditingBreakTime(true);
    };

    const saveBreakTime = () => {
        const newBreakTime = parseInt(breakTimeInput, 10);
        if (!isNaN(newBreakTime) && newBreakTime >= 0) {
            setBreakTimeMinutes(newBreakTime);
        }
        setIsEditingBreakTime(false);
    };

    const handleBreakTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Only allow numbers
        const value = e.target.value.replace(/[^0-9]/g, '');
        setBreakTimeInput(value);
    };

    const useBreakTime = (minutes: number) => {
        if (breakTimeMinutes >= minutes) {
            setBreakTimeMinutes((prev) => Math.max(0, prev - minutes));
        }
    };

    // Calculate total completed time in minutes
    const totalCompletedMinutes = completedBlocks.reduce((total, block) => {
        return total + block.remainingTime / 60;
    }, 0);

    // Format the total time completed
    const formatTotalTime = () => {
        const hours = Math.floor(totalCompletedMinutes / 60);
        const minutes = Math.round(totalCompletedMinutes % 60);

        if (hours > 0) {
            return `${hours} ${hours === 1 ? 'hour' : 'hours'} and ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
        }

        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
    };

    return (
        <div className='container mx-auto p-4'>
            <div className='mb-6 flex items-center justify-between'>
                <h1 className='text-2xl font-bold'>Productivity Tracker</h1>
                <div className='flex space-x-4'>
                    <NotificationSettings />
                    <button
                        onClick={handleReset}
                        className='flex items-center text-sm font-medium text-red-600 hover:text-red-800'
                        aria-label='Reset all data'
                        tabIndex={0}>
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            width='16'
                            height='16'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            className='mr-2'>
                            <path d='M3 6h18' />
                            <path d='M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' />
                            <path d='M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' />
                        </svg>
                        Reset
                    </button>
                </div>
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                {/* Waiting Blocks */}
                <div className='h-[calc(100vh-150px)] overflow-y-auto rounded-lg bg-white p-4 shadow-md'>
                    <h2 className='sticky top-0 mb-4 bg-white py-2 text-lg font-semibold'>Waiting List</h2>
                    <div className='space-y-2'>
                        {waitingBlocks.map((block) => (
                            <TimeBlock
                                key={block.id}
                                id={block.id}
                                onDragStart={handleDragStart}
                                remainingTime={block.remainingTime}
                            />
                        ))}
                    </div>
                </div>

                {/* In Progress */}
                <div
                    className='h-[calc(100vh-150px)] overflow-y-auto rounded-lg bg-white p-4 shadow-md'
                    onDragOver={handleDragOver}
                    onDrop={handleDropToInProgress}>
                    <h2 className='sticky top-0 mb-4 bg-white py-2 text-lg font-semibold'>In Progress</h2>
                    {inProgressBlocks.length > 0 ? (
                        inProgressBlocks.map((block) => (
                            <ActiveTimer
                                key={block.id}
                                id={block.id}
                                initialTime={block.remainingTime}
                                onComplete={handleTimerComplete}
                                initialDescription={block.description}
                            />
                        ))
                    ) : (
                        <div className='rounded-lg border-2 border-dashed border-gray-300 p-6 text-center text-gray-500'>
                            Drag a block here to start
                        </div>
                    )}
                </div>

                {/* Completed */}
                <div className='h-[calc(100vh-150px)] overflow-y-auto rounded-lg bg-white p-4 shadow-md'>
                    <div className='sticky top-0 bg-white py-2'>
                        {/* Break time counter */}
                        <div className='mb-3 rounded-md bg-blue-100 p-2 text-blue-800'>
                            <div className='flex items-center justify-between'>
                                <span className='text-sm font-medium'>Break Time:</span>
                                {isEditingBreakTime ? (
                                    <div className='flex items-center'>
                                        <input
                                            type='text'
                                            value={breakTimeInput}
                                            onChange={handleBreakTimeInputChange}
                                            className='mr-2 w-16 rounded border border-blue-300 px-2 py-1 text-sm text-black'
                                            autoFocus
                                        />
                                        <button
                                            onClick={saveBreakTime}
                                            className='rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600'>
                                            Save
                                        </button>
                                    </div>
                                ) : (
                                    <div className='flex items-center'>
                                        <span className='font-bold'>{breakTimeMinutes} minutes</span>
                                        <button
                                            onClick={startBreakTimeEdit}
                                            className='ml-2 text-blue-600 hover:text-blue-800'>
                                            <svg
                                                xmlns='http://www.w3.org/2000/svg'
                                                width='14'
                                                height='14'
                                                viewBox='0 0 24 24'
                                                fill='none'
                                                stroke='currentColor'
                                                strokeWidth='2'
                                                strokeLinecap='round'
                                                strokeLinejoin='round'>
                                                <path d='M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'></path>
                                                <path d='M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'></path>
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                            {breakTimeMinutes > 0 && (
                                <div className='mt-2 flex flex-wrap gap-2'>
                                    <button
                                        onClick={() => useBreakTime(5)}
                                        className='rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600'
                                        disabled={breakTimeMinutes < 5}>
                                        Take a 5-minute break
                                    </button>
                                    <button
                                        onClick={() => useBreakTime(10)}
                                        className='rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600'
                                        disabled={breakTimeMinutes < 10}>
                                        Take a 10-minute break
                                    </button>
                                    <button
                                        onClick={() => useBreakTime(breakTimeMinutes)}
                                        className='rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700'>
                                        Use all break time ({breakTimeMinutes} minutes)
                                    </button>
                                </div>
                            )}
                        </div>
                        <h2 className='mb-2 text-lg font-semibold'>Completed</h2>

                        {completedBlocks.length > 0 && (
                            <div className='mb-4 rounded-md bg-green-100 p-2 text-green-800'>
                                <p className='text-sm font-medium'>Total: {formatTotalTime()}</p>
                            </div>
                        )}
                    </div>
                    <div className='space-y-2'>
                        {completedBlocks.map((block) => (
                            <TimeBlock
                                key={block.id}
                                id={block.id}
                                onDragStart={handleDragStart}
                                isDraggable={false}
                                isCompleted={true}
                                remainingTime={block.remainingTime}
                                description={block.description}
                                imagePath={block.imagePath}
                                onUpdateBlock={handleUpdateTimeBlock}
                            />
                        ))}
                    </div>
                    {completedBlocks.length === 0 && (
                        <div className='rounded-lg border-2 border-dashed border-gray-300 p-6 text-center text-gray-500'>
                            No completed tasks yet
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductivityTracker;
