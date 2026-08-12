import imageCompression from 'browser-image-compression';

export async function compressImageForAi(file: File): Promise<string> {
  const options = {
    maxSizeMB: 1, // aggressive compression
    maxWidthOrHeight: 1024,
    useWebWorker: true,
    fileType: 'image/jpeg',
    initialQuality: 0.7,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    
    // Convert to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onloadend = () => {
        const base64data = reader.result as string;
        // Strip out the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = base64data.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
}
