// Utility function to safely get base64 from an image
export const getImageBase64 = (src: string): Promise<{ base64: string; width: number; height: number } | null> => {
    return new Promise((resolve) => {
        const img = new window.Image();
        img.crossOrigin = 'Anonymous';
        img.src = src;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(null);
                return;
            }
            ctx.drawImage(img, 0, 0);

            try {
                const dataURL = canvas.toDataURL('image/png');
                resolve({ base64: dataURL, width: img.width, height: img.height });
            } catch (e) {
                console.error("Error converting canvas to data URL", e);
                resolve(null);
            }
        };

        img.onerror = (e) => {
            console.error("Failed to load image for PDF conversion:", src, e);
            resolve(null); // Resolve with null if the image fails to load
        };
    });
};

export const addPdfHeader = async (doc: any) => {
    const { jsPDF } = await import('jspdf');
    const latinLogoData = await getImageBase64('/imagenes/logos/Logo-Latin-Store-House-color.png');
    const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

    if (latinLogoData) {
        const logoWidth = 20;
        const logoHeight = latinLogoData.height * (logoWidth / latinLogoData.width);
        doc.addImage(latinLogoData.base64, 'PNG', 14, 10, logoWidth, logoHeight);
    }
    
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('Latin Store House S.A.S', pageWidth - 14, 15, { align: 'right' });
    doc.text('NIT: 900493221-0', pageWidth - 14, 19, { align: 'right' });
};
