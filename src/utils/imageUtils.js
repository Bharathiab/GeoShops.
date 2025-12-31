import hospitalImage from '../assets/hospital_premium.png';
import hotelImage from '../assets/hotel_premium.png';
import salonImage from '../assets/salon_premium.png';
import cabImage from '../assets/cab_premium.png';

/**
 * Validates and provides a fallback for property images,
 * especially those blocked by tracking prevention (Yahoo/Bing etc.)
 */
export const getPropertyImage = (imageUrl, department) => {
    // Basic fallbacks based on department
    const fallbacks = {
        'Hotel': hotelImage,
        'Hospital': hospitalImage,
        'Salon': salonImage,
        'Cab': cabImage
    };

    const defaultFallback = hotelImage;
    const selectedFallback = fallbacks[department] || defaultFallback;

    if (!imageUrl) return selectedFallback;

    // Detect problematic tracking URLs
    const blockedKeywords = ['yahoo', 'bing', 'images.search', 'tracking-prevention'];
    const isBlockedUrl = blockedKeywords.some(keyword => imageUrl.toLowerCase().includes(keyword));

    if (isBlockedUrl) {
        console.warn(`[Image Guard] Blocked URL detected for ${department}, falling back to premium asset.`);
        return selectedFallback;
    }

    // Handle relative paths for local uploads
    if (!imageUrl.startsWith('http')) {
        return `https://geoshops-production.up.railway.app${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    }

    return imageUrl;
};

/**
 * Error handler for img tags to catch runtime loading failures
 */
export const handleImageError = (e, department) => {
    e.target.onerror = null; // Prevent infinite loop
    
    const fallbacks = {
        'Hotel': hotelImage,
        'Hospital': hospitalImage,
        'Salon': salonImage,
        'Cab': cabImage
    };

    e.target.src = fallbacks[department] || hotelImage;
};
