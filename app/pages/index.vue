<script setup lang="ts">
const { boards, loading, error, fetchBoards, createBoard, deleteBoard } = useBoards()

const BOARD_COLORS = [
  '#0052cc', '#00875a', '#ff5630', '#ff8b00',
  '#6554c0', '#00b8d9', '#36b37e', '#403294',
]

const showCreate = ref(false)
const newTitle = ref('')
const newColor = ref<string>(BOARD_COLORS[0]!)
const creating = ref(false)

onMounted(fetchBoards)

async function submitCreate() {
  if (!newTitle.value.trim()) return
  creating.value = true
  await createBoard(newTitle.value.trim(), newColor.value)
  newTitle.value = ''
  newColor.value = BOARD_COLORS[0]!
  showCreate.value = false
  creating.value = false
}

async function handleDelete(id: string, e: Event) {
  e.preventDefault()
  e.stopPropagation()
  if (!confirm('Delete this board?')) return
  await deleteBoard(id)
}
</script>

<template>
  <div class="min-h-screen bg-[#1d2125] text-white">
    <!-- Header -->
    <header class="bg-[#1d2125] border-b border-[#2c333a] px-6 py-3 flex items-center gap-4">
      <div class="flex items-center gap-2">
        <svg class="w-7 h-7 text-[#579dff]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm2 4v12h4V6H6zm8 0v7h4V6h-4z"/>
        </svg>
        <span class="text-xl font-bold text-[#579dff]">Trello</span>
      </div>
    </header>

    <main class="px-8 py-6 max-w-7xl mx-auto">
      <h1 class="text-2xl font-semibold mb-6 text-[#b6c2cf]">My Boards</h1>

      <!-- Error -->
      <div v-if="error" class="mb-4 p-3 bg-red-900/40 border border-red-700 rounded text-red-300 text-sm">
        {{ error }}
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center gap-3 text-[#8c9bab]">
        <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        Loading boards...
      </div>

      <!-- Boards grid -->
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <!-- Board card -->
        <NuxtLink
          v-for="board in boards"
          :key="board.id"
          :to="`/board/${board.id}`"
          class="relative rounded-lg h-24 p-3 flex flex-col justify-between cursor-pointer hover:brightness-90 transition-all group"
          :style="{ backgroundColor: board.color }"
        >
          <span class="font-semibold text-white text-sm leading-tight">{{ board.title }}</span>
          <button
            class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 flex items-center justify-center rounded hover:bg-black/30"
            @click="handleDelete(board.id, $event)"
            title="Delete board"
          >
            <svg class="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </NuxtLink>

        <!-- Create new board -->
        <button
          v-if="!showCreate"
          class="rounded-lg h-24 p-3 flex items-center justify-center bg-[#2c333a] hover:bg-[#38424d] transition-colors text-[#8c9bab] hover:text-white text-sm font-medium gap-2"
          @click="showCreate = true"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"/>
          </svg>
          Create board
        </button>

        <!-- Create form -->
        <div v-else class="rounded-lg h-auto p-3 bg-[#2c333a] flex flex-col gap-2">
          <input
            v-model="newTitle"
            type="text"
            placeholder="Board title"
            class="w-full bg-[#1d2125] text-white text-sm rounded px-2 py-1.5 outline-none border border-[#579dff] placeholder-[#8c9bab]"
            autofocus
            @keyup.enter="submitCreate"
            @keyup.escape="showCreate = false"
          />
          <!-- Color picker -->
          <div class="flex gap-1 flex-wrap">
            <button
              v-for="color in BOARD_COLORS"
              :key="color"
              class="w-5 h-5 rounded-sm transition-transform hover:scale-110"
              :style="{ backgroundColor: color }"
              :class="newColor === color ? 'ring-2 ring-white ring-offset-1 ring-offset-[#2c333a]' : ''"
              @click="newColor = color"
            />
          </div>
          <div class="flex gap-2">
            <button
              class="flex-1 bg-[#579dff] hover:bg-[#4b8de8] text-white text-sm rounded py-1 font-medium disabled:opacity-50"
              :disabled="creating || !newTitle.trim()"
              @click="submitCreate"
            >
              {{ creating ? 'Creating...' : 'Create' }}
            </button>
            <button
              class="px-2 text-[#8c9bab] hover:text-white"
              @click="showCreate = false"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
