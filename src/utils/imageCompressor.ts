/**
 * Client-side canvas compression for evidence photos.
 * Keeps output below 100KB while preserving legibility of shop signboards and price boards.
 */
export async function compressEvidenceImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image element'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const maxDimension = 900;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Fill white background in case of transparent png
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Compress as jpeg with 0.72 quality (~40-60KB)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.72);
        resolve(compressedDataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Generates an SVG-based stylized shop evidence preview for fast testing
 */
export function generateDemoEvidencePhoto(shopName: string, brand: string, sellingPrice: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 420;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  const grad = ctx.createLinearGradient(0, 0, 640, 420);
  grad.addColorStop(0, '#1e293b');
  grad.addColorStop(1, '#0f172a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 640, 420);

  // Shop signboard container
  ctx.fillStyle = '#b91c1c';
  ctx.fillRect(30, 30, 580, 80);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(shopName.toUpperCase() || 'LPG RETAILER', 320, 75);

  // Cylinder representation
  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  ctx.roundRect(80, 150, 140, 220, [30, 30, 15, 15]);
  ctx.fill();

  ctx.fillStyle = '#c2410c';
  ctx.fillRect(115, 130, 70, 25); // valve guard
  ctx.fillStyle = '#fed7aa';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText(brand.split(' ')[0] || 'LPG', 150, 240);
  ctx.fillText('12 KG', 150, 270);

  // Price whiteboard
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(260, 150, 340, 220);
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 3;
  ctx.strokeRect(260, 150, 340, 220);

  ctx.fillStyle = '#991b1b';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('TODAY\'S CASH PRICE', 430, 190);

  ctx.fillStyle = '#dc2626';
  ctx.font = 'bold 42px monospace';
  ctx.fillText(`৳ ${sellingPrice}`, 430, 250);

  ctx.fillStyle = '#475569';
  ctx.font = '14px sans-serif';
  ctx.fillText('NO OFFICIAL RECEIPT GIVEN', 430, 290);
  ctx.fillText('SYNDICATE FIXED RATE', 430, 320);

  return canvas.toDataURL('image/jpeg', 0.8);
}
