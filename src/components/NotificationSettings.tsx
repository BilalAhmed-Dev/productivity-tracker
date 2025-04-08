'use client';

import { useEffect, useState } from 'react';

import { getNotificationConfig, saveNotificationConfig } from '@/utils/notifications';

const NotificationSettings = () => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const config = getNotificationConfig();
        setIsEnabled(config.enabled);
        setPhoneNumber(config.phoneNumber || '');
    }, []);

    const handleSave = () => {
        saveNotificationConfig({
            enabled: isEnabled,
            phoneNumber: isEnabled ? phoneNumber : undefined
        });
        setIsOpen(false);
    };

    return (
        <div>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className='flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                aria-label='إعدادات الإشعارات'
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
                    className='mr-0 ml-2'>
                    <path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' />
                    <path d='M13.73 21a2 2 0 0 1-3.46 0' />
                </svg>
                الإشعارات
            </button>

            {isOpen && (
                <div className='absolute right-0 z-10 mt-2 w-72 rounded-md bg-white p-4 shadow-lg dark:bg-gray-800'>
                    <h3 className='mb-3 text-lg font-medium'>إعدادات الإشعارات</h3>

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
                                    className={`dot absolute top-1 ${isEnabled ? 'right-1' : 'left-1'} h-4 w-4 rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-0' : 'translate-x-4 transform'}`}></div>
                            </div>
                            <span className='mr-3'>تفعيل إشعارات واتساب</span>
                        </label>
                    </div>

                    {isEnabled && (
                        <div className='mb-4'>
                            <label
                                htmlFor='phone-number'
                                className='mb-1 block text-right text-sm font-medium text-gray-700 dark:text-gray-300'>
                                رقم واتساب (مع رمز البلد)
                            </label>
                            <input
                                id='phone-number'
                                type='tel'
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder='مثال: 1234567890'
                                className='w-full rounded-md border border-gray-300 px-3 py-2 text-right text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                                aria-label='رقم هاتف واتساب'
                                tabIndex={0}
                                dir='ltr'
                            />
                        </div>
                    )}

                    <div className='flex justify-end space-x-2 space-x-reverse'>
                        <button
                            onClick={() => setIsOpen(false)}
                            className='rounded-md px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                            aria-label='إلغاء إعدادات الإشعارات'
                            tabIndex={0}>
                            إلغاء
                        </button>
                        <button
                            onClick={handleSave}
                            className='rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700'
                            aria-label='حفظ إعدادات الإشعارات'
                            tabIndex={0}>
                            حفظ
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationSettings;
