import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { randomFillSync } from 'crypto';

if (typeof crypto === 'undefined') {
  global.crypto = {};
}

if (!crypto.getRandomValues) {
  crypto.getRandomValues = (arr) => {
    randomFillSync(arr);
    return arr;
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
