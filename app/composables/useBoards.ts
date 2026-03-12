import type { Board } from '~/types'

export function useBoards() {
  const { get, post } = useApi()
  const boards = useState<Board[]>('boards', () => [])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchBoards() {
    loading.value = true
    error.value = null
    try {
      boards.value = await get<Board[]>({ action: 'getBoards' })
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  async function createBoard(title: string, color: string) {
    const board = await post<Board>({ action: 'createBoard', title, color })
    boards.value.push(board)
    return board
  }

  async function updateBoard(id: string, data: Partial<Board>) {
    await post({ action: 'updateBoard', id, ...data })
    const idx = boards.value.findIndex(b => b.id === id)
    if (idx !== -1) Object.assign(boards.value[idx], data)
  }

  async function deleteBoard(id: string) {
    await post({ action: 'deleteBoard', id })
    boards.value = boards.value.filter(b => b.id !== id)
  }

  return { boards, loading, error, fetchBoards, createBoard, updateBoard, deleteBoard }
}
