export const parseFeatures = (features) => {
  if (!features) return [];
  if (Array.isArray(features)) return features;
  try {
    // Try parsing as JSON
    const parsed = JSON.parse(features);
    if (Array.isArray(parsed)) return parsed;
    
    // Handle new structured format { list: [...], cabRates: {...} }
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.list)) {
      return parsed.list;
    }
    
    return [String(parsed)]; // If valid JSON but not array/structured object, convert to string array
  } catch (e) {
    // If JSON parse fails, assume comma-separated string
    return String(features).split(',').map(f => f.trim()).filter(f => f);
  }
};
