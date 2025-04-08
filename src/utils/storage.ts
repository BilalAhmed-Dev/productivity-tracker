interface TimeBlockData {
    id: string;
    status: 'waiting' | 'in-progress' | 'completed';
    remainingTime: number;
    description?: string;
    imagePath?: string;
}

const STORAGE_KEY = 'productivity-tracker-data';

interface StorageData {
    waitingBlocks: TimeBlockData[];
    inProgressBlocks: TimeBlockData[];
    completedBlocks: TimeBlockData[];
    breakTimeMinutes: number;
}

export const saveDataToLocalStorage = (data: StorageData) => {
    if (typeof window === 'undefined') return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const loadDataFromLocalStorage = (): StorageData | null => {
    if (typeof window === 'undefined') return null;

    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) return null;

    try {
        return JSON.parse(savedData);
    } catch (error) {
        console.error('Failed to parse saved data:', error);

        return null;
    }
};

export const clearLocalStorageData = () => {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('productivity-tracker-data');
    localStorage.removeItem('active-timer');
};

export const generateTimeBlocks = (hours = 8): TimeBlockData[] => {
    const blocks: TimeBlockData[] = [];
    const totalBlocks = hours * 6; // 6 blocks per hour (10 minutes each)

    for (let i = 0; i < totalBlocks; i++) {
        blocks.push({
            id: `block-${i}`,
            status: 'waiting',
            remainingTime: 600, // 10 minutes in seconds (600 seconds)
            description: ''
        });
    }

    return blocks;
};

export const saveActiveTimerState = (id: string, endTime: number, description: string) => {
    if (typeof window === 'undefined') return;

    localStorage.setItem(
        `active-timer`,
        JSON.stringify({
            endTime,
            description
        })
    );
};

export const loadActiveTimerState = (id: string) => {
    if (typeof window === 'undefined') return null;

    const data = localStorage.getItem(`active-timer`);
    if (!data) return null;

    try {
        return JSON.parse(data);
    } catch (error) {
        console.error('Failed to parse active timer data:', error);
        return null;
    }
};

export const clearActiveTimerState = (id: string) => {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(`active-timer`);
};

export type { TimeBlockData };
