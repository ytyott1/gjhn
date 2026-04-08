// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  getInfoAsync: jest.fn().mockResolvedValue({ exists: true }),
  makeDirectoryAsync: jest.fn().mockResolvedValue(undefined),
  deleteAsync: jest.fn().mockResolvedValue(undefined),
  documentDirectory: 'file://documents/',
}));

const AsyncStorage = require('@react-native-async-storage/async-storage');
const FileSystem = require('expo-file-system');

import {
  loadDocuments,
  saveDocument,
  updateDocument,
  deleteDocument,
  findDocument,
  clearAllDocuments,
} from '../src/utils/storageUtils';

const sampleDoc = {
  id: '123',
  uri: 'file://documents/pdfs/test.pdf',
  name: 'Test Document',
  fileName: 'test.pdf',
  size: 1024,
  pageCount: 3,
  createdAt: '2024-01-15T10:00:00.000Z',
  updatedAt: '2024-01-15T10:00:00.000Z',
};

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
  FileSystem.getInfoAsync.mockResolvedValue({ exists: true });
});

describe('loadDocuments', () => {
  it('returns empty array when no documents are stored', async () => {
    const docs = await loadDocuments();
    expect(docs).toEqual([]);
  });

  it('returns stored documents', async () => {
    await AsyncStorage.setItem(
      '@docscanner_documents',
      JSON.stringify([sampleDoc])
    );
    const docs = await loadDocuments();
    expect(docs).toHaveLength(1);
    expect(docs[0].id).toBe('123');
  });

  it('filters out documents with missing files', async () => {
    FileSystem.getInfoAsync.mockResolvedValue({ exists: false });
    await AsyncStorage.setItem(
      '@docscanner_documents',
      JSON.stringify([sampleDoc])
    );
    const docs = await loadDocuments();
    expect(docs).toHaveLength(0);
  });
});

describe('saveDocument', () => {
  it('adds a new document to storage', async () => {
    const result = await saveDocument(sampleDoc);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('123');
  });

  it('prepends new document to existing list', async () => {
    const existingDoc = { ...sampleDoc, id: '1', name: 'Existing' };
    await AsyncStorage.setItem(
      '@docscanner_documents',
      JSON.stringify([existingDoc])
    );

    const newDoc = { ...sampleDoc, id: '2', name: 'New Document' };
    const result = await saveDocument(newDoc);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('2');
    expect(result[1].id).toBe('1');
  });
});

describe('updateDocument', () => {
  it('updates an existing document', async () => {
    await AsyncStorage.setItem(
      '@docscanner_documents',
      JSON.stringify([sampleDoc])
    );
    const result = await updateDocument('123', { name: 'Updated Name' });
    const updated = result.find((d) => d.id === '123');
    expect(updated.name).toBe('Updated Name');
  });

  it('sets updatedAt when updating', async () => {
    await AsyncStorage.setItem(
      '@docscanner_documents',
      JSON.stringify([sampleDoc])
    );
    const before = new Date(sampleDoc.updatedAt).getTime();
    const result = await updateDocument('123', { name: 'New Name' });
    const updated = result.find((d) => d.id === '123');
    const after = new Date(updated.updatedAt).getTime();
    expect(after).toBeGreaterThanOrEqual(before);
  });
});

describe('deleteDocument', () => {
  it('removes a document from storage', async () => {
    await AsyncStorage.setItem(
      '@docscanner_documents',
      JSON.stringify([sampleDoc])
    );
    const result = await deleteDocument('123');
    expect(result).toHaveLength(0);
  });

  it('does not affect other documents', async () => {
    const doc2 = { ...sampleDoc, id: '456', name: 'Keep Me' };
    await AsyncStorage.setItem(
      '@docscanner_documents',
      JSON.stringify([sampleDoc, doc2])
    );
    const result = await deleteDocument('123');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('456');
  });
});

describe('findDocument', () => {
  it('finds a document by id', async () => {
    await AsyncStorage.setItem(
      '@docscanner_documents',
      JSON.stringify([sampleDoc])
    );
    const found = await findDocument('123');
    expect(found).toBeDefined();
    expect(found.name).toBe('Test Document');
  });

  it('returns null when document not found', async () => {
    const result = await findDocument('nonexistent');
    expect(result).toBeNull();
  });
});

describe('clearAllDocuments', () => {
  it('removes all documents', async () => {
    await AsyncStorage.setItem(
      '@docscanner_documents',
      JSON.stringify([sampleDoc])
    );
    await clearAllDocuments();
    const docs = await loadDocuments();
    expect(docs).toHaveLength(0);
  });
});
