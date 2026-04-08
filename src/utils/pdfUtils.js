import * as FileSystem from 'expo-file-system';
import { printToFileAsync } from 'expo-print';

const PDF_DIRECTORY = FileSystem.documentDirectory + 'pdfs/';

/**
 * Ensure the PDF storage directory exists.
 */
export async function ensurePdfDirectory() {
  const dirInfo = await FileSystem.getInfoAsync(PDF_DIRECTORY);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(PDF_DIRECTORY, { intermediates: true });
  }
}

/**
 * Build an HTML page string for an image.
 * @param {string} imageUri - The local URI of the image.
 * @returns {string}
 */
function buildImagePage(imageUri) {
  return `
    <div style="
      width: 100%;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      page-break-after: always;
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    ">
      <img
        src="${imageUri}"
        style="
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        "
      />
    </div>
  `;
}

/**
 * Create a PDF from an array of image URIs.
 * @param {string[]} imageUris - Array of local image URIs.
 * @param {string} title - Title / filename for the PDF (without extension).
 * @returns {Promise<{uri: string, name: string, size: number, createdAt: string}>}
 */
export async function createPdfFromImages(imageUris, title) {
  await ensurePdfDirectory();

  const pages = imageUris.map(buildImagePage).join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: white; }
          @page { margin: 0; size: A4; }
        </style>
      </head>
      <body>${pages}</body>
    </html>
  `;

  const { uri: tmpUri } = await printToFileAsync({ html, base64: false });

  const safeName = sanitizeFilename(title);
  const timestamp = Date.now();
  const fileName = `${safeName}_${timestamp}.pdf`;
  const destUri = PDF_DIRECTORY + fileName;

  await FileSystem.moveAsync({ from: tmpUri, to: destUri });

  const fileInfo = await FileSystem.getInfoAsync(destUri, { size: true });

  return {
    id: `${timestamp}`,
    uri: destUri,
    name: title,
    fileName,
    size: fileInfo.size || 0,
    pageCount: imageUris.length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Sanitize a string to be safe as a filename.
 * @param {string} name
 * @returns {string}
 */
export function sanitizeFilename(name) {
  return name
    .trim()
    .replace(/[^a-zA-Z0-9._\- ]/g, '_')
    .replace(/\s+/g, '_')
    .substring(0, 100);
}

/**
 * Delete a PDF file from the filesystem.
 * @param {string} uri - The local URI of the PDF.
 */
export async function deletePdf(uri) {
  const info = await FileSystem.getInfoAsync(uri);
  if (info.exists) {
    await FileSystem.deleteAsync(uri);
  }
}

/**
 * Format a file size in bytes to a human-readable string.
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Generate a default document title based on date.
 * @returns {string}
 */
export function generateDefaultTitle() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `Document_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
}

/**
 * Format an ISO date string for display.
 * @param {string} isoString
 * @returns {string}
 */
export function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
