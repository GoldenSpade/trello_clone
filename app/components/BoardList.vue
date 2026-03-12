<script setup lang="ts">
import type { List, Card } from '~/types'

const props = defineProps<{
  list: List
  cards: Card[]
}>()

const emit = defineEmits<{
  addCard: [listId: string, title: string]
  deleteList: [listId: string]
  renameList: [listId: string, title: string]
  openCard: [card: Card]
  dragStart: [e: DragEvent, card: Card, listId: string]
  dragOver: [e: DragEvent, listId: string, index: number]
  drop: [e: DragEvent, listId: string, index: number]
}>()

const addingCard = ref(false)
const newCardTitle = ref('')
const editingTitle = ref(false)
const listTitle = ref(props.list.title)
const menuOpen = ref(false)

async function submitCard() {
  if (!newCardTitle.value.trim()) return
  emit('addCard', props.list.id, newCardTitle.value.trim())
  newCardTitle.value = ''
  addingCard.value = false
}

function saveTitle() {
  if (listTitle.value.trim() && listTitle.value !== props.list.title) {
    emit('renameList', props.list.id, listTitle.value.trim())
  }
  editingTitle.value = false
}
</script>

<template>
  <div
    class="bg-[#101204] rounded-xl w-64 shrink-0 flex flex-col max-h-full"
    @dragover.prevent="emit('dragOver', $event, list.id, cards.length)"
    @drop.prevent="emit('drop', $event, list.id, cards.length)"
  >
    <!-- List header -->
    <div class="px-3 pt-3 pb-1 flex items-center justify-between">
      <input
        v-if="editingTitle"
        v-model="listTitle"
        class="flex-1 bg-[#282e33] text-white text-sm font-semibold rounded px-2 py-0.5 outline-none border border-[#579dff]"
        autofocus
        @blur="saveTitle"
        @keyup.enter="saveTitle"
        @keyup.escape="editingTitle = false; listTitle = list.title"
      />
      <h3
        v-else
        class="flex-1 text-sm font-semibold text-[#b6c2cf] px-1 cursor-pointer hover:bg-[#282e33] rounded py-0.5"
        @click="editingTitle = true"
      >
        {{ list.title }}
      </h3>

      <!-- Menu -->
      <div class="relative">
        <button
          class="w-6 h-6 flex items-center justify-center rounded hover:bg-[#282e33] text-[#8c9bab] hover:text-white"
          @click="menuOpen = !menuOpen"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"/>
          </svg>
        </button>
        <div
          v-if="menuOpen"
          class="absolute right-0 top-8 bg-[#282e33] rounded-lg shadow-xl w-44 z-20 py-1 border border-[#38424d]"
        >
          <button
            class="w-full text-left px-4 py-2 text-sm text-[#b6c2cf] hover:bg-[#38424d] flex items-center gap-2"
            @click="menuOpen = false; addingCard = true"
          >
            Add a card
          </button>
          <button
            class="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#38424d] flex items-center gap-2"
            @click="menuOpen = false; emit('deleteList', list.id)"
          >
            Delete list
          </button>
        </div>
        <!-- Click outside to close menu -->
        <div v-if="menuOpen" class="fixed inset-0 z-10" @click="menuOpen = false" />
      </div>
    </div>

    <!-- Cards -->
    <div class="flex-1 overflow-y-auto px-2 py-1 flex flex-col gap-2 min-h-[8px]">
      <div
        v-for="(card, index) in cards"
        :key="card.id"
        class="bg-[#22272b] hover:bg-[#282e33] rounded-lg px-3 py-2 cursor-pointer shadow-sm border border-transparent hover:border-[#579dff]/30 transition-colors group"
        draggable="true"
        @dragstart="emit('dragStart', $event, card, list.id)"
        @dragover.prevent.stop="emit('dragOver', $event, list.id, index)"
        @drop.prevent.stop="emit('drop', $event, list.id, index)"
        @click="emit('openCard', card)"
      >
        <p class="text-sm text-[#b6c2cf] leading-snug">{{ card.title }}</p>
        <p v-if="card.description" class="text-xs text-[#8c9bab] mt-1 line-clamp-2">{{ card.description }}</p>
      </div>
    </div>

    <!-- Add card -->
    <div class="px-2 pb-2 pt-1">
      <template v-if="addingCard">
        <textarea
          v-model="newCardTitle"
          placeholder="Enter card title..."
          class="w-full bg-[#22272b] text-white text-sm rounded-lg px-3 py-2 outline-none border border-[#579dff] resize-none placeholder-[#8c9bab]"
          rows="3"
          autofocus
          @keydown.enter.prevent="submitCard"
          @keydown.escape="addingCard = false; newCardTitle = ''"
        />
        <div class="flex gap-2 mt-1.5">
          <button
            class="bg-[#579dff] hover:bg-[#4b8de8] text-white text-sm rounded px-3 py-1.5 font-medium"
            @click="submitCard"
          >
            Add
          </button>
          <button
            class="text-[#8c9bab] hover:text-white px-2"
            @click="addingCard = false; newCardTitle = ''"
          >
            ✕
          </button>
        </div>
      </template>
      <button
        v-else
        class="w-full text-left text-sm text-[#8c9bab] hover:text-white hover:bg-[#282e33] rounded-lg px-3 py-2 flex items-center gap-2 transition-colors"
        @click="addingCard = true"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"/>
        </svg>
        Add a card
      </button>
    </div>
  </div>
</template>
