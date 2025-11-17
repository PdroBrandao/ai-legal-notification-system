import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';
import intimacoesRoutes from './api/routes/intimacoes';
import webhookRoutes from './api/routes/webhook';

const app = express();

app.use(cors());
app.use(express.json({ type: '*/*' }));
app.use('/api/intimacoes', intimacoesRoutes);
app.use('/api/webhook', webhookRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[API ERROR]:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Erro interno do servidor' 
  });
});

export const handler = serverless(app); 