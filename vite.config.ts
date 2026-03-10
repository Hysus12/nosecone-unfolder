import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const browserDefines = {
  'process.env.NODE_ENV': JSON.stringify('production'),
  'process.env': '{}',
  process: '{"env":{}}',
  global: 'globalThis'
};

export default defineConfig(({ command }) => {
  if (command === 'build') {
    return {
      base: './',
      define: browserDefines,
      plugins: [react()],
      build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        cssCodeSplit: false,
        lib: {
          entry: 'src/main.tsx',
          name: 'OpenRocketNoseconeOfflineApp',
          formats: ['iife'],
          fileName: () => 'app'
        },
        rollupOptions: {
          output: {
            assetFileNames: 'assets/[name]-[hash][extname]'
          }
        }
      }
    };
  }

  return {
    base: './',
    define: browserDefines,
    plugins: [react()],
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      cssCodeSplit: false,
      modulePreload: false,
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
          manualChunks: undefined
        }
      }
    }
  };
});
