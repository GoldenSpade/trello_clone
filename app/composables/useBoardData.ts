import type { Board, List, Card } from '~/types'

export function useBoardData(boardId: string) {
  const { get, post } = useApi()

  const board = ref<Board | null>(null)
  const lists = ref<List[]>([])
  const cards = ref<Card[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchBoardData() {
    loading.value = true
    error.value = null
    try {
      const data = await get<{ board: Board; lists: List[]; cards: Card[] }>({
        action: 'getBoardData',
        boardId,
      })
      board.value = data.board
      lists.value = data.lists
      cards.value = data.cards
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  function cardsForList(listId: string) {
    return computed(() =>
      cards.value
        .filter(c => c.listId === listId)
        .sort((a, b) => Number(a.position) - Number(b.position))
    )
  }

  // ── Lists ──────────────────────────────────────────────────

  async function createList(title: string) {
    const list = await post<List>({ action: 'createList', boardId, title })
    lists.value.push(list)
    return list
  }

  async function updateList(id: string, data: Partial<List>) {
    await post({ action: 'updateList', id, ...data })
    const idx = lists.value.findIndex(l => l.id === id)
    if (idx !== -1) Object.assign(lists.value[idx], data)
  }

  async function deleteList(id: string) {
    await post({ action: 'deleteList', id })
    lists.value = lists.value.filter(l => l.id !== id)
    cards.value = cards.value.filter(c => c.listId !== id)
  }

  // ── Cards ──────────────────────────────────────────────────

  async function createCard(listId: string, title: string) {
    const card = await post<Card>({ action: 'createCard', listId, title })
    cards.value.push(card)
    return card
  }

  async function updateCard(id: string, data: Partial<Card>) {
    await post({ action: 'updateCard', id, ...data })
    const idx = cards.value.findIndex(c => c.id === id)
    if (idx !== -1) Object.assign(cards.value[idx], data)
  }

  async function deleteCard(id: string) {
    await post({ action: 'deleteCard', id })
    cards.value = cards.value.filter(c => c.id !== id)
  }

  async function moveCard(
    cardId: string,
    oldListId: string,
    newListId: string,
    newPosition: number
  ) {
    // Оптимистичное обновление UI
    const card = cards.value.find(c => c.id === cardId)
    if (!card) return

    card.listId = newListId
    card.position = newPosition

    // Пересчитываем позиции в старом списке
    if (oldListId !== newListId) {
      cards.value
        .filter(c => c.listId === oldListId && c.id !== cardId)
        .sort((a, b) => Number(a.position) - Number(b.position))
        .forEach((c, i) => { c.position = i })
    }

    await post({
      action: 'moveCard',
      id: cardId,
      newListId,
      newPosition,
      oldListId,
    })
  }

  return {
    board, lists, cards, loading, error,
    fetchBoardData, cardsForList,
    createList, updateList, deleteList,
    createCard, updateCard, deleteCard, moveCard,
  }
}
