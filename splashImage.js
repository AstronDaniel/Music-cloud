// splashImage.js
async function loadSplashImage() {
    const splashContainer = document.getElementById('splashImage');
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    try {
        loadingOverlay.classList.remove('hidden');
        const response = await fetch('A70qkikzWdKfEkQfVSSMw3cAPcL-6ZdFXng3fpYeIBA');
        const data = await response.json();
        
        // Preload image
        const img = new Image();
        img.onload = () => {
            splashContainer.src = data.imageUrl;
            splashContainer.classList.add('fade-in');
            loadingOverlay.classList.add('hidden');
        };
        img.src = data.imageUrl;
    } catch (error) {
        console.error('Failed to load splash image:', error);
        // Fallback image
        splashContainer.src = '/assets/default-splash.jpg';
        loadingOverlay.classList.add('hidden');
    }
}