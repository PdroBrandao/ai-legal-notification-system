# Automação de Consulta de Intimações PJE

Sistema automatizado para consulta e extração de intimações do PJE (Processo Judicial Eletrônico) via DJEN.

## 🎯 Funcionalidades

- Consulta automática no DJEN (https://comunica.pje.jus.br/)
- Monitoramento de intimações por estado
- Busca por lista de advogados
- Extração de dados relevantes das intimações
- Cálculo automático de prazos processuais
- Integração com Google Sheets para armazenamento dos dados

## 🚀 Deploy

### AWS Lambda (Usar serverless para deploy)
   ```
### Configuração do EventBridge (CloudWatch Events)
- A cada hora
- Das 8h às 18h
- De segunda a sexta-feira


## ESCOPO

1º - Entrar no site djen (https://comunica.pje.jus.br/) 
2º - Clicar em MG ou estado interessado para acessar as intimações dos Tribunais. 
3º - Fazer a pesquisa com base em uma lista de nomes de advogados.
3º - Ler a intimação.
4º - Extrair os dados importantes da intimação.
5º - Calcular o prazo.
6º - Salvar em uma tabela sheets.