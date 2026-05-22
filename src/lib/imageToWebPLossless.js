import { encode } from '@jsquash/webp';

/**
 * Configuración del encoder WebP (libwebp vía WASM).
 * lossless: 1 → compresión sin pérdida: cada píxel del canvas se conserva.
 * exact: 1 → mantiene valores RGB exactos (importante si hay transparencia).
 * method: 0-6 → mayor valor = más tiempo de encode, mejor ratio de compresión.
 */
export const WEBP_LOSSLESS_ENCODE_OPTIONS = {
  lossless: 1,
  exact: 1,
  quality: 100,
  method: 6,
  near_lossless: 100,
};

/** Límite de seguridad de memoria en el navegador (~16 MP). */
const MAX_IMAGE_PIXELS = 16_000_000;

/**
 * Decodifica un File/Blob de imagen y devuelve ImageData vía canvas (sin reescalar).
 * createImageBitmap respeta orientación EXIF en navegadores modernos.
 */
async function fileToImageData(file) {
  let bitmap;

  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error('No se pudo leer la imagen. Usá JPG, PNG o WebP.');
  }

  const { width, height } = bitmap;

  if (width * height > MAX_IMAGE_PIXELS) {
    bitmap.close?.();
    throw new Error(
      'La imagen es demasiado grande para procesarla en el dispositivo. Probá con una foto de menor resolución.',
    );
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    bitmap.close?.();
    throw new Error('El navegador no pudo preparar el lienzo de conversión.');
  }

  ctx.drawImage(bitmap, 0, 0);
  bitmap.close?.();

  const imageData = ctx.getImageData(0, 0, width, height);

  // Liberar referencias del canvas lo antes posible (GC).
  canvas.width = 0;
  canvas.height = 0;

  return imageData;
}

/**
 * Genera un nombre único para Supabase Storage con extensión .webp.
 */
export function buildUniqueWebpFileName() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}.webp`;
}

/**
 * Pipeline cliente: imagen original → WebP lossless → File listo para subir.
 *
 * @param {File} imageFile - Archivo desde <input accept="image/*" />
 * @returns {Promise<{ file: File, fileName: string, originalSize: number, outputSize: number }>}
 */
export async function convertImageToWebPLossless(imageFile) {
  if (!imageFile?.type?.startsWith('image/')) {
    throw new Error('El archivo seleccionado no es una imagen válida.');
  }

  const imageData = await fileToImageData(imageFile);

  let webpBuffer;
  try {
    webpBuffer = await encode(imageData, WEBP_LOSSLESS_ENCODE_OPTIONS);
  } catch (error) {
    console.error('WebP encode error:', error);
    throw new Error('No se pudo convertir la imagen a WebP. Intentá de nuevo.');
  }

  if (!webpBuffer || webpBuffer.byteLength === 0) {
    throw new Error('La conversión WebP produjo un archivo vacío.');
  }

  const fileName = buildUniqueWebpFileName();
  const webpFile = new File([webpBuffer], fileName, {
    type: 'image/webp',
    lastModified: Date.now(),
  });

  return {
    file: webpFile,
    fileName,
    originalSize: imageFile.size,
    outputSize: webpFile.size,
  };
}
