import app from './api';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 API rodando em http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Endpoint: http://localhost:${PORT}/api/intimacoes?advogadoId=123&data=2025-01-15`);
}); 