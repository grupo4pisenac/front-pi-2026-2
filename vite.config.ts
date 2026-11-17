import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      port: 5173,
      // Em dev, /api é repassado para o backend FastAPI quando VITE_USE_MOCKS=false.
      // No backend hospedado as rotas de autenticação ficam em /auth/* (sem prefixo /api),
      // enquanto as demais ficam em /api/*; por isso /api/auth/* é reescrito para /auth/*.
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET || 'http://localhost:8000',
          changeOrigin: true, // necessário para o Render (HTTPS + roteamento por Host)
          secure: true,
          rewrite: (path) => path.replace(/^\/api\/auth(?=\/|\?|$)/, '/auth'),
        },
      },
    },
  };
});
