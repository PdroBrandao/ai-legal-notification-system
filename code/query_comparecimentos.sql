-- QUERY PARA IDENTIFICAR ADVOGADOS COM COMPARECIMENTOS POR VIR
SELECT 
  a.id as advogado_id,
  a.nome as nome_advogado,
  a.telefone,
  a.oab,
  i.id as intimacao_id,
  i."idDgen",
  i."tipoComparecimento",
  i."dataComparecimento",
  i."horarioComparecimento",
  i."resumoIA",
  p."numeroProcesso",
  p.tribunal,
  p.vara,
  p."nomeOrgao"
FROM "Advogado" a
JOIN "Intimacao" i ON i."advogadoId" = a.id
JOIN "Processo" p ON p.id = i."processoId"
WHERE 
  i."tipoComparecimento" IS NOT NULL 
  AND i."dataComparecimento" IS NOT NULL
  AND i."dataComparecimento" >= CURRENT_DATE
  AND a.ativo = true
ORDER BY 
  i."dataComparecimento" ASC,
  a.nome ASC; 