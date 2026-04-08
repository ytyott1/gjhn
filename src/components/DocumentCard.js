import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { formatDate, formatFileSize } from '../utils/pdfUtils';

export default function DocumentCard({ document, onOpen, onEdit, onShare, onDelete }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onOpen}
      activeOpacity={0.85}
      accessibilityLabel={`Open ${document.name}`}
      accessibilityRole="button"
    >
      {/* PDF icon */}
      <View style={styles.iconContainer}>
        <Text style={styles.pdfIcon}>📄</Text>
        {document.pageCount > 0 && (
          <View style={styles.pageBadge}>
            <Text style={styles.pageBadgeText}>{document.pageCount}</Text>
          </View>
        )}
      </View>

      {/* Document info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {document.name}
        </Text>
        <Text style={styles.meta}>
          {document.createdAt ? formatDate(document.createdAt) : ''}
          {document.size > 0 ? `  •  ${formatFileSize(document.size)}` : ''}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onShare}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel={`Share ${document.name}`}
        >
          <Text style={styles.actionIcon}>↑</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onEdit}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel={`Edit ${document.name}`}
        >
          <Text style={styles.actionIcon}>✎</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onDelete}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel={`Delete ${document.name}`}
        >
          <Text style={[styles.actionIcon, { color: COLORS.error }]}>🗑</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.small,
  },
  iconContainer: {
    width: 52,
    height: 64,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    position: 'relative',
  },
  pdfIcon: {
    fontSize: 32,
  },
  pageBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.round,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  pageBadgeText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xs,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  name: {
    fontSize: FONTS.sizes.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  meta: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 16,
    color: COLORS.primary,
  },
});
