'use client';

import { useEffect, useState } from 'react';

interface TimeBlockDetailDialogProps {
    isOpen: boolean;
    onClose: () => void;
    description?: string;
    imagePath?: string;
    time: string;
}

const TimeBlockDetailDialog = ({ isOpen, onClose, description, imagePath, time }: TimeBlockDetailDialogProps) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);

        // Add event listener to close on escape key
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevent scrolling when dialog is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // For SSR
    if (!isMounted) return null;

    if (!isOpen) return null;

    // In Next.js, files in /public should be referenced without a leading slash
    // This ensures compatibility with development and production builds
    const imageUrl = imagePath || '';

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
            <div className='relative mx-4 max-h-[90vh] max-w-lg overflow-auto rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800'>
                <button
                    onClick={onClose}
                    className='absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    aria-label='Close dialog'>
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'>
                        <line x1='18' y1='6' x2='6' y2='18'></line>
                        <line x1='6' y1='6' x2='18' y2='18'></line>
                    </svg>
                </button>

                <div className='mb-4'>
                    <h2 className='text-xl font-semibold'>Time Block Details - {time}</h2>
                </div>

                <div className='flex flex-col space-y-4'>
                    {description && (
                        <div className='rounded-md bg-gray-50 p-3 dark:bg-gray-700'>
                            <p className='text-sm'>{description}</p>
                        </div>
                    )}

                    {imageUrl && (
                        <div className='relative h-64 w-full overflow-hidden rounded-md'>
                            <img
                                src={`/${imageUrl}`}
                                alt='Time block reference image'
                                className='h-full w-full object-contain'
                            />
                        </div>
                    )}

                    {!description && !imageUrl && (
                        <p className='text-center text-sm text-gray-500'>No additional details available</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TimeBlockDetailDialog;
