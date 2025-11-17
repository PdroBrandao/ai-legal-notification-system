#!/bin/bash

# Teste para "Qual meu próximo julgamento?"
echo "Testando: Qual meu próximo julgamento?"

curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "instance_key": "test",
    "jid": "553194998233@s.whatsapp.net",
    "messageType": "text",
    "key": {
      "remoteJid": "553194998233@s.whatsapp.net",
      "fromMe": false,
      "id": "test-proximo-julgamento-$(date +%s)"
    },
    "messageTimestamp": 1234567890,
    "pushName": "Alfredo Ramos Neto",
    "broadcast": false,
    "message": {
      "conversation": "Qual meu próximo julgamento?"
    }
  }'

echo -e "\n\nTeste concluído!" 