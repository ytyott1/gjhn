import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

import { createPdfFromImages, deletePdf } from '../utils/pdfUtils';
import { updateDocument, deleteDocument } from '../utils/storageUtils';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

export default function PDFEditorScreen({ route, navigation }) {
  const { document: initialDoc } = route.params;
  const [doc, setDoc] = useState(initialDoc);
  const [name, setName] = useState(initialDoc.name);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSaveTitle() {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Invalid name', 'Document name cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      const updated = await updateDocument(doc.id, { name: trimmed });
      const updatedDoc = updated.find((d) => d.id === doc.id);
      if (updatedDoc) {
        setDoc(updatedDoc);
        navigation.setOptions({ title: trimmed });
      }
      Alert.alert('Saved', 'Document name updated successfully.');
    } catch {
      Alert.alert('Error', 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  }

  async function handleShare() {
    try {
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert('Sharing not available', 'Sharing is not supported on this device.');
        return;
      }
      await Sharing.shareAsync(doc.uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Share "${doc.name}"`,
      });
    } catch {
      Alert.alert('Error', 'Failed to share the document.');
    }
  }

  async function handleDeleteDocument() {
    Alert.alert(
      'Delete Document',
      `Permanently delete "${doc.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deletePdf(doc.uri);
              await deleteDocument(doc.id);
              navigation.popToTop();
            } catch {
              Alert.alert('Error', 'Failed to delete the document.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  }

  async function handleAddPagesFromCamera() {
    navigation.navigate('Scan', {
      existingDocId: doc.id,
      existingPages: [],
    });
  }

  async function handleImportImages() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/jpeg', 'image/png', 'image/jpg'],
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) return;

      const imageUris = result.assets.map((a) => a.uri);
      navigation.navigate('Review', {
        pages: imageUris,
        existingDocId: doc.id,
      });
    } catch {
      Alert.alert('Error', 'Failed to import images.');
    }
  }

  const InfoRow = ({ label, value }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.content}>

          {/* Document name */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Document Name</Text>
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              placeholder="Document name"
              placeholderTextColor={COLORS.textLight}
              maxLength={100}
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.buttonDisabled]}
              onPress={handleSaveTitle}
              disabled={saving || name.trim() === doc.name}
            >
              {saving ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Save Name</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Document info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Document Info</Text>
            <InfoRow label="Pages" value={String(doc.pageCount || '—')} />
            <InfoRow
              label="Created"
              value={
                doc.createdAt
                  ? new Date(doc.createdAt).toLocaleString()
                  : '—'
              }
            />
            <InfoRow
              label="Last modified"
              value={
                doc.updatedAt
                  ? new Date(doc.updatedAt).toLocaleString()
                  : '—'
              }
            />
          </View>

          {/* Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actions</Text>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() =>
                navigation.navigate('PDFViewer', { document: doc, title: doc.name })
              }
            >
              <Text style={styles.actionIcon}>📄</Text>
              <Text style={styles.actionText}>View PDF</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionRow} onPress={handleShare}>
              <Text style={styles.actionIcon}>↑</Text>
              <Text style={styles.actionText}>Share / Export</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={handleAddPagesFromCamera}
            >
              <Text style={styles.actionIcon}>📷</Text>
              <Text style={styles.actionText}>Scan More Pages</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionRow}
              onPress={handleImportImages}
            >
              <Text style={styles.actionIcon}>🖼️</Text>
              <Text style={styles.actionText}>Import Images</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Danger zone */}
          <View style={[styles.section, styles.dangerSection]}>
            <Text style={[styles.sectionTitle, { color: COLORS.error }]}>
              Danger Zone
            </Text>
            <TouchableOpacity
              style={[styles.deleteButton, deleting && styles.buttonDisabled]}
              onPress={handleDeleteDocument}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.deleteButtonText}>🗑 Delete Document</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  sectionTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.md,
  },
  nameInput: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.text,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.md,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  infoLabel: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: SPACING.md,
    width: 28,
    textAlign: 'center',
  },
  actionText: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
  },
  chevron: {
    fontSize: FONTS.sizes.xl,
    color: COLORS.textLight,
  },
  dangerSection: {
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  deleteButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
});
