import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createPdfFromImages, generateDefaultTitle } from '../utils/pdfUtils';
import { rotateImage } from '../utils/imageUtils';
import { saveDocument } from '../utils/storageUtils';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

export default function ReviewScreen({ route, navigation }) {
  const initialPages = route.params?.pages || [];
  const [pages, setPages] = useState(initialPages);
  const [title, setTitle] = useState(generateDefaultTitle());
  const [creating, setCreating] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);

  async function handleCreatePdf() {
    if (pages.length === 0) {
      Alert.alert('No pages', 'Add at least one page before creating a PDF.');
      return;
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert('No title', 'Please enter a title for the document.');
      return;
    }

    setCreating(true);
    try {
      const doc = await createPdfFromImages(pages, trimmedTitle);
      await saveDocument(doc);
      navigation.navigate('PDFViewer', { document: doc, title: doc.name });
    } catch (err) {
      Alert.alert('Error', 'Failed to create PDF. Please try again.');
    } finally {
      setCreating(false);
    }
  }

  async function handleRotatePage(index) {
    try {
      const rotated = await rotateImage(pages[index], 90);
      const updated = [...pages];
      updated[index] = rotated;
      setPages(updated);
    } catch {
      Alert.alert('Error', 'Failed to rotate image.');
    }
  }

  function handleDeletePage(index) {
    if (pages.length === 1) {
      Alert.alert(
        'Cannot remove',
        'A document must have at least one page.',
      );
      return;
    }
    Alert.alert(
      'Remove page',
      `Remove page ${index + 1}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updated = pages.filter((_, i) => i !== index);
            setPages(updated);
            setSelectedIndex(null);
          },
        },
      ]
    );
  }

  function movePage(from, to) {
    if (to < 0 || to >= pages.length) return;
    const updated = [...pages];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setPages(updated);
    setSelectedIndex(to);
  }

  function handleAddMore() {
    navigation.navigate('Scan', { existingPages: pages });
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.container} edges={['bottom']}>
        {/* Title input */}
        <View style={styles.titleSection}>
          <Text style={styles.label}>Document Title</Text>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter document name..."
            placeholderTextColor={COLORS.textLight}
            maxLength={100}
            autoCorrect={false}
          />
        </View>

        <Text style={styles.sectionHeader}>
          Pages ({pages.length})
        </Text>

        {/* Page thumbnails */}
        <FlatList
          data={pages}
          keyExtractor={(_, i) => String(i)}
          horizontal={false}
          numColumns={2}
          contentContainerStyle={styles.grid}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[
                styles.pageCard,
                selectedIndex === index && styles.pageCardSelected,
              ]}
              onPress={() =>
                setSelectedIndex(selectedIndex === index ? null : index)
              }
              activeOpacity={0.8}
            >
              <Image source={{ uri: item }} style={styles.thumbnail} />
              <View style={styles.pageActions}>
                <Text style={styles.pageLabel}>Page {index + 1}</Text>
                <View style={styles.pageButtons}>
                  <TouchableOpacity
                    style={styles.pageButton}
                    onPress={() => movePage(index, index - 1)}
                    disabled={index === 0}
                  >
                    <Text style={[styles.pageButtonText, index === 0 && styles.disabled]}>
                      ↑
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.pageButton}
                    onPress={() => movePage(index, index + 1)}
                    disabled={index === pages.length - 1}
                  >
                    <Text
                      style={[
                        styles.pageButtonText,
                        index === pages.length - 1 && styles.disabled,
                      ]}
                    >
                      ↓
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.pageButton}
                    onPress={() => handleRotatePage(index)}
                  >
                    <Text style={styles.pageButtonText}>↻</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.pageButton}
                    onPress={() => handleDeletePage(index)}
                  >
                    <Text style={[styles.pageButtonText, { color: COLORS.error }]}>🗑</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />

        {/* Action buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.addMoreButton}
            onPress={handleAddMore}
          >
            <Text style={styles.addMoreButtonText}>+ Add Pages</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.createButton, creating && styles.createButtonDisabled]}
            onPress={handleCreatePdf}
            disabled={creating}
          >
            {creating ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={styles.createButtonText}>Create PDF</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  titleSection: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  label: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  titleInput: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.text,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingVertical: SPACING.xs,
  },
  sectionHeader: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grid: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  pageCard: {
    flex: 1,
    margin: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  pageCardSelected: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 0.707,
    resizeMode: 'cover',
  },
  pageActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  pageLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  pageButtons: {
    flexDirection: 'row',
  },
  pageButton: {
    padding: SPACING.xs,
  },
  pageButtonText: {
    fontSize: 16,
    color: COLORS.primary,
  },
  disabled: {
    color: COLORS.textLight,
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    gap: SPACING.md,
  },
  addMoreButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
  },
  addMoreButtonText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
  },
  createButton: {
    flex: 2,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  createButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  createButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
  },
});
