import { Router } from 'express';
import { IntimacaoController } from '../controllers/IntimacaoController';

const router = Router();
const intimacaoController = new IntimacaoController();

// GET /api/intimacoes?advogadoId=uuid&data=2025-01-15
router.get('/', intimacaoController.buscarIntimacoes);

export default router; 