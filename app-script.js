// ============================================================
// TRELLO CLONE — Google Apps Script Backend
// Скопируй этот код в редактор Google Apps Script
// и задеплой как Web App (Execute as: Me, Who has access: Anyone)
// ============================================================
//
// Структура Google Таблицы (3 листа):
//
// Лист "Boards":  id | title | color | createdAt
// Лист "Lists":   id | boardId | title | position | createdAt
// Лист "Cards":   id | listId | title | description | position | createdAt
// ============================================================

const SHEET_BOARDS = 'Boards';
const SHEET_LISTS  = 'Lists';
const SHEET_CARDS  = 'Cards';

// ── Утилиты ──────────────────────────────────────────────────

function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    // Создаём заголовки
    const headers = {
      [SHEET_BOARDS]: ['id', 'title', 'color', 'createdAt'],
      [SHEET_LISTS]:  ['id', 'boardId', 'title', 'position', 'createdAt'],
      [SHEET_CARDS]:  ['id', 'listId', 'title', 'description', 'position', 'createdAt'],
    };
    sheet.appendRow(headers[name]);
    sheet.getRange(1, 1, 1, headers[name].length)
      .setFontWeight('bold')
      .setBackground('#4285f4')
      .setFontColor('#ffffff');
  }
  return sheet;
}

function sheetToObjects(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  }).filter(obj => obj.id !== ''); // пропускаем пустые строки
}

function generateId() {
  return Utilities.getUuid();
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function corsResponse(data) {
  const output = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}

// ── GET обработчик ───────────────────────────────────────────

function doGet(e) {
  try {
    const action = e.parameter.action;

    if (action === 'getBoards') {
      return handleGetBoards();
    }
    if (action === 'getLists') {
      return handleGetLists(e.parameter.boardId);
    }
    if (action === 'getCards') {
      return handleGetCards(e.parameter.listId);
    }
    if (action === 'getBoardData') {
      return handleGetBoardData(e.parameter.boardId);
    }

    return jsonResponse({ error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonResponse({ error: err.toString() });
  }
}

// ── POST обработчик ──────────────────────────────────────────

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    if (action === 'createBoard')  return handleCreateBoard(body);
    if (action === 'updateBoard')  return handleUpdateBoard(body);
    if (action === 'deleteBoard')  return handleDeleteBoard(body);

    if (action === 'createList')   return handleCreateList(body);
    if (action === 'updateList')   return handleUpdateList(body);
    if (action === 'deleteList')   return handleDeleteList(body);
    if (action === 'reorderLists') return handleReorderLists(body);

    if (action === 'createCard')   return handleCreateCard(body);
    if (action === 'updateCard')   return handleUpdateCard(body);
    if (action === 'deleteCard')   return handleDeleteCard(body);
    if (action === 'moveCard')     return handleMoveCard(body);

    return jsonResponse({ error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonResponse({ error: err.toString() });
  }
}

// ── BOARDS ───────────────────────────────────────────────────

function handleGetBoards() {
  const boards = sheetToObjects(getSheet(SHEET_BOARDS));
  return jsonResponse({ success: true, data: boards });
}

function handleCreateBoard(body) {
  const sheet = getSheet(SHEET_BOARDS);
  const id = generateId();
  const now = new Date().toISOString();
  sheet.appendRow([id, body.title, body.color || '#0052cc', now]);
  return jsonResponse({ success: true, data: { id, title: body.title, color: body.color || '#0052cc', createdAt: now } });
}

function handleUpdateBoard(body) {
  const sheet = getSheet(SHEET_BOARDS);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === body.id) {
      if (body.title !== undefined) sheet.getRange(i + 1, 2).setValue(body.title);
      if (body.color !== undefined) sheet.getRange(i + 1, 3).setValue(body.color);
      return jsonResponse({ success: true });
    }
  }
  return jsonResponse({ error: 'Board not found' });
}

function handleDeleteBoard(body) {
  // Удаляем доску, все её списки и карточки
  deleteFromSheet(SHEET_BOARDS, 'id', body.id);
  const lists = sheetToObjects(getSheet(SHEET_LISTS)).filter(l => l.boardId === body.id);
  lists.forEach(list => {
    deleteFromSheet(SHEET_CARDS, 'listId', list.id);
    deleteFromSheet(SHEET_LISTS, 'id', list.id);
  });
  return jsonResponse({ success: true });
}

// ── LISTS ────────────────────────────────────────────────────

function handleGetLists(boardId) {
  const lists = sheetToObjects(getSheet(SHEET_LISTS))
    .filter(l => l.boardId === boardId)
    .sort((a, b) => Number(a.position) - Number(b.position));
  return jsonResponse({ success: true, data: lists });
}

function handleCreateList(body) {
  const sheet = getSheet(SHEET_LISTS);
  const id = generateId();
  const now = new Date().toISOString();
  const existingLists = sheetToObjects(sheet).filter(l => l.boardId === body.boardId);
  const position = existingLists.length;
  sheet.appendRow([id, body.boardId, body.title, position, now]);
  return jsonResponse({ success: true, data: { id, boardId: body.boardId, title: body.title, position, createdAt: now } });
}

function handleUpdateList(body) {
  const sheet = getSheet(SHEET_LISTS);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === body.id) {
      if (body.title !== undefined)    sheet.getRange(i + 1, 3).setValue(body.title);
      if (body.position !== undefined) sheet.getRange(i + 1, 4).setValue(body.position);
      return jsonResponse({ success: true });
    }
  }
  return jsonResponse({ error: 'List not found' });
}

function handleDeleteList(body) {
  deleteFromSheet(SHEET_CARDS, 'listId', body.id);
  deleteFromSheet(SHEET_LISTS, 'id', body.id);
  return jsonResponse({ success: true });
}

function handleReorderLists(body) {
  // body.lists = [{ id, position }, ...]
  const sheet = getSheet(SHEET_LISTS);
  const data = sheet.getDataRange().getValues();
  body.lists.forEach(item => {
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === item.id) {
        sheet.getRange(i + 1, 4).setValue(item.position);
        break;
      }
    }
  });
  return jsonResponse({ success: true });
}

// ── CARDS ────────────────────────────────────────────────────

function handleGetCards(listId) {
  const cards = sheetToObjects(getSheet(SHEET_CARDS))
    .filter(c => c.listId === listId)
    .sort((a, b) => Number(a.position) - Number(b.position));
  return jsonResponse({ success: true, data: cards });
}

function handleCreateCard(body) {
  const sheet = getSheet(SHEET_CARDS);
  const id = generateId();
  const now = new Date().toISOString();
  const existingCards = sheetToObjects(sheet).filter(c => c.listId === body.listId);
  const position = existingCards.length;
  sheet.appendRow([id, body.listId, body.title, body.description || '', position, now]);
  return jsonResponse({
    success: true,
    data: { id, listId: body.listId, title: body.title, description: body.description || '', position, createdAt: now }
  });
}

function handleUpdateCard(body) {
  const sheet = getSheet(SHEET_CARDS);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === body.id) {
      if (body.title !== undefined)       sheet.getRange(i + 1, 3).setValue(body.title);
      if (body.description !== undefined) sheet.getRange(i + 1, 4).setValue(body.description);
      if (body.position !== undefined)    sheet.getRange(i + 1, 5).setValue(body.position);
      return jsonResponse({ success: true });
    }
  }
  return jsonResponse({ error: 'Card not found' });
}

function handleDeleteCard(body) {
  deleteFromSheet(SHEET_CARDS, 'id', body.id);
  return jsonResponse({ success: true });
}

function handleMoveCard(body) {
  // body: { id, newListId, newPosition, oldListId }
  const sheet = getSheet(SHEET_CARDS);
  const data = sheet.getDataRange().getValues();

  // Обновляем listId и position для перемещённой карточки
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === body.id) {
      sheet.getRange(i + 1, 2).setValue(body.newListId);
      sheet.getRange(i + 1, 5).setValue(body.newPosition);
      break;
    }
  }

  // Пересчитываем позиции в исходном списке (если список изменился)
  if (body.oldListId !== body.newListId) {
    const allCards = sheetToObjects(sheet);
    const oldListCards = allCards
      .filter(c => c.listId === body.oldListId && c.id !== body.id)
      .sort((a, b) => Number(a.position) - Number(b.position));
    oldListCards.forEach((card, idx) => {
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === card.id) {
          sheet.getRange(i + 1, 5).setValue(idx);
          break;
        }
      }
    });
  }

  return jsonResponse({ success: true });
}

// ── getBoardData: все данные доски за 1 запрос ───────────────

function handleGetBoardData(boardId) {
  const listsSheet = getSheet(SHEET_LISTS);
  const cardsSheet = getSheet(SHEET_CARDS);
  const boardsSheet = getSheet(SHEET_BOARDS);

  const board = sheetToObjects(boardsSheet).find(b => b.id === boardId);
  if (!board) return jsonResponse({ error: 'Board not found' });

  const lists = sheetToObjects(listsSheet)
    .filter(l => l.boardId === boardId)
    .sort((a, b) => Number(a.position) - Number(b.position));

  const allCards = sheetToObjects(cardsSheet);
  const listIds = new Set(lists.map(l => l.id));
  const cards = allCards
    .filter(c => listIds.has(c.listId))
    .sort((a, b) => Number(a.position) - Number(b.position));

  return jsonResponse({ success: true, data: { board, lists, cards } });
}

// ── Вспомогательная: удаление строк по полю ─────────────────

function deleteFromSheet(sheetName, field, value) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const colIdx = headers.indexOf(field);
  if (colIdx === -1) return;

  // Идём снизу вверх, чтобы не сбивать индексы при удалении
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][colIdx] === value) {
      sheet.deleteRow(i + 1);
    }
  }
}
