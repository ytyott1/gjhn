import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const DOCUMENTS_KEY = '@docscanner_documents';

/**
 * Load all saved documents from storage.
 * @returns {Promise<Array>}
 */
export async function loadDocuments() {
  try {
    const json = await AsyncStorage.getItem(DOCUMENTS_KEY);
    if (!json) return [];
    const docs = JSON.parse(json);
    // Filter out documents whose files have been deleted outside the app
    const valid = await Promise.all(
      docs.map(async (doc) => {
        const info = await FileSystem.getInfoAsync(doc.uri);
        return info.exists ? doc : null;
      })
    );
    return valid.filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Save a new document to storage.
 * @param {object} doc - Document metadata object.
 * @returns {Promise<Array>} - Updated documents list.
 */
export async function saveDocument(doc) {
  const docs = await loadDocuments();
  const updated = [doc, ...docs];
  await AsyncStorage.setItem(DOCUMENTS_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Update an existing document's metadata.
 * @param {string} id - Document ID.
 * @param {object} updates - Fields to update.
 * @returns {Promise<Array>} - Updated documents list.
 */
export async function updateDocument(id, updates) {
  const docs = await loadDocuments();
  const updated = docs.map((doc) =>
    doc.id === id
      ? { ...doc, ...updates, updatedAt: new Date().toISOString() }
      : doc
  );
  await AsyncStorage.setItem(DOCUMENTS_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Delete a document from storage (does NOT delete the file).
 * @param {string} id - Document ID.
 * @returns {Promise<Array>} - Updated documents list.
 */
export async function deleteDocument(id) {
  const docs = await loadDocuments();
  const updated = docs.filter((doc) => doc.id !== id);
  await AsyncStorage.setItem(DOCUMENTS_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Find a document by ID.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function findDocument(id) {
  const docs = await loadDocuments();
  return docs.find((doc) => doc.id === id) || null;
}

/**
 * Clear all documents from storage (for testing/reset).
 * @returns {Promise<void>}
 */
export async function clearAllDocuments() {
  await AsyncStorage.removeItem(DOCUMENTS_KEY);
}
