<script setup lang="ts">
import type { Card, List, Priority } from '~/types'

const props = defineProps<{
  card: Card
  list: List
}>()

const emit = defineEmits<{
  close: []
  update: [data: Partial<Card>]
  delete: []
}>()

const ACCENT_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16',
  '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6',
  '#ec4899', '#14b8a6', '#a3e635', '#fbbf24',
  '#60a5fa', '#a78bfa', '#f472b6', '#94a3b8',
  '#d946ef', '#0ea5e9',
]

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'none',   label: 'None',   color: '#4b5563' },
  { value: 'low',    label: 'Low',    color: '#3b82f6' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high',   label: 'High',   color: '#f97316' },
  { value: 'urgent', label: 'Urgent', color: '#ef4444' },
]

const title = ref(props.card.title)
const description = ref(props.card.description)
const editingTitle = ref(false)
const editingDescription = ref(false)
const saving = ref(false)

async function saveTitle() {
  if (!title.value.trim()) {
    title.value = props.card.title
    editingTitle.value = false
    return
  }
  saving.value = true
  emit('update', { title: title.value.trim() })
  saving.value = false
  editingTitle.value = false
}

async function saveDescription() {
  saving.value = true
  emit('update', { description: description.value })
  saving.value = false
  editingDescription.value = false
  emit('close')
}

function cancelDescription() {
  description.value = props.card.description
  editingDescription.value = false
}

async function setPriority(priority: Priority) {
  emit('update', { priority })
}

function onOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) emit('close')
}

const currentPriority = computed(() =>
  PRIORITIES.find(p => p.value === (props.card.priority ?? 'none')) ?? PRIORITIES[0]!
)

function formatDateTime(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}
</script>

<template>
  <!-- Overlay -->
  <div
    class="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-16 px-4"
    @click="onOverlayClick"
  >
    <div class="bg-[#282e33] rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden">
      <!-- Header -->
      <div class="p-5 pb-0">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 mt-1 text-[#8c9bab] shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/>
          </svg>
          <div class="flex-1">
            <!-- Title editable -->
            <textarea
              v-if="editingTitle"
              v-model="title"
              class="w-full bg-[#1d2125] text-white text-lg font-semibold rounded px-2 py-1 outline-none border border-[#579dff] resize-none"
              rows="2"
              autofocus
              @keydown.enter.prevent="saveTitle"
              @keydown.escape="editingTitle = false; title = card.title"
              @blur="saveTitle"
            />
            <h2
              v-else
              class="text-lg font-semibold text-white cursor-pointer hover:bg-[#1d2125] rounded px-2 py-1 -mx-2"
              @click="editingTitle = true"
            >
              {{ card.title }}
            </h2>
            <p class="text-xs text-[#8c9bab] mt-1 px-2">
              in list <span class="underline cursor-pointer">{{ list.title }}</span>
            </p>
            <p v-if="card.createdAt" class="text-xs text-[#8c9bab]/60 mt-0.5 px-2">
              Created {{ formatDateTime(card.createdAt) }}
            </p>
          </div>
          <button
            class="text-[#8c9bab] hover:text-white hover:bg-[#38424d] rounded p-1.5 transition-colors"
            @click="emit('close')"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Body -->
      <div class="p-5 flex gap-5">
        <!-- Main content -->
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-4 h-4 text-[#8c9bab]" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h4a1 1 0 100-2H7z" clip-rule="evenodd"/>
            </svg>
            <span class="text-sm font-semibold text-[#b6c2cf]">Description</span>
          </div>
          <textarea
            v-model="description"
            placeholder="Add a more detailed description..."
            class="w-full bg-[#1d2125] hover:bg-[#38424d] focus:bg-[#1d2125] text-white text-sm rounded px-3 py-2 outline-none border border-transparent focus:border-[#579dff] resize-none transition-colors placeholder-[#8c9bab] min-h-[80px]"
            rows="4"
            @focus="editingDescription = true"
            @keydown.escape="cancelDescription"
          />
          <div v-if="editingDescription" class="flex items-center gap-2 mt-2">
            <button
              class="bg-[#579dff] hover:bg-[#4b8de8] text-white text-sm rounded px-3 py-1.5 font-medium disabled:opacity-50 transition-colors"
              :disabled="saving"
              @click="saveDescription"
            >
              {{ saving ? 'Saving...' : 'Save' }}
            </button>
            <button
              class="text-[#8c9bab] hover:text-white text-sm px-2 py-1.5 transition-colors"
              @click="cancelDescription"
            >
              Cancel
            </button>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="w-36 shrink-0 flex flex-col gap-3">
          <div>
            <p class="text-xs font-semibold text-[#8c9bab] uppercase tracking-wide mb-2">Priority</p>
            <!-- Current priority badge -->
            <div
              class="text-xs font-semibold rounded px-2 py-1 mb-2 text-center"
              :style="{ backgroundColor: currentPriority.color + '33', color: currentPriority.color, border: `1px solid ${currentPriority.color}66` }"
            >
              {{ currentPriority.label }}
            </div>
            <!-- Priority options -->
            <div class="flex flex-col gap-1">
              <button
                v-for="p in PRIORITIES"
                :key="p.value"
                class="w-full text-left text-xs rounded px-2 py-1 transition-colors flex items-center gap-2"
                :class="(card.priority ?? 'none') === p.value ? 'bg-[#454f59]' : 'hover:bg-[#38424d]'"
                :style="{ color: p.color }"
                @click="setPriority(p.value)"
              >
                <span
                  class="w-2 h-2 rounded-full shrink-0"
                  :style="{ backgroundColor: p.color }"
                />
                {{ p.label }}
              </button>
            </div>
          </div>

          <div>
            <p class="text-xs font-semibold text-[#8c9bab] uppercase tracking-wide mb-2">Color</p>
            <div class="flex flex-wrap gap-1.5 mb-1">
              <button
                v-for="c in ACCENT_COLORS"
                :key="c"
                class="w-5 h-5 rounded hover:scale-110 transition-transform"
                :class="card.color === c ? 'ring-2 ring-white ring-offset-1 ring-offset-[#282e33]' : ''"
                :style="{ backgroundColor: c }"
                @click="emit('update', { color: c })"
              />
            </div>
            <button
              v-if="card.color"
              class="w-full text-[10px] text-[#8c9bab] hover:text-white py-0.5 text-left transition-colors"
              @click="emit('update', { color: '' })"
            >
              Remove color
            </button>
          </div>

          <div>
            <p class="text-xs font-semibold text-[#8c9bab] uppercase tracking-wide mb-2">Actions</p>
            <button
              class="w-full text-left text-sm text-[#b6c2cf] bg-[#38424d] hover:bg-[#454f59] rounded px-3 py-1.5 transition-colors flex items-center gap-2"
              @click="emit('delete')"
            >
              <svg class="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
