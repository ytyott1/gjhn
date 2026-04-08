import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Pdf from 'react-native-pdf';
import * as Sharing from 'expo-sharing';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { formatDate, formatFileSize } from '../utils/pdfUtils';

export default function PDFViewerScreen({ route, navigation }) {
  const { document } = route.params;
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function handleShare() {
    try {
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert('Sharing not available', 'Sharing is not supported on this device.');
        return;
      }
      await Sharing.shareAsync(document.uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Share "${document.name}"`,
      });
    } catch {
      Alert.alert('Error', 'Failed to share the document.');
    }
  }

  function handleEdit() {
    navigation.navigate('PDFEditor', { document });
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Info bar */}
      <View style={styles.infoBar}>
        <View style={styles.infoLeft}>
          <Text style={styles.pageIndicator} numberOfLines={1}>
            {loading ? 'Loading...' : `Page ${currentPage} of ${totalPages}`}
          </Text>
          {document.size > 0 && (
            <Text style={styles.fileSize}>{formatFileSize(document.size)}</Text>
          )}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
            <Text style={styles.actionButtonText}>✎ Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.shareButton]}
            onPress={handleShare}
          >
            <Text style={[styles.actionButtonText, { color: COLORS.white }]}>
              ↑ Share
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* PDF viewer */}
      <View style={styles.pdfContainer}>
        {error ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>⚠️ Failed to load PDF</Text>
            <Text style={styles.errorSubtext}>{error}</Text>
          </View>
        ) : (
          <Pdf
            source={{ uri: document.uri, cache: true }}
            style={styles.pdf}
            onLoadComplete={(numberOfPages) => {
              setTotalPages(numberOfPages);
              setLoading(false);
            }}
            onPageChanged={(page) => setCurrentPage(page)}
            onError={(err) => {
              setLoading(false);
              setError(String(err));
            }}
            enablePaging={Platform.OS === 'android'}
            horizontal={false}
            enableRTL={false}
            fitPolicy={0}
          />
        )}

        {loading && !error && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading PDF...</Text>
          </View>
        )}
      </View>

      {/* Metadata footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText} numberOfLines={1}>
          {document.name}
        </Text>
        <Text style={styles.footerDate}>
          {document.createdAt ? formatDate(document.createdAt) : ''}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  infoLeft: {
    flex: 1,
  },
  pageIndicator: {
    fontSize: FONTS.sizes.md,
    color: COLORS.text,
    fontWeight: '600',
  },
  fileSize: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  shareButton: {
    backgroundColor: COLORS.primary,
  },
  actionButtonText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  pdfContainer: {
    flex: 1,
    position: 'relative',
  },
  pdf: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: FONTS.sizes.xl,
    color: COLORS.error,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
  },
  footer: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  footerText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  footerDate: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
