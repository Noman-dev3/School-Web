import html2canvas from 'html2canvas';

export async function generateImageFromNode(node: HTMLElement, filename: string) {
  try {
    const canvas = await html2canvas(node, {
      scale: 2, // High resolution
      useCORS: true,
      backgroundColor: '#ffffff',
    });
    
    // Create a blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const { saveAs } = require('file-saver');
        saveAs(blob, filename);
      }
    }, 'image/png');
    
    return true;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}
