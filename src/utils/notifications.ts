// For a real implementation, you would need to use a WhatsApp API service
// This is a simplified version that shows how to implement it
// You would need to set up a proper WhatsApp Business API or use a service like Twilio

interface NotificationConfig {
    enabled: boolean;
    phoneNumber?: string; // Format should be with country code, e.g., "1234567890"
}

const NOTIFICATION_CONFIG_KEY = 'productivity-notification-config';

export const saveNotificationConfig = (config: NotificationConfig): void => {
    if (typeof window === 'undefined') return;

    localStorage.setItem(NOTIFICATION_CONFIG_KEY, JSON.stringify(config));
};

export const getNotificationConfig = (): NotificationConfig => {
    if (typeof window === 'undefined') return { enabled: false };

    const savedConfig = localStorage.getItem(NOTIFICATION_CONFIG_KEY);
    if (!savedConfig) return { enabled: false };

    try {
        return JSON.parse(savedConfig);
    } catch (error) {
        console.error('Failed to parse notification config:', error);

        return { enabled: false };
    }
};

export const sendWhatsAppNotification = async (message: string): Promise<boolean> => {
    const config = getNotificationConfig();

    if (!config.enabled || !config.phoneNumber) {
        console.log('WhatsApp notifications are disabled or phone number is not set');
        // Fall back to browser notification
        if (typeof window !== 'undefined' && 'Notification' in window) {
            const notificationPermission = Notification.permission;
            if (notificationPermission === 'granted') {
                new Notification('Productivity Tracker', { body: message });
            } else if (notificationPermission !== 'denied') {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    new Notification('Productivity Tracker', { body: message });
                }
            }
        }

        return false;
    }

    // For demonstration purposes: In a real app, you would connect to a WhatsApp API here
    console.log(`Would send WhatsApp message to ${config.phoneNumber}: ${message}`);

    // For a real implementation, you would use something like:
    // const response = await fetch('your-whatsapp-api-endpoint', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     phone: config.phoneNumber,
    //     message: message,
    //   }),
    // });
    // return response.ok;

    return true; // Mock success
};
