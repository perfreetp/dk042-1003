import { create } from 'zustand';
import type { InternalNote } from '@/types';
import { loadFromStorage, saveToStorage } from '@/utils/persistUtils';
import { mockInternalNotes } from '@/data/mockInternalNotes';

interface InternalNoteState {
  notes: InternalNote[];
  setNotes: (notes: InternalNote[]) => void;
  addNote: (note: Omit<InternalNote, 'id' | 'createdAt'>) => void;
  getNotesByRecallId: (recallTaskId: string) => InternalNote[];
  getNotesByTargetId: (targetId: string) => InternalNote[];
}

const initialNotes = loadFromStorage<InternalNote[]>('internalNotes', mockInternalNotes);

export const useInternalNoteStore = create<InternalNoteState>((set, get) => ({
  notes: initialNotes,

  setNotes: (notes: InternalNote[]) => {
    set({ notes });
    saveToStorage('internalNotes', notes);
  },

  addNote: (note: Omit<InternalNote, 'id' | 'createdAt'>) => {
    const id = `note-${Date.now()}`;
    const createdAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newNote: InternalNote = {
      ...note,
      id,
      createdAt,
    };
    set((state) => {
      const newNotes = [...state.notes, newNote];
      saveToStorage('internalNotes', newNotes);
      return { notes: newNotes };
    });
  },

  getNotesByRecallId: (recallTaskId: string) => {
    return get()
      .notes.filter((n) => n.recallTaskId === recallTaskId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getNotesByTargetId: (targetId: string) => {
    return get()
      .notes.filter((n) => n.targetId === targetId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
}));
