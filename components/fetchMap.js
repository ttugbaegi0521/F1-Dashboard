// fetchMap.js
export async function fetchTrackCorners() {
    try {
        const circuitId = 39
        const year = 2021
        const response = await fetch(`/api/track/corners/${circuitId}/${year}`);
        if (!response.ok) {
            throw new Error('Failed to fetch track corners');
        }
        const data = await response.json();
        console.log('Track Corners:', data);
        return data;
    } catch (error) {
        console.error('Error fetching track corners:', error);
        throw error;
    }
}
