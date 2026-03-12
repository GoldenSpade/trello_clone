export interface Board {
  id: string
  title: string
  color: string
  createdAt: string
}

export interface List {
  id: string
  boardId: string
  title: string
  position: number
  createdAt: string
}

export interface Card {
  id: string
  listId: string
  title: string
  description: string
  position: number
  createdAt: string
}
