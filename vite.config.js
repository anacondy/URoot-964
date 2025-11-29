import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    base: '/URoot-964',
  plugins: [react()],
  
  // Clear the screen on build
  clearScreen: false,
  
  // Tauri expects a fixed port
  server: {
    port: 1420,
    strictPort: true,
  },
  
  // Build configuration
  build: {
    // Tauri supports es2021 - use appropriate target per platform
    // Windows uses Chromium (WebView2), Linux uses WebKitGTK, macOS uses WebKit
    target: (() => {
      const platform = process.env.TAURI_PLATFORM;
      if (platform === 'windows') return 'chrome105';
      if (platform === 'linux') return 'firefox115';
      return 'safari13'; // macOS and default
    })(),
    
    // Don't produce source maps for production
    sourcemap: false,
    
    // Use terser for aggressive minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    
    // Reduce chunk size for smaller bundles
    chunkSizeWarningLimit: 500,
    
    rollupOptions: {
      output: {
        // Manual chunking for optimal loading
        manualChunks: {
          vendor: ['react', 'react-dom'],
          icons: ['lucide-react'],
        },
      },
    },
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'],
  },
});
