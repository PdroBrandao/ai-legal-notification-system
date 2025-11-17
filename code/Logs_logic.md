📋 Guia para lidar com ConsultaLog e ExecucaoLog no backend
1. Quando iniciar uma execução (manual ou automática):
Crie um ExecucaoLog (opcional se for execução em lote).

Preencha os dados iniciais como:

dataExecucao: now()

status: "EXECUTANDO"

Zere os contadores (qtdRequisicoes = 0, etc.).

2. Para cada consulta individual feita:
Crie um ConsultaLog imediatamente após a resposta da DGEN (sucesso ou erro).

Salve:

advogadoId

dataConsulta: now()

status: "SUCESSO" | "ERRO" | "RETENTATIVA"

tribunal

parametrosBusca (string JSON dos filtros aplicados)

qtdResultados

tempoRespostaMs

erro e stackTrace, se existirem

Se a consulta faz parte de uma execução em lote, vincule o execucaoLogId.

3. Ao final de todas as consultas (em uma execução em lote):
Atualize o ExecucaoLog:

status: "SUCESSO" | "PARCIAL" | "ERRO"

qtdRequisicoes, qtdSucesso, qtdFalhas

tempoExecucao (duração total em ms)

memoriaUtilizada (se quiser medir)

4. Em caso de erro grave (ex: falha geral de conexão):
Atualize o ExecucaoLog com:

status: "ERRO"

erro e stackTrace descritivos.

🔗 Fluxo resumido de salvamento:
plaintext
Copy
Edit
[Início da execução]
    ↓
[Cria ExecucaoLog (opcional)]
    ↓
[Para cada consulta]
    ↓
[Cria ConsultaLog]
    ↓
[Soma nos contadores da execução]
    ↓
[Finaliza ExecucaoLog com status e métricas]
✍️ Observações importantes:
Falhas individuais (ex: uma consulta falhou) não impedem que a execução continue.

Você sempre salva o resultado da tentativa, mesmo em erro — nunca perde a informação.

Idealmente, use transações se precisar garantir que uma execução inteira seja consistente (Prisma transaction).

Para logar tempo de execução/memória, você pode usar funções como process.hrtime() e process.memoryUsage() no Node.js.