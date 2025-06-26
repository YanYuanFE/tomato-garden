import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          'starknet-libs': ['starknet', '@starknet-react/core', '@starknet-react/chains', 'starknetkit'],
          'ui-libs': ['react', 'react-dom', 'lucide-react'],
          'services': [
            './src/services/TomatoGardenService',
            './src/services/TomatoNFTService', 
            './src/services/TomatoStakingService',
            './src/services/LeaderboardService'
          ]
        }
      }
    }
  }
});
