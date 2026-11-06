import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';
export default defineConfig({base:'./',plugins:[vue({template:{transformAssetUrls}}),quasar()],build:{chunkSizeWarningLimit:1800},server:{port:5174,strictPort:true}});
