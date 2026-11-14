import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isAdmin = mode === 'admin' || process.env.VITE_PORTAL === 'admin';
  const defaultPort = isAdmin ? 3001 : 3000;

  return {
    plugins: [react()],
    server: {
      port: process.env.PORT ? parseInt(process.env.PORT, 10) : defaultPort,
      open: false,
      host: true
    }
  };
});
