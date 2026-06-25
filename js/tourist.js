// ==================== TOURIST ====================
async function loadTouristInfo() {
    try {
        const info = await apiCall('/tourist/about');
        // Info is already displayed in HTML
        console.log('Tourist info loaded:', info);
    } catch (error) {
        console.error('Error loading tourist info:', error);
    }
}

loadTouristInfo();
