import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Sharing from 'expo-sharing';

import DocumentCard from '../components/DocumentCard';
import EmptyState from '../components/EmptyState';
import { loadDocuments, deleteDocument } from '../utils/storageUtils';
import { deletePdf } from '../utils/pdfUtils';
import { COLORS, SPACING, FONTS, SHADOWS, BORDER_RADIUS } from '../constants/theme';

export default function HomeScreen({ navigation }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchDocuments();
    }, [])
  );

  async function fetchDocuments() {
    setLoading(true);
    try {
      const docs = await loadDocuments();
      setDocuments(docs);
    } finally {
      setLoading(false);
    }
  }

  function handleNewScan() {
    navigation.navigate('Scan');
  }

  function handleOpenDocument(doc) {
    navigation.navigate('PDFViewer', { document: doc, title: doc.name });
  }

  function handleEditDocument(doc) {
    navigation.navigate('PDFEditor', { document: doc });
  }

  async function handleShareDocument(doc) {
    try {
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert('Sharing not available', 'Sharing is not available on this device.');
        return;
      }
      await Sharing.shareAsync(doc.uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Share ${doc.name}`,
      });
    } catch {
      Alert.alert('Error', 'Failed to share the document.');
    }
  }

  async function handleDeleteDocument(doc) {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${doc.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePdf(doc.uri);
              const updated = await deleteDocument(doc.id);
              setDocuments(updated);
            } catch {
              Alert.alert('Error', 'Failed to delete the document.');
            }
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={documents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.list,
            documents.length === 0 && styles.listEmpty,
          ]}
          ListEmptyComponent={
            <EmptyState
              icon="📄"
              title="No Documents Yet"
              subtitle="Tap the + button below to scan your first document."
            />
          }
          renderItem={({ item }) => (
            <DocumentCard
              document={item}
              onOpen={() => handleOpenDocument(item)}
              onEdit={() => handleEditDocument(item)}
              onShare={() => handleShareDocument(item)}
              onDelete={() => handleDeleteDocument(item)}
            />
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={handleNewScan}
        activeOpacity={0.85}
        accessibilityLabel="Scan new document"
        accessibilityRole="button"
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: SPACING.md,
    paddingBottom: 80,
  },
  listEmpty: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    right: SPACING.xl,
    bottom: SPACING.xl,
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.large,
  },
  fabIcon: {
    fontSize: FONTS.sizes.xxxl,
    color: COLORS.white,
    lineHeight: 60,
    textAlign: 'center',
    marginTop: -2,
  },
});
