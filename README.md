# DocScanner

A mobile document scanning app built with React Native (Expo) that lets you create and edit PDFs directly from your phone.

## Features

- 📷 **Document Scanning** — Use your phone's camera to capture document pages with an alignment guide overlay
- 🔦 **Flash Control** — Toggle flash for low-light scanning
- 📄 **PDF Creation** — Convert captured images into a multi-page PDF
- 🖼️ **Page Management** — Reorder, rotate, and delete pages before creating the PDF
- ✏️ **PDF Editing** — Rename documents, add pages from camera or photo library, delete documents
- 👁️ **PDF Viewer** — View PDFs with page navigation
- 📤 **Sharing** — Share PDFs via any app on your device (email, messaging, cloud storage)
- 💾 **Local Storage** — All documents are saved locally on your device

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Expo Go app](https://expo.dev/client) on your iOS or Android device **or** an emulator/simulator

### Installation

```bash
# Clone the repository
git clone https://github.com/ytyott1/gjhn.git
cd gjhn

# Install dependencies
npm install
```

### Running the App

```bash
# Start the development server
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios

# Run on Web
npm run web
```

Scan the QR code with Expo Go on your device, or press `a` for Android emulator / `i` for iOS simulator.

### Running Tests

```bash
npm test
```

## Project Structure

```
├── App.js                  # Root component with navigation setup
├── app.json                # Expo configuration
├── index.js                # Entry point
├── babel.config.js         # Babel configuration
├── src/
│   ├── screens/
│   │   ├── HomeScreen.js       # Document list with FAB to start new scan
│   │   ├── ScanScreen.js       # Camera-based document scanner
│   │   ├── ReviewScreen.js     # Review & reorder pages, set PDF title
│   │   ├── PDFViewerScreen.js  # View the created PDF
│   │   └── PDFEditorScreen.js  # Edit document metadata and manage pages
│   ├── components/
│   │   ├── DocumentCard.js     # Document list item card
│   │   └── EmptyState.js       # Empty list placeholder
│   ├── utils/
│   │   ├── pdfUtils.js         # PDF creation, deletion, formatting helpers
│   │   ├── imageUtils.js       # Image enhancement (resize, rotate, crop)
│   │   └── storageUtils.js     # AsyncStorage CRUD for document metadata
│   └── constants/
│       └── theme.js            # Colors, fonts, spacing, shadows
└── __tests__/
    ├── pdfUtils.test.js        # Unit tests for PDF utilities
    └── storageUtils.test.js    # Unit tests for storage utilities
```

## Usage

1. **Scan a document** — Tap the **+** button on the home screen. Point your camera at a document and tap the shutter button. Capture as many pages as needed, then tap **Done**.
2. **Review pages** — Rotate or reorder pages, set a title, then tap **Create PDF**.
3. **View the PDF** — The newly created PDF opens automatically in the viewer.
4. **Share** — Tap the **Share** button to send the PDF via email, messaging, or cloud storage.
5. **Edit / Delete** — From the home screen, tap the edit (✎) or delete (🗑) icons on any document card.

## Permissions

The app requests the following permissions:

| Permission | Purpose |
|---|---|
| Camera | Capture document pages |
| Photo Library | Save scanned images (optional) |

## Technology Stack

| Library | Version | Purpose |
|---|---|---|
| React Native | 0.81 | Cross-platform mobile framework |
| Expo | ~54 | Developer toolchain & native modules |
| expo-camera | ~17 | Camera access for scanning |
| expo-print | ~15 | HTML-to-PDF conversion |
| expo-file-system | ~19 | Local file storage |
| expo-image-manipulator | ~14 | Image resizing and rotation |
| expo-sharing | ~14 | Native share sheet |
| expo-document-picker | ~14 | Import images from device |
| react-native-pdf | ^7 | PDF rendering/viewing |
| @react-navigation/stack | ^7 | Screen navigation |
| @react-native-async-storage | 2.2 | Document metadata persistence |
