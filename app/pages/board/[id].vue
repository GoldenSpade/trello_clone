<script setup lang="ts">
import type { Card } from '~/types'

const route = useRoute()
const boardId = route.params.id as string

const {
  board, lists, cards, loading, error,
  fetchBoardData,
  createList, updateList, deleteList,
  createCard, updateCard, deleteCard, moveCard,
  cardsForList,
} = useBoardData(boardId)

onMounted(fetchBoardData)

// ── Add list ──────────────────────────────────────────────────
const addingList = ref(false)
const newListTitle = ref('')

async function submitList() {
  if (!newListTitle.value.trim()) return
  await createList(newListTitle.value.trim())
  newListTitle.value = ''
  addingList.value = false
}

// ── Card modal ────────────────────────────────────────────────
const selectedCard = ref<Card | null>(null)

function openCard(card: Card) {
  selectedCard.value = card
}

function closeCard() {
  selectedCard.value = null
}

async function handleUpdateCard(data: Partial<Card>) {
  if (!selectedCard.value) return
  await updateCard(selectedCard.value.id, data)
  Object.assign(selectedCard.value, data)
}

async function handleDeleteCard() {
  if (!selectedCard.value) return
  await deleteCard(selectedCard.value.id)
  selectedCard.value = null
}

// ── Drag & Drop ───────────────────────────────────────────────
const dragCard = ref<Card | null>(null)
const dragFromListId = ref<string>('')

function onDragStart(e: DragEvent, card: Card, listId: string) {
  dragCard.value = card
  dragFromListId.value = listId
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', card.id)
  }
}

function onDragOver(e: DragEvent, _listId: string, _index: number) {
  if (e.dataTransfer) e.dataTransfer.dropEffect = 'move'
}

async function onDrop(e: DragEvent, toListId: string, toIndex: number) {
  if (!dragCard.value) return
  const card = dragCard.value
  const fromListId = dragFromListId.value

  dragCard.value = null
  dragFromListId.value = ''

  await moveCard(card.id, fromListId, toListId, toIndex)
}
</script>

<template>
  <div
    class="min-h-screen flex flex-col"
    :style="board ? { backgroundColor: board.color } : { backgroundColor: '#1d2125' }"
  >
    <!-- Header -->
    <header class="bg-black/20 backdrop-blur-sm px-4 py-2 flex items-center gap-4">
      <NuxtLink
        to="/"
        class="text-white/80 hover:text-white flex items-center gap-1.5 text-sm font-medium transition-colors"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/>
        </svg>
        Boards
      </NuxtLink>

      <div class="w-px h-5 bg-white/30" />

      <h1 v-if="board" class="text-white font-bold text-lg">{{ board.title }}</h1>
      <div v-else class="h-6 w-40 bg-white/20 rounded animate-pulse" />
    </header>

    <!-- Board content -->
    <div class="flex-1 overflow-x-auto px-4 py-4">
      <!-- Error -->
      <div v-if="error" class="mb-4 p-3 bg-red-900/60 rounded text-white text-sm">
        {{ error }}
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center gap-3 text-white/70">
        <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        Loading...
      </div>

      <!-- Lists -->
      <div v-else class="flex gap-3 items-start h-full">
        <BoardList
          v-for="list in lists"
          :key="list.id"
          :list="list"
          :cards="cardsForList(list.id).value"
          @add-card="(listId, title) => createCard(listId, title)"
          @delete-list="(listId) => deleteList(listId)"
          @rename-list="(listId, title) => updateList(listId, { title })"
          @open-card="openCard"
          @drag-start="onDragStart"
          @drag-over="onDragOver"
          @drop="onDrop"
        />

        <!-- Add list -->
        <div class="shrink-0 w-64">
          <template v-if="addingList">
            <div class="bg-[#101204] rounded-xl p-3 flex flex-col gap-2">
              <input
                v-model="newListTitle"
                type="text"
                placeholder="Enter list title..."
                class="w-full bg-[#22272b] text-white text-sm rounded px-3 py-2 outline-none border border-[#579dff] placeholder-[#8c9bab]"
                autofocus
                @keyup.enter="submitList"
                @keyup.escape="addingList = false"
              />
              <div class="flex gap-2">
                <button
                  class="bg-[#579dff] hover:bg-[#4b8de8] text-white text-sm rounded px-3 py-1.5 font-medium"
                  @click="submitList"
                >
                  Add list
                </button>
                <button class="text-[#8c9bab] hover:text-white px-2" @click="addingList = false">
                  ✕
                </button>
              </div>
            </div>
          </template>
          <button
            v-else
            class="w-full text-left text-sm text-white/80 hover:text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-2 transition-colors font-medium"
            @click="addingList = true"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"/>
            </svg>
            Add a list
          </button>
        </div>
      </div>
    </div>

    <!-- Card modal -->
    <CardModal
      v-if="selectedCard"
      :card="selectedCard"
      :list="lists.find(l => l.id === selectedCard!.listId)!"
      @close="closeCard"
      @update="handleUpdateCard"
      @delete="handleDeleteCard"
    />
  </div>
</template>
