import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { randomFillSync } from 'crypto'

// Wrap the polyfill in a plugin for proper timing during build
function polyfillCryptoGetRandomValues() {
  return {
    name: 'polyfill-crypto-getRandomValues',
    configResolved() {
      if (typeof globalThis.crypto === 'undefined') {
        globalThis.crypto = {};
      }
      if (!globalThis.crypto.getRandomValues) {
        globalThis.crypto.getRandomValues = (arr) => {
          randomFillSync(arr);
          return arr;
        };
      }
    }
  }
}

export default defineConfig({
  plugins: [
    react(),
    polyfillCryptoGetRandomValues(),
    tailwindcss(),
    
  ],
})
