import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  build: {
    target: 'es2022',
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Split large/stable libraries out so the main app chunk stays small
        // and vendor code can be cached independently across deploys.
        // Split a few large, stable libraries into their own long-cached
        // chunks. Everything else stays in the main app chunk, which avoids
        // the circular-chunk traps of a catch-all "vendor" grouping.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('recharts') || id.includes('/d3-')) return 'vendor-recharts';
          if (id.includes('@radix-ui')) return 'vendor-radix';
          if (id.includes('embla-carousel')) return 'vendor-embla';
          if (id.includes('lucide-react')) return 'vendor-icons';
          if (id.includes('/motion/')) return 'vendor-motion';
          return undefined;
        },
      },
    },
  },
})
