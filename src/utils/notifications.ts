// For a real implementation, you would need to use a WhatsApp API service
// This is a simplified version that shows how to implement it
// You would need to set up a proper WhatsApp Business API or use a service like Twilio

interface NotificationConfig {
    enabled: boolean;
    notificationType: 'system' | 'audio' | 'both';
    phoneNumber?: string; // Keeping for backward compatibility
}

const NOTIFICATION_CONFIG_KEY = 'productivity-notification-config';

export const saveNotificationConfig = (config: NotificationConfig): void => {
    if (typeof window === 'undefined') return;

    localStorage.setItem(NOTIFICATION_CONFIG_KEY, JSON.stringify(config));
};

export const getNotificationConfig = (): NotificationConfig => {
    if (typeof window === 'undefined') return { enabled: true, notificationType: 'both' };

    const savedConfig = localStorage.getItem(NOTIFICATION_CONFIG_KEY);
    if (!savedConfig) return { enabled: true, notificationType: 'both' };

    try {
        const config = JSON.parse(savedConfig);
        // Add default notificationType if it doesn't exist (for backward compatibility)
        if (!config.notificationType) {
            config.notificationType = 'both';
        }
        return config;
    } catch (error) {
        console.error('Failed to parse notification config:', error);
        return { enabled: true, notificationType: 'both' };
    }
};

// Create a reliable notification sound with multiple fallbacks
const playNotificationSound = () => {
    // Try multiple approaches to ensure sound plays
    const promises: Promise<void>[] = [];

    // Method 1: Web Audio API
    promises.push(
        new Promise<void>((resolve, reject) => {
            try {
                // Create an audio context with fallback for different browsers
                const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                if (!AudioContext) {
                    return reject(new Error('AudioContext not supported'));
                }

                const audioContext = new AudioContext();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                // Configure the sound - two beeps for better attention
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5 note
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.2); // Short beep

                // Create a second beep after a short pause
                const oscillator2 = audioContext.createOscillator();
                oscillator2.connect(gainNode);
                oscillator2.type = 'sine';
                oscillator2.frequency.setValueAtTime(1100, audioContext.currentTime + 0.3); // Higher pitch

                oscillator2.start(audioContext.currentTime + 0.3);
                oscillator2.stop(audioContext.currentTime + 0.5);

                // Consider it a success after the second beep should be done
                setTimeout(resolve, 600);
            } catch (error) {
                reject(error);
            }
        })
    );

    // Method 2: HTML5 Audio with data URI fallback
    promises.push(
        new Promise<void>((resolve, reject) => {
            try {
                // Very short, simple beep sound encoded as base64 data URI
                const audio = new Audio(
                    'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhbAYAAAD//wEA/P/+//z/+f/9//n//////v////3//f8EAAgA+//3/wQA9//9/wMA+v8GAAYA/P/8/wcA8v/+/wIA8//+/wEAAAAAAAYACAADAAUABgAHAPz/BQAjACYAGQALABYAIAAjABkAJgA7ACoACgAfADEAQAA4ACgAEwALABoAGAAIAPL/6v/j/97/2P/P/8z/v/+0/7v/t/+j/5n/nP+G/4H/f/92/2T/Wv9k/13/SP84/0j/N/8w/y7/LP9E/0n/M/9J/1X/U/9d/3D/if+P/5L/wP/c/7f/x//y/w0AAQAaAEEAOgA/AH8AmQCDAJcA2wDOAK0A3QD0ANEQ0ADzAPsAiAGjAWgBbgD'
                );

                audio.onended = () => resolve();
                audio.onerror = (error) => reject(error);

                // Play the sound
                audio.play().catch(reject);
            } catch (error) {
                reject(error);
            }
        })
    );

    // Method 3: Simple beep using window.console (works in some browsers)
    promises.push(
        new Promise<void>((resolve) => {
            // Try console.log with special character that might beep in some browsers
            console.log('\u0007');
            setTimeout(resolve, 100);
        })
    );

    // Return a promise that resolves when any of the methods succeed
    return Promise.any(promises).catch((error) => {
        console.error('All sound methods failed:', error);
        return Promise.reject(error);
    });
};

// Function to check if the page is visible or in background
const isPageVisible = () => {
    if (typeof document === 'undefined') return true;
    return document.visibilityState === 'visible';
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        return 'denied';
    }

    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        return await Notification.requestPermission();
    }

    return Notification.permission;
};

// Create a visual on-screen notification
const showVisualNotification = (title: string, message: string) => {
    // Check if the notification element already exists
    let notificationElement = document.getElementById('app-notification');

    // Create it if it doesn't exist
    if (!notificationElement) {
        notificationElement = document.createElement('div');
        notificationElement.id = 'app-notification';
        notificationElement.style.position = 'fixed';
        notificationElement.style.top = '20px';
        notificationElement.style.right = '20px';
        notificationElement.style.maxWidth = '300px';
        notificationElement.style.padding = '15px';
        notificationElement.style.backgroundColor = '#4CAF50';
        notificationElement.style.color = 'white';
        notificationElement.style.borderRadius = '4px';
        notificationElement.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        notificationElement.style.zIndex = '9999';
        notificationElement.style.transition = 'all 0.3s ease-in-out';
        notificationElement.style.opacity = '0';
        notificationElement.style.transform = 'translateY(-20px)';

        document.body.appendChild(notificationElement);
    }

    // Update content
    notificationElement.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 5px;">${title}</div>
        <div>${message}</div>
    `;

    // Show the notification with animation
    setTimeout(() => {
        if (notificationElement) {
            notificationElement.style.opacity = '1';
            notificationElement.style.transform = 'translateY(0)';
        }
    }, 10);

    // Hide after 5 seconds
    setTimeout(() => {
        if (notificationElement) {
            notificationElement.style.opacity = '0';
            notificationElement.style.transform = 'translateY(-20px)';
        }
    }, 5000);

    // Remove from DOM after fade out
    setTimeout(() => {
        if (notificationElement && notificationElement.parentNode) {
            notificationElement.parentNode.removeChild(notificationElement);
        }
    }, 5300);
};

// Send notification based on configuration and page visibility
export const sendNotification = async (title: string, message: string): Promise<boolean> => {
    const config = getNotificationConfig();

    if (!config.enabled) {
        console.log('Notifications are disabled');
        return false;
    }

    let success = false;
    const pageIsVisible = isPageVisible();

    // Always play sound regardless of configuration
    try {
        await playNotificationSound();
        success = true;
    } catch (error) {
        console.error('Failed to play notification sound:', error);
    }

    // Try system notification if appropriate
    if (!pageIsVisible && (config.notificationType === 'system' || config.notificationType === 'both')) {
        if (typeof window !== 'undefined' && 'Notification' in window) {
            const notificationPermission = Notification.permission;

            if (notificationPermission === 'granted') {
                try {
                    const notification = new Notification(title, {
                        body: message,
                        icon: '/favicon.ico'
                    });

                    notification.onclick = () => {
                        window.focus();
                        notification.close();
                    };

                    success = true;
                } catch (error) {
                    console.error('Failed to show system notification:', error);
                }
            } else if (notificationPermission !== 'denied') {
                // Try to get permission
                try {
                    const permission = await Notification.requestPermission();
                    if (permission === 'granted') {
                        const notification = new Notification(title, {
                            body: message,
                            icon: '/favicon.ico'
                        });

                        notification.onclick = () => {
                            window.focus();
                            notification.close();
                        };

                        success = true;
                    }
                } catch (error) {
                    console.error('Failed to request notification permission:', error);
                }
            }
        }
    }

    // If page is visible or system notification failed, show visual notification
    if (pageIsVisible || !success) {
        showVisualNotification(title, message);
        success = true;
    }

    return success;
};

// Legacy function for backward compatibility
export const sendWhatsAppNotification = async (message: string): Promise<boolean> => {
    return sendNotification('Productivity Tracker', message);
};

// Test function to trigger a notification for debugging
export const testNotificationSystem = async (): Promise<boolean> => {
    return sendNotification('Test Notification', 'This is a test notification from Productivity Tracker');
};
