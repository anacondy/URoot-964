# URoot-964

A cross-platform desktop and mobile application built with React, Tauri (desktop), and Capacitor (mobile).

## System Requirements

Before downloading and installing the application, ensure your device meets these minimum requirements:

### Windows PC
- **OS**: Windows 10 (version 1803 or later) or Windows 11
- **Architecture**: 64-bit (x64)
- **RAM**: 4 GB minimum
- **Storage**: 100 MB free space
- **Display**: 1280x720 resolution or higher
- **Internet**: Required for initial download only

### macOS
- **OS**: macOS 10.13 (High Sierra) or later
- **Architecture**: Intel x64 or Apple Silicon (M1/M2/M3)
- **RAM**: 4 GB minimum
- **Storage**: 100 MB free space
- **Display**: 1280x720 resolution or higher

### Linux
- **OS**: Ubuntu 18.04+, Debian 10+, Fedora 32+, or compatible distro
- **Architecture**: 64-bit (x64)
- **RAM**: 4 GB minimum
- **Storage**: 100 MB free space
- **Dependencies**: WebKitGTK (usually pre-installed)

### Android
- **OS**: Android 7.0 (Nougat, API 24) or later
- **RAM**: 2 GB minimum
- **Storage**: 50 MB free space
- **Screen**: Any screen size supported

---

## Download & Installation

### Where to Download

All releases are available on the [GitHub Releases page](../../releases). When a new version is released (tagged with `v*`, e.g., `v1.0.0`), the following installers are automatically built and uploaded:

| Platform | File Type | Description |
|----------|-----------|-------------|
| Windows | `.exe` | NSIS installer (recommended) |
| Windows | `.msi` | MSI installer |
| macOS | `.dmg` | Disk image installer |
| Linux | `.deb` | Debian/Ubuntu package |
| Linux | `.AppImage` | Portable AppImage |
| Android | `.apk` | Android application package |

---

## Installation Instructions

### Windows PC

**Step-by-step download and installation:**

1. **Open your browser** (Chrome, Edge, Firefox, etc.)
2. **Go to the Releases page**: Navigate to this repository's [Releases page](../../releases)
3. **Find the latest release**: Look for the most recent version (e.g., v1.0.0)
4. **Download the installer**: Click on the `.exe` file (e.g., `Monte-Cristo-Vault_1.0.0_x64-setup.exe`)
5. **Wait for download**: The file will download to your Downloads folder
6. **Run the installer**: Double-click the downloaded `.exe` file
7. **Handle security warning**: If Windows SmartScreen appears:
   - Click "More info"
   - Click "Run anyway" (the app is safe but not code-signed)
8. **Complete installation**: Follow the installation wizard prompts
9. **Launch the app**: Find it in your Start Menu or on your Desktop

### macOS

**Step-by-step download and installation:**

1. **Open Safari or your preferred browser**
2. **Go to the Releases page**: Navigate to this repository's [Releases page](../../releases)
3. **Download the DMG**: Click on the `.dmg` file (e.g., `Monte-Cristo-Vault_1.0.0_x64.dmg`)
4. **Open the DMG**: Double-click the downloaded file to mount it
5. **Install the app**: Drag the app icon to the Applications folder
6. **First launch** (important for unsigned apps):
   - Open Finder → Applications
   - Right-click the app → Select "Open"
   - Click "Open" in the dialog that appears
7. **Future launches**: The app will open normally from now on

### Linux

**Option A: Debian/Ubuntu (.deb)**

1. Download the `.deb` file from the [Releases page](../../releases)
2. Open Terminal and run:
```bash
sudo dpkg -i ~/Downloads/monte-cristo-vault_1.0.0_amd64.deb
```
3. Launch from your application menu or run `monte-cristo-vault`

**Option B: AppImage (works on any Linux distro)**

1. Download the `.AppImage` file from the [Releases page](../../releases)
2. Open Terminal and run:
```bash
chmod +x ~/Downloads/Monte-Cristo-Vault_1.0.0_amd64.AppImage
~/Downloads/Monte-Cristo-Vault_1.0.0_amd64.AppImage
```

### Android (Mobile)

**Step-by-step download and installation from your phone:**

1. **Open your phone's browser** (Chrome, Samsung Internet, Firefox, etc.)
2. **Navigate to the Releases page**: Go to `https://github.com/anacondy/URoot-964/releases`
3. **Find the APK file**: Scroll down to "Assets" and tap on the `.apk` file (e.g., `app-debug.apk`)
4. **Download the APK**: Tap "Download" if prompted, or it will download automatically
5. **Open the APK**: 
   - Go to your Downloads folder or tap the download notification
   - Tap the `.apk` file
6. **Enable installation from unknown sources** (if prompted):
   - **Android 8.0+**: Tap "Settings" when prompted → Enable "Allow from this source" → Go back
   - **Older Android**: Go to **Settings** → **Security** → Enable **Unknown sources**
7. **Install the app**: Tap "Install" on the installation screen
8. **Open the app**: Tap "Open" or find "Monte Cristo Vault" in your app drawer

> **Troubleshooting Android Installation:**
> - If installation is blocked, ensure you enabled "Install unknown apps" for your browser
> - If the download fails, try using Chrome browser
> - The APK is a debug build; it's safe to install

> **Note**: The Android build is a debug APK. For production use, you may want to configure signing in `android/app/build.gradle`.

---

## Development Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Rust (for Tauri desktop builds)
- Android Studio (for Android builds)

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
# Web development
npm run dev

# Desktop development (Tauri)
npm run tauri:dev

# Android development
npm run build
npx cap sync android
npx cap open android
```

### Build for Production

```bash
# Web build
npm run build

# Desktop build (Tauri)
npm run tauri:build

# Android build
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
```

---

## Release Process

Releases are automated via GitHub Actions. There are two ways to create a new release:

### Option 1: Using Git Tags (Recommended)

1. Update the version in `package.json` and `src-tauri/tauri.conf.json`
2. Commit your changes
3. Create and push a version tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
4. GitHub Actions will automatically:
   - Build the app for Windows, macOS, Linux, and Android
   - Create a GitHub Release with all installers attached

### Option 2: Manual Release via GitHub Actions

1. Go to the [Actions tab](../../actions) in this repository
2. Click on "Release" workflow in the left sidebar
3. Click "Run workflow" button on the right
4. Enter the version number (e.g., `v1.0.0`)
5. Click "Run workflow" to start the build
6. Once complete, the release will be available on the [Releases page](../../releases)

---

## Project Structure

```
├── src/                    # React application source
│   ├── App.jsx            # Main React component
│   └── main.jsx           # React entry point
├── src-tauri/             # Tauri (desktop) configuration
│   ├── tauri.conf.json    # Tauri config
│   └── Cargo.toml         # Rust dependencies
├── android/               # Capacitor Android project
├── .github/workflows/     # CI/CD workflows
│   └── release.yml        # Release automation
├── capacitor.config.json  # Capacitor config
├── vite.config.js         # Vite build config
└── package.json           # Node.js dependencies
```

---

## Testing Status

> **Note**: The build configuration has been set up but has not been end-to-end tested in a live CI environment. The workflow will execute when you push a `v*` tag. Please test by creating a release tag (e.g., `git tag v0.0.1-test && git push origin v0.0.1-test`) and verify the builds complete successfully.

## License

See [LICENSE](LICENSE) file for details.