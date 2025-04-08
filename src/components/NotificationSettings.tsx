'use client';

import { useEffect, useState } from 'react';

import { getNotificationConfig, requestNotificationPermission, saveNotificationConfig } from '@/utils/notifications';

const NotificationSettings = () => {
    const [isEnabled, setIsEnabled] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | null>(null);

    useEffect(() => {
        const config = getNotificationConfig();
        setIsEnabled(config.enabled);

        // Check notification permission on component mount
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setPermissionStatus(Notification.permission);
        }
    }, []);

    const handleSave = () => {
        saveNotificationConfig({
            enabled: isEnabled,
            notificationType: 'both' // Always use both for best experience
        });
        setIsOpen(false);
    };

    const handleRequestPermission = async () => {
        const permission = await requestNotificationPermission();
        setPermissionStatus(permission);
    };

    return (
        <div>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className='flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                aria-label='Notification Settings'
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
                    <path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' />
                    <path d='M13.73 21a2 2 0 0 1-3.46 0' />
                </svg>
                Notifications
            </button>

            {isOpen && (
                <div className='absolute right-0 z-10 mt-2 w-80 rounded-md bg-white p-4 shadow-lg dark:bg-gray-800'>
                    <h3 className='mb-3 text-lg font-medium'>Notification Settings</h3>

                    <div className='mb-4 flex items-center'>
                        <label htmlFor='enable-notifications' className='flex cursor-pointer items-center'>
                            <div className='relative'>
                                <input
                                    id='enable-notifications'
                                    type='checkbox'
                                    className='sr-only'
                                    checked={isEnabled}
                                    onChange={(e) => setIsEnabled(e.target.checked)}
                                />
                                <div className='block h-6 w-10 rounded-full bg-gray-300 dark:bg-gray-600'></div>
                                <div
                                    className={`dot absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
                            </div>
                            <span className='ml-3'>Enable Notifications</span>
                        </label>
                    </div>

                    {isEnabled && (
                        <div className='mb-4 rounded-md bg-blue-50 p-3 dark:bg-blue-900/30'>
                            <div className='flex items-center'>
                                <div className='mr-2 text-blue-500'>
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
                                        <circle cx='12' cy='12' r='10'></circle>
                                        <line x1='12' y1='16' x2='12' y2='12'></line>
                                        <line x1='12' y1='8' x2='12.01' y2='8'></line>
                                    </svg>
                                </div>
                                <div>
                                    <p className='text-sm text-blue-700 dark:text-blue-300'>
                                        {permissionStatus === 'granted'
                                            ? 'System notifications are enabled.'
                                            : 'Permission required for system notifications.'}
                                    </p>
                                    <p className='mt-1 text-xs text-blue-600 dark:text-blue-400'>
                                        Audio notifications are always enabled.
                                    </p>
                                </div>
                            </div>
                            {permissionStatus !== 'granted' && (
                                <button
                                    onClick={handleRequestPermission}
                                    className='mt-2 rounded-md bg-blue-100 px-3 py-1 text-sm text-blue-700 hover:bg-blue-200 dark:bg-blue-800 dark:text-blue-300 dark:hover:bg-blue-700'>
                                    Request Permission for System Notifications
                                </button>
                            )}
                        </div>
                    )}

                    <div className='flex justify-end space-x-2'>
                        <button
                            onClick={() => setIsOpen(false)}
                            className='rounded-md px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                            aria-label='Cancel notification settings'
                            tabIndex={0}>
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className='rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700'
                            aria-label='Save notification settings'
                            tabIndex={0}>
                            Save
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationSettings;
