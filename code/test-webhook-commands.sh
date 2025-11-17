#!/bin/bash

# Substitua YOUR_API_GATEWAY_URL pela URL real do seu API Gateway
API_URL="https://YOUR_API_GATEWAY_URL.amazonaws.com/dev/webhook/whatsapp"

echo "=== Teste 1: Busca de intimações de hoje ==="
curl -X POST "$API_URL" \
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

echo -e "\n\n=== Teste 2: Busca de intimações de ontem ==="
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "instance_key": "test-instance",
    "jid": "5531994998233@s.whatsapp.net",
    "messageType": "conversation",
    "key": {
      "remoteJid": "5531994998233@s.whatsapp.net",
      "fromMe": false,
      "id": "3EB0C767D82B8B4D26"
    },
    "messageTimestamp": 1734567890,
    "pushName": "João Silva",
    "broadcast": false,
    "message": {
      "conversation": "Minhas intimações de ontem"
    }
  }'

echo -e "\n\n=== Teste 3: Busca de intimações de data específica ==="
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "instance_key": "test-instance",
    "jid": "5531994998233@s.whatsapp.net",
    "messageType": "conversation",
    "key": {
      "remoteJid": "5531994998233@s.whatsapp.net",
      "fromMe": false,
      "id": "3EB0C767D82B8B4D27"
    },
    "messageTimestamp": 1734567890,
    "pushName": "João Silva",
    "broadcast": false,
    "message": {
      "conversation": "Intimações do dia 15/07/2025"
    }
  }'

echo -e "\n\n=== Teste 4: Mensagem não entendida ==="
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "instance_key": "test-instance",
    "jid": "5531994998233@s.whatsapp.net",
    "messageType": "conversation",
    "key": {
      "remoteJid": "5531994998233@s.whatsapp.net",
      "fromMe": false,
      "id": "3EB0C767D82B8B4D28"
    },
    "messageTimestamp": 1734567890,
    "pushName": "João Silva",
    "broadcast": false,
    "message": {
      "conversation": "Olá, como você está?"
    }
  }'

echo -e "\n\n=== Teste 5: Mensagem de mídia (imagem) ==="
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "instance_key": "test-instance",
    "jid": "5531994998233@s.whatsapp.net",
    "messageType": "imageMessage",
    "key": {
      "remoteJid": "5531994998233@s.whatsapp.net",
      "fromMe": false,
      "id": "3EB0C767D82B8B4D29"
    },
    "messageTimestamp": 1734567890,
    "pushName": "João Silva",
    "broadcast": false,
    "message": {
      "imageMessage": {
        "url": "https://example.com/image.jpg",
        "mimetype": "image/jpeg",
        "caption": "Imagem enviada"
      }
    }
  }'

echo -e "\n\n=== Teste 6: Advogado não cadastrado (número diferente) ==="
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "instance_key": "test-instance",
    "jid": "5511999999999@s.whatsapp.net",
    "messageType": "conversation",
    "key": {
      "remoteJid": "5511999999999@s.whatsapp.net",
      "fromMe": false,
      "id": "3EB0C767D82B8B4D30"
    },
    "messageTimestamp": 1734567890,
    "pushName": "Maria Santos",
    "broadcast": false,
    "message": {
      "conversation": "Quais são minhas intimações de hoje?"
    }
  }'

echo -e "\n\n=== Teste 7: Mensagem estendida (texto longo) ==="
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "instance_key": "test-instance",
    "jid": "5531994998233@s.whatsapp.net",
    "messageType": "extendedTextMessage",
    "key": {
      "remoteJid": "5531994998233@s.whatsapp.net",
      "fromMe": false,
      "id": "3EB0C767D82B8B4D31"
    },
    "messageTimestamp": 1734567890,
    "pushName": "João Silva",
    "broadcast": false,
    "message": {
      "extendedTextMessage": {
        "text": "Preciso saber das minhas intimações de hoje, pode me ajudar?"
      }
    }
  }' 