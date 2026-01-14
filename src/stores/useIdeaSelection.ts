// Zustand store for managing idea selection state
// Tracks selected ideas with a maximum of 15 selections

import { create } from 'zustand'
import type { ContentIdea } from '../types/ai'

const MAX_SELECTIONS = 15

interface IdeaSelectionState {
  // Selected idea IDs
  selectedIds: Set<string>

  // Full idea objects for selected items (for future post generation)
  selectedIdeas: ContentIdea[]

  // Actions
  toggleSelection: (idea: ContentIdea) => void
  selectIdea: (idea: ContentIdea) => void
  deselectIdea: (ideaId: string) => void
  selectAll: (ideas: ContentIdea[]) => void
  deselectAll: () => void
  clearSelection: () => void

  // Computed
  isSelected: (ideaId: string) => boolean
  selectionCount: number
  canSelectMore: boolean
}

export const useIdeaSelection = create<IdeaSelectionState>((set, get) => ({
  selectedIds: new Set<string>(),
  selectedIdeas: [],
  selectionCount: 0,
  canSelectMore: true,

  toggleSelection: (idea: ContentIdea) => {
    const { selectedIds, selectedIdeas } = get()

    if (selectedIds.has(idea.id)) {
      // Deselect
      const newSelectedIds = new Set(selectedIds)
      newSelectedIds.delete(idea.id)
      const newSelectedIdeas = selectedIdeas.filter(i => i.id !== idea.id)

      set({
        selectedIds: newSelectedIds,
        selectedIdeas: newSelectedIdeas,
        selectionCount: newSelectedIds.size,
        canSelectMore: newSelectedIds.size < MAX_SELECTIONS,
      })
    } else {
      // Select (if under limit)
      if (selectedIds.size >= MAX_SELECTIONS) {
        return // Don't allow more than MAX_SELECTIONS
      }

      const newSelectedIds = new Set(selectedIds)
      newSelectedIds.add(idea.id)

      set({
        selectedIds: newSelectedIds,
        selectedIdeas: [...selectedIdeas, idea],
        selectionCount: newSelectedIds.size,
        canSelectMore: newSelectedIds.size < MAX_SELECTIONS,
      })
    }
  },

  selectIdea: (idea: ContentIdea) => {
    const { selectedIds, selectedIdeas } = get()

    if (selectedIds.has(idea.id) || selectedIds.size >= MAX_SELECTIONS) {
      return
    }

    const newSelectedIds = new Set(selectedIds)
    newSelectedIds.add(idea.id)

    set({
      selectedIds: newSelectedIds,
      selectedIdeas: [...selectedIdeas, idea],
      selectionCount: newSelectedIds.size,
      canSelectMore: newSelectedIds.size < MAX_SELECTIONS,
    })
  },

  deselectIdea: (ideaId: string) => {
    const { selectedIds, selectedIdeas } = get()

    if (!selectedIds.has(ideaId)) {
      return
    }

    const newSelectedIds = new Set(selectedIds)
    newSelectedIds.delete(ideaId)

    set({
      selectedIds: newSelectedIds,
      selectedIdeas: selectedIdeas.filter(i => i.id !== ideaId),
      selectionCount: newSelectedIds.size,
      canSelectMore: newSelectedIds.size < MAX_SELECTIONS,
    })
  },

  selectAll: (ideas: ContentIdea[]) => {
    // Select up to MAX_SELECTIONS ideas
    const toSelect = ideas.slice(0, MAX_SELECTIONS)
    const newSelectedIds = new Set(toSelect.map(i => i.id))

    set({
      selectedIds: newSelectedIds,
      selectedIdeas: toSelect,
      selectionCount: newSelectedIds.size,
      canSelectMore: newSelectedIds.size < MAX_SELECTIONS,
    })
  },

  deselectAll: () => {
    set({
      selectedIds: new Set(),
      selectedIdeas: [],
      selectionCount: 0,
      canSelectMore: true,
    })
  },

  clearSelection: () => {
    set({
      selectedIds: new Set(),
      selectedIdeas: [],
      selectionCount: 0,
      canSelectMore: true,
    })
  },

  isSelected: (ideaId: string) => {
    return get().selectedIds.has(ideaId)
  },
}))

// Export max selections constant for UI use
export const MAX_IDEA_SELECTIONS = MAX_SELECTIONS
