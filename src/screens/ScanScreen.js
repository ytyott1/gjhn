import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { enhanceDocumentImage } from '../utils/imageUtils';

export default function ScanScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState('off');
  const [capturing, setCapturing] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [capturedPages, setCapturedPages] = useState([]);
  const cameraRef = useRef(null);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  async function handleCapture() {
    if (!cameraRef.current || capturing) return;

    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        skipProcessing: false,
      });

      const enhanced = await enhanceDocumentImage(photo.uri, {
        maxWidth: 1600,
        quality: 0.85,
      });

      const newPages = [...capturedPages, enhanced];
      setCapturedPages(newPages);
      setPageCount(newPages.length);
    } catch {
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    } finally {
      setCapturing(false);
    }
  }

  function handleDone() {
    if (capturedPages.length === 0) {
      Alert.alert('No pages', 'Please capture at least one page before continuing.');
      return;
    }
    navigation.navigate('Review', { pages: capturedPages });
  }

  function handleCancel() {
    if (capturedPages.length > 0) {
      Alert.alert(
        'Discard scan?',
        'You have captured pages that will be lost. Are you sure you want to cancel?',
        [
          { text: 'Keep scanning', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  }

  function toggleFlash() {
    setFlash((prev) => (prev === 'off' ? 'on' : 'off'));
  }

  if (!permission) {
    return (
      <View style={styles.centered}>
        <Text style={styles.infoText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          DocScanner needs camera access to scan documents. Please grant permission
          to continue.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelLink} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelLinkText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />

      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        flash={flash}
      />

      {/* Scanner overlay guide */}
      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.scanFrame}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>
        <Text style={styles.guideText}>Align document within the frame</Text>
      </View>

      {/* Top bar */}
      <SafeAreaView style={styles.topBar} edges={['top']}>
        <TouchableOpacity style={styles.iconButton} onPress={handleCancel}>
          <Text style={styles.iconButtonText}>✕</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={toggleFlash}>
          <Text style={styles.iconButtonText}>{flash === 'on' ? '⚡' : '🔦'}</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Bottom bar */}
      <SafeAreaView style={styles.bottomBar} edges={['bottom']}>
        {/* Page counter */}
        <View style={styles.pageCountBadge}>
          <Text style={styles.pageCountText}>
            {pageCount} {pageCount === 1 ? 'page' : 'pages'}
          </Text>
        </View>

        {/* Capture button */}
        <TouchableOpacity
          style={[styles.captureButton, capturing && styles.captureButtonDisabled]}
          onPress={handleCapture}
          disabled={capturing}
          activeOpacity={0.8}
          accessibilityLabel="Capture page"
          accessibilityRole="button"
        >
          <View style={styles.captureInner} />
        </TouchableOpacity>

        {/* Done button */}
        <TouchableOpacity
          style={[styles.doneButton, pageCount === 0 && styles.doneButtonDisabled]}
          onPress={handleDone}
          disabled={pageCount === 0}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const CORNER_SIZE = 24;
const CORNER_THICKNESS = 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  infoText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.surface,
  },
  permissionTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: FONTS.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.small,
  },
  permissionButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.lg,
    fontWeight: 'bold',
  },
  cancelLink: {
    marginTop: SPACING.md,
    padding: SPACING.sm,
  },
  cancelLinkText: {
    color: COLORS.primary,
    fontSize: FONTS.sizes.md,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: '80%',
    aspectRatio: 0.707, // A4 ratio
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: COLORS.white,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
  },
  guideText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    marginTop: SPACING.md,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonText: {
    fontSize: 18,
    color: COLORS.white,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  pageCountBadge: {
    minWidth: 64,
    alignItems: 'center',
  },
  pageCountText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'transparent',
    borderWidth: 4,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.white,
  },
  doneButton: {
    minWidth: 64,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  doneButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  doneButtonText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.md,
    fontWeight: 'bold',
  },
});
