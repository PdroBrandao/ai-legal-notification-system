import { google} from 'googleapis' 

const main = async (event, context) => {
const credentials = JSON.parse(Buffer.from(process.env.GOOGLE_CREDENTIALS, 'base64'))


const auth  = new google.auth.GoogleAuth({
    credentials,
    scopes: 'https://www.googleapis.com/auth/spreadsheets'
})

const client = await auth.getClient()

const googleSheets = google.sheets({ version: 'v4', auth: client})

const spreadsheetId = '1CnLhImZkeugQRIVDv89fU1lE7l1HltRAx5U95ZglHew'

const metadata = await googleSheets.spreadsheets.get({
    auth,
    spreadsheetId
})

const APIUrl = "https://comunicaapi.pje.jus.br/api/v1/comunicacao";
const APIModelURL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCioObNIuHp6iZbwM44OE1SCofnYdfYJzY";
const finalData = {};

// Params: nomeAdvogado, dataDisponibilizacaoInicio, dataDisponibilizacaoFim

const namesToSearch = [
  "Pedro Abder Nunes Raim Ramos",
  "Alfredo Ramos Neto",
  "Jussara Emanoely Guimaraes Rodrigues",
];

for (const name of namesToSearch) {
  finalData[name] = [];
}

console.log(finalData);

/*

Iteraremos por todas as intimações do dia, por pessoa, e salvaremos as seguintes informações:

id
data_disponibilizacao
siglaTribunal
tipoComunicacao
texto

*/
const fetchSumons = async (name) => {
  const now = new Date().toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo', // Brazil's timezone
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
  const url = `${APIUrl}?nomeAdvogado=${name}&dataDisponibilizacaoInicio=${now}&dataDisponibilizacaoFim=${now}`
  console.log('[LOG] URL: ', url)
  const request = await fetch(url).then((response) => response.json());
  return request

};

function addBusinessDays(startDate, daysToAdd) {
    let currentDate = new Date(startDate);
    let addedDays = 0;

    while (addedDays < daysToAdd) {
        currentDate.setDate(currentDate.getDate() + 1); // Avança um dia
        let dayOfWeek = currentDate.getDay(); // Obtém o dia da semana (0 = domingo, 6 = sábado)

        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Se não for sábado (6) nem domingo (0)
            addedDays++;
        }
    }
    return currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

const handleJsonResponse = (JSONStringRaw) => {
  // Exemplo de JSON Raw
  // const JSONStringRaw = "```json\n{\n  \"tipo_ato\": \"INTIMAÇÃO DE AUDIÊNCIA\",\n  \"prazo_manifestacao\": \"cinco dias úteis\"\n}\n```"

  if (!JSONStringRaw) return;

  const pipes = [
    (text) => text.replaceAll("```json", "").replaceAll("```", ""),
  ];

  let JSONString;

  for (const pipe of pipes) {
    JSONString = pipe(JSONStringRaw);
  }

  try {
    const validJson = JSON.parse(JSONString);

    return { status: "valid", response: validJson };
  } catch (e) {
    return { status: "invalid", response: e.message };
  }
};

const handleText = async (text) => {
  const prompt = `Instruções:\n
A partir do texto abaixo, extraia e retorne apenas as seguintes informações, se disponíveis:\n
Tipo de Ato Processual (ex: decisão, despacho, sentença)\n
Prazo para Manifestação (caso mencionado explicitamente)\n
Caso algum dos dados não seja encontrado, retorne NULL no campo em questão\n
Retorne APENAS o conteúdo DO JSON, NADA MAIS\n
Não responda com nada que não seja um JSON\n
Texto da intimação:\n
${text}\n
Saída esperada:\n
{\
  \"tipo_ato\": \"Despacho/Sentença/Outro\",\
  \"prazo_manifestacao\": \x05\,\
}

O prazo_manifestacao deve SEMPRE ser retornado em DIAS.
O prazo_manifestacao deve ser preenchido com a quantidade de dias que compõem o prazo da manifestação.
O prazo_manifestacao deve SEMPRE ser retornado como número, nunca como texto.
`;



  const request = await fetch(`${APIModelURL}`, {
    method: "POST",
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: JSON.stringify(prompt),
            },
          ],
        },
      ],
    }),
  }).then((response) => response.json());

  if (request.error) {
    console.error(
      "[ERROR] Modelo retornou erro ao tentar extrair informações",
      request.error
    );
    return {status: 'invalid', response: request.error};
  }

  const response = request.candidates[0].content.parts[0].text;
  return handleJsonResponse(response);
};




const execute = async (name) => {
  console.log(`[LOG] Buscando intimações para: ${name}...`);

  const summons = await fetchSumons(name);

  console.log(summons)
  
  if (!summons || !summons.status) {
    console.error(`[ERROR] API não retornou resposta válida para ${name}.`);
    return;
  }

  if (summons.status !== "success") {
    console.warn(`[WARN] Nenhum dado retornado para ${name}.`);
    return;  // Evita reexecução infinita
  }

  console.table({ status: summons.status, registros: summons.count });

  const items = summons.items;
  for (const item of items) {
    const response = await handleText(item.texto);
    
    if (response.status === "valid") {
      console.log("[LOG] Modelo respondeu com JSON Válido");
      finalData[name].push({
        id: item.id,
        data_disponibilizacao: item.data_disponibilizacao,
        sigla_tribunal: item.siglaTribunal,
        tipo_comunicacao: item.tipoComunicacao,
        texto: item.texto,
        tipo_ato: response.response.tipo_ato,
        prazo_manifestacao: response.response.prazo_manifestacao,
      });
    } else {
      console.warn("[WARN]: Modelo respondeu com JSON inválido:", response.response);
    }
  }
};


const executeAll = async () => {
  console.log("[LOG] Iniciando busca para todos os nomes...");
  for (const name of namesToSearch) {
    await execute(name)
  }
  console.log("[LOG] Extração de dados finalizada");
  console.table(finalData, ["length"]);

for (const name of namesToSearch) {
    const summonReport = finalData[name]
    for (const summon of summonReport) {
        const today = new Date()
        if(summon.sigla_tribunal === 'TJMG') {
            if(summon.prazo_manifestacao) {
                summon['data_esperada_manifestacao'] = addBusinessDays(today, summon.prazo_manifestacao)
            }
            else {
                summon['data_esperada_manifestacao'] = addBusinessDays(today, 15)
            }
        }
        if(summon.sigla_tribunal === 'TRT3') {
            if(summon.prazo_manifestacao) {
                summon['data_esperada_manifestacao'] = addBusinessDays(today, summon.prazo_manifestacao)
            }
            else {
                summon['data_esperada_manifestacao'] = addBusinessDays(today, 5)
            }
        }
    }
}
};



const saveToSheets = async () => {
    for (const name of namesToSearch) {
        const summonReport = finalData[name]
        for (const summon of summonReport) {
            await googleSheets.spreadsheets.values.append({
                auth,
                spreadsheetId,
                range: 'Dados!A:F',
                valueInputOption: 'USER_ENTERED',
                resource: {
                    values: [
                        [
                            summon.id, 
                            new Date(summon.data_disponibilizacao).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }), 
                            summon.sigla_tribunal, 
                            summon.tipo_comunicacao, 
                            summon.data_esperada_manifestacao, 
                            summon.texto 
                        ]
                    ]
                }
            })
        }
    }
}


await executeAll()
await saveToSheets()
}


export {
  main
}

await main()