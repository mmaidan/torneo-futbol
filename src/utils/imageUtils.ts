// Reduce una imagen subida por el usuario a un escudo chico en formato data URL,
// para guardarlo directo dentro del documento del torneo en Firestore
// (límite de 1 MB por documento, por eso se mantiene muy liviano).

const MAX_INPUT_BYTES = 8 * 1024 * 1024;
const MAX_OUTPUT_CHARS = 90_000;
const SIZES = [192, 144, 112, 80];

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo leer la imagen. Probá con un PNG o JPG.'));
    };
    img.src = url;
  });
}

export async function imageFileToLogoDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo tiene que ser una imagen (PNG, JPG o WebP).');
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error('La imagen pesa más de 8 MB. Elegí una más liviana.');
  }

  const img = await loadImage(file);
  const w0 = img.naturalWidth;
  const h0 = img.naturalHeight;
  if (!w0 || !h0) {
    throw new Error('No se pudo leer el tamaño de la imagen. Probá con un PNG o JPG.');
  }

  for (const maxSide of SIZES) {
    const scale = Math.min(1, maxSide / Math.max(w0, h0));
    const w = Math.max(1, Math.round(w0 * scale));
    const h = Math.max(1, Math.round(h0 * scale));

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Tu navegador no puede procesar imágenes.');
    }
    ctx.drawImage(img, 0, 0, w, h);

    // WebP conserva la transparencia y pesa poco; si el navegador no lo soporta
    // devuelve PNG, y el bucle sigue achicando hasta que entre en el límite.
    const dataUrl = canvas.toDataURL('image/webp', 0.85);
    if (dataUrl.length <= MAX_OUTPUT_CHARS) {
      return dataUrl;
    }
  }

  throw new Error('No se pudo reducir la imagen lo suficiente. Probá con otra.');
}
