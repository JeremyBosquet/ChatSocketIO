import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
require('dotenv').config();

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), viteTsconfigPaths()],
    server: {
        port: 80,
        host: '0.0.0.0',
    },
});