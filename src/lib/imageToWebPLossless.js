import { encode } from '@jsquash/webp';

/**
 * Configuración del encoder WebP (libwebp vía WASM).
 * lossless: 1 → sin pérdida sobre los píxeles del canvas de salida.
 * method: 0 → encode más rápido (6 es muy lento en móvil).
 */
export const WEBP_LOSSLESS_ENCODE_OPTIONS = {
  lossless: 1,
  exact: 1,
  quality: 100,
  method: 0,
  near_lossless: 100,
  low_memory: 1,
};

/** Máximo lado largo: suficiente para galería y mucho más rápido que 4K+ raw. */
const MAX_LONG_EDGE = 1920;

/**
 * Decodifica y, si hace falta, reduce resolución antes de encode (gran ahorro de tiempo).
 */
async function fileToImageData(file) {
  let bitmap;

  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error('No se pudo leer la imagen. Usá JPG, PNG o WebP.');
  }

  const srcWidth = bitmap.width;
  const srcHeight = bitmap.height;
  const longEdge = Math.max(srcWidth, srcHeight);
  const scale = longEdge > MAX_LONG_EDGE ? MAX_LONG_EDGE / longEdge : 1;
  const width = Math.round(srcWidth * scale);
  const height = Math.round(srcHeight * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close?.();
    throw new Error('El navegador no pudo preparar el lienzo de conversión.');
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const imageData = ctx.getImageData(0, 0, width, height);

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
