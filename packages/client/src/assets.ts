import { useState, useEffect } from 'react';

// Simplified hook for preloading assets (images, audio)
// Returns progress (0-100) and loaded (boolean)
export function usePreload(assets: string[]) {
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (assets.length === 0) {
      setLoaded(true);
      setProgress(100);
      return;
    }

    let loadedCount = 0;
    const total = assets.length;

    const onLoad = () => {
      loadedCount++;
      setProgress(Math.round((loadedCount / total) * 100));
      if (loadedCount === total) {
        setLoaded(true);
      }
    };

    assets.forEach(src => {
        // Basic Image preloading
        // (For Audio, we would need to use Audio() object or fetch)
        if (src.match(/\.(jpeg|jpg|gif|png|webp)$/)) {
            const img = new Image();
            img.onload = onLoad;
            img.onerror = onLoad; // Count errors as loaded to not block game
            img.src = src;
        } else {
            // Assume generic fetch for other assets
            fetch(src).then(onLoad).catch(onLoad);
        }
    });
  }, [JSON.stringify(assets)]);

  return { loaded, progress };
}
