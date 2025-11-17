#!/bin/bash

# Comando curl simples para testar o webhook
# Substitua YOUR_API_GATEWAY_URL pela URL real do seu API Gateway

curl -X POST "https://YOUR_API_GATEWAY_URL.amazonaws.com/dev/webhook/whatsapp" \
  -H "Content-Type: application/json" \
  -d '{
    "instance_key": "test-instance",
    "jid": "5531994998233@s.whatsapp.net",
    "messageType": "conversation",
    "key": {
      "remoteJid": "5531994998233@s.whatsapp.net",
      "fromMe": false,
      "id": "3EB0C767D82B8B4D25"
    },
    "messageTimestamp": 1734567890,
    "pushName": "João Silva",
    "broadcast": false,
    "message": {
      "conversation": "Quais são minhas intimações de hoje?"
    }
  }' 