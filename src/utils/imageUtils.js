import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Enhance a scanned document image:
 * - Resize to a reasonable width
 * - Convert to JPEG with quality settings
 * @param {string} uri - Source image URI
 * @param {object} options
 * @param {number} [options.maxWidth=1600] - Max width in pixels
 * @param {number} [options.quality=0.85] - JPEG quality (0–1)
 * @param {boolean} [options.grayscale=false] - Convert to grayscale
 * @returns {Promise<string>} - Processed image URI
 */
export async function enhanceDocumentImage(uri, options = {}) {
  const { maxWidth = 1600, quality = 0.85, grayscale = false } = options;

  const actions = [
    { resize: { width: maxWidth } },
  ];

  if (grayscale) {
    actions.push({ grayscale: true });
  }

  const result = await ImageManipulator.manipulateAsync(uri, actions, {
    compress: quality,
    format: ImageManipulator.SaveFormat.JPEG,
  });

  return result.uri;
}

/**
 * Rotate an image by the given degrees.
 * @param {string} uri
 * @param {number} degrees - Rotation in degrees (90, 180, 270, etc.)
 * @returns {Promise<string>}
 */
export async function rotateImage(uri, degrees) {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ rotate: degrees }],
    { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result.uri;
}

/**
 * Crop an image given a crop region.
 * @param {string} uri
 * @param {{ originX: number, originY: number, width: number, height: number }} region
 * @returns {Promise<string>}
 */
export async function cropImage(uri, region) {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ crop: region }],
    { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result.uri;
}

/**
 * Flip an image horizontally or vertically.
 * @param {string} uri
 * @param {'horizontal'|'vertical'} direction
 * @returns {Promise<string>}
 */
export async function flipImage(uri, direction) {
  const flipAction = direction === 'horizontal'
    ? { flip: ImageManipulator.FlipType.Horizontal }
    : { flip: ImageManipulator.FlipType.Vertical };

  const result = await ImageManipulator.manipulateAsync(
    uri,
    [flipAction],
    { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result.uri;
}
