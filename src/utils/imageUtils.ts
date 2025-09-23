/**
 * Utility functions for handling images in the canvas
 */

/**
 * Convert a File or Blob to a data URL
 */
export const fileToDataURL = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Failed to convert file to data URL'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Convert blob URL to data URL
 */
export const blobURLToDataURL = async (blobURL: string): Promise<string> => {
  const response = await fetch(blobURL);
  const blob = await response.blob();
  return fileToDataURL(blob);
};

/**
 * Check if a URL is a blob URL
 */
export const isBlobURL = (url: string): boolean => {
  return url.startsWith('blob:');
};

/**
 * Compress image data URL if it's too large
 */
export const compressImageDataURL = (dataURL: string, maxSizeKB: number = 500): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Start with original dimensions
      canvas.width = img.width;
      canvas.height = img.height;
      
      let quality = 0.8;
      let compressedDataURL = dataURL;
      
      // Try to compress until under size limit
      while (quality > 0.1) {
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        ctx?.drawImage(img, 0, 0);
        
        compressedDataURL = canvas.toDataURL('image/jpeg', quality);
        const sizeKB = (compressedDataURL.length * 0.75) / 1024; // Rough size estimation
        
        if (sizeKB <= maxSizeKB) break;
        quality -= 0.1;
      }
      
      resolve(compressedDataURL);
    };
    
    img.src = dataURL;
  });
};