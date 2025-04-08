'use client';

import { useState } from 'react';

import TimeBlockDetailDialog from './TimeBlockDetailDialog';

interface TimeBlockProps {
    id: string;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, id: string) => void;
    isDraggable?: boolean;
    isInProgress?: boolean;
    isCompleted?: boolean;
    remainingTime?: number;
    description?: string;
    imagePath?: string;
    onUpdateBlock?: (id: string, updates: { description?: string; imagePath?: string }) => void;
}

const TimeBlock = ({
    id,
    onDragStart,
    isDraggable = true,
    isInProgress = false,
    isCompleted = false,
    remainingTime = 600, // 10 minutes in seconds
    description = '',
    imagePath = '',
    onUpdateBlock
}: TimeBlockProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [newDescription, setNewDescription] = useState(description);
    const [isUploading, setIsUploading] = useState(false);

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return `${minutes}:${remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds}`;
    };

    const time = formatTime(remainingTime);

    const handleOpenModal = () => {
        if (isCompleted) {
            setIsModalOpen(true);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false);
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditMode(true);
    };

    const handleSaveDescription = async () => {
        if (onUpdateBlock && newDescription !== description) {
            onUpdateBlock(id, { description: newDescription });
        }
        setIsEditMode(false);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0] || !onUpdateBlock) return;

        const file = e.target.files[0];
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/uploads', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (data.success && data.filePath) {
                onUpdateBlock(id, { imagePath: data.filePath });
            } else {
                console.error('Upload failed:', data.error);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
        } finally {
            setIsUploading(false);
        }
    };

    // Truncate description for display
    const displayDescription =
        description && description.length > 100 ? `${description.slice(0, 100)}...` : description;

    // Handle image paths consistently for Next.js static file serving
    const getImageUrl = (path: string) => {
        if (!path) return '';

        return `/${path}`; // Always add leading slash for HTML img tags
    };

    return (
        <>
            <div
                draggable={isDraggable}
                onDragStart={(e) => onDragStart(e, id)}
                onClick={handleOpenModal}
                className={`mb-2 cursor-pointer rounded-md p-4 select-none ${
                    isInProgress ? 'bg-yellow-200 dark:bg-yellow-800' : ''
                } ${isCompleted ? 'bg-green-200 dark:bg-green-800' : ''} ${
                    !isInProgress && !isCompleted ? 'bg-gray-200 dark:bg-gray-700' : ''
                } transition-shadow hover:shadow-md`}
                aria-label={`${formatTime(remainingTime)} time block`}
                tabIndex={0}>
                <div className='flex items-center justify-between'>
                    <span className='font-medium'>{formatTime(remainingTime)}</span>
                    {isCompleted && (
                        <div className='flex items-center gap-2'>
                            {onUpdateBlock && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsEditMode(true);
                                    }}
                                    className='text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
                                    aria-label='Edit time block details'>
                                    <svg
                                        xmlns='http://www.w3.org/2000/svg'
                                        width='16'
                                        height='16'
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
                            )}
                            {(description || imagePath) && (
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
                                    className='text-gray-700 dark:text-gray-300'>
                                    <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'></path>
                                    <polyline points='14 2 14 8 20 8'></polyline>
                                    <line x1='16' y1='13' x2='8' y2='13'></line>
                                    <line x1='16' y1='17' x2='8' y2='17'></line>
                                    <line x1='10' y1='9' x2='8' y2='9'></line>
                                </svg>
                            )}
                            <svg
                                xmlns='http://www.w3.org/2000/svg'
                                width='20'
                                height='20'
                                viewBox='0 0 24 24'
                                fill='none'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                className='text-green-500'>
                                <path d='M20 6 9 17l-5-5' />
                            </svg>
                        </div>
                    )}
                </div>

                {isCompleted && displayDescription && (
                    <div className='mt-2 text-sm text-gray-600 dark:text-gray-300'>
                        {displayDescription}
                        {description.length > 100 && (
                            <span className='ml-1 cursor-pointer font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'>
                                Read more
                            </span>
                        )}
                    </div>
                )}
            </div>

            {isCompleted && (
                <TimeBlockDetailDialog
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    description={description}
                    imagePath={imagePath}
                    time={time}
                />
            )}

            {isCompleted && isEditMode && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
                    <div className='mx-4 max-w-lg rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800'>
                        <h3 className='mb-4 text-lg font-medium'>Add Details</h3>

                        <div className='mb-4'>
                            <label className='mb-2 block text-sm font-medium'>Description</label>
                            <textarea
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                                className='w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                                placeholder='Add a description for this time block'
                                rows={4}
                                maxLength={500}
                            />
                        </div>

                        <div className='mb-4'>
                            <label className='mb-2 block text-sm font-medium'>Image</label>
                            <input
                                type='file'
                                accept='image/*'
                                onChange={handleImageUpload}
                                className='w-full cursor-pointer rounded-md border border-gray-300 p-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-600 hover:file:bg-blue-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                                disabled={isUploading}
                            />
                            {isUploading && <p className='mt-1 text-sm text-gray-500'>Uploading...</p>}
                            {imagePath && (
                                <div className='mt-2 flex items-center gap-2'>
                                    <div className='h-10 w-10 flex-shrink-0 overflow-hidden rounded-md bg-gray-100'>
                                        <img
                                            src={getImageUrl(imagePath)}
                                            alt='Uploaded image'
                                            className='h-full w-full object-cover'
                                        />
                                    </div>
                                    <span className='text-sm text-gray-500'>Image uploaded</span>
                                </div>
                            )}
                        </div>

                        <div className='flex justify-end space-x-2'>
                            <button
                                onClick={handleCloseModal}
                                className='rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'>
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveDescription}
                                className='rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none'
                                disabled={isUploading}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TimeBlock;
