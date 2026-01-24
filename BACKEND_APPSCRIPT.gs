
/**
 * BACK-END GOOGLE APPS SCRIPT - CORRIGIDO
 * 
 * ATENÇÃO: Não clique em "Executar" no doGet ou doPost dentro do editor.
 * Essas funções só funcionam quando chamadas pelo sistema (Web App).
 */

const SHEETS = {
  AWB: "AWB",
  USERS: "CADASTRO USUÁRIO"
};

function doGet(e) {
  try {
    // Se e for indefinido (teste manual), usa padrão
    const sheetName = (e && e.parameter && e.parameter.sheet) ? e.parameter.sheet : SHEETS.AWB;
    return createJsonResponse(getRows(sheetName));
  } catch (err) {
    return createJsonResponse({ error: err.toString() });
  }
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({ error: "Dados não enviados corretamente. Use o sistema para salvar." });
    }

    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const sheetName = body.sheet || SHEETS.AWB;
    const payload = body.data;

    switch (action) {
      case "GET":
        return createJsonResponse(getRows(sheetName));
      case "SAVE":
        return saveRow(sheetName, payload);
      case "DELETE":
        return deleteRow(sheetName, payload.id || payload.ID);
      default:
        return createJsonResponse({ error: "Ação inválida: " + action });
    }
  } catch (err) {
    return createJsonResponse({ error: err.toString() });
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(name);
  if (!sheet) {
    throw new Error("Aba '" + name + "' não encontrada na planilha. Verifique o nome exato.");
  }
  return sheet;
}

function getRows(sheetName) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map(row => {
    let obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i];
    });
    return obj;
  });
}

function saveRow(sheetName, payload) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Normaliza o ID (maiúsculo ou minúsculo vindo do front)
  const id = payload.ID || payload.id || Utilities.getUuid();
  payload.ID = id;
  payload.id = id;

  let rowIndex = -1;
  if (data.length > 1) {
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == id) {
        rowIndex = i + 1;
        break;
      }
    }
  }

  const rowData = headers.map(header => {
    return payload[header] !== undefined ? payload[header] : "";
  });

  if (rowIndex > -1) {
    sheet.getRange(rowIndex, 1, 1, headers.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  return createJsonResponse({ success: true, data: payload });
}

function deleteRow(sheetName, id) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  
  let deleted = false;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      sheet.deleteRow(i + 1);
      deleted = true;
      break;
    }
  }
  
  return createJsonResponse({ success: deleted });
}

/**
 * Função para testar se o script consegue acessar as abas.
 * Clique em "Executar" nesta função para validar sua planilha.
 */
function testSetup() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    Logger.log("Planilha: " + ss.getName());
    SHEETS.AWB = "AWB"; // Ajuste aqui se o nome for diferente
    const s1 = getSheet(SHEETS.AWB);
    Logger.log("Aba AWB encontrada com " + s1.getLastRow() + " linhas.");
    
    const s2 = getSheet(SHEETS.USERS);
    Logger.log("Aba USUÁRIOS encontrada com " + s2.getLastRow() + " linhas.");
  } catch (e) {
    Logger.log("ERRO NO SETUP: " + e.message);
  }
}
