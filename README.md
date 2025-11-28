# URoot-964

A cross-platform desktop and mobile application built with React, Tauri (desktop), and Capacitor (mobile).

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

1. Go to the [Releases page](../../releases)
2. Download the `.exe` file (e.g., `Monte-Cristo-Vault_1.0.0_x64-setup.exe`)
3. Double-click the downloaded file
4. If Windows SmartScreen appears, click "More info" → "Run anyway" (the app is not code-signed)
5. Follow the installation wizard
6. Launch the app from the Start Menu or Desktop shortcut

### macOS

1. Go to the [Releases page](../../releases)
2. Download the `.dmg` file (e.g., `Monte-Cristo-Vault_1.0.0_x64.dmg`)
3. Double-click the `.dmg` file to mount it
4. Drag the app to your Applications folder
5. On first launch, right-click the app → "Open" → "Open" (required for unsigned apps)
6. The app will now launch normally

### Linux

**Option A: Debian/Ubuntu (.deb)**
```bash
# Download the .deb file, then:
sudo dpkg -i monte-cristo-vault_1.0.0_amd64.deb
```

**Option B: AppImage (any distro)**
```bash
# Download the .AppImage file, then:
chmod +x Monte-Cristo-Vault_1.0.0_amd64.AppImage
./Monte-Cristo-Vault_1.0.0_amd64.AppImage
```

### Android

1. Go to the [Releases page](../../releases) on your Android device's browser
2. Download the `.apk` file (e.g., `app-debug.apk`)
3. Open the downloaded file
4. If prompted, enable "Install from unknown sources" in Settings:
   - Go to **Settings** → **Security** → Enable **Unknown sources**
   - Or on newer Android: **Settings** → **Apps** → **Special access** → **Install unknown apps** → Allow your browser
5. Tap "Install" when prompted
6. Once installed, tap "Open" or find the app in your app drawer

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

Releases are automated via GitHub Actions. To create a new release:

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