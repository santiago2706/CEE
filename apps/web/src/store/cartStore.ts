import { create } from 'zustand';
import type { Course } from '@cee/types';

interface CartState {
  items: Course[];
  addItem: (course: Course) => void;
  removeItem: (courseId: string) => void;
  clear: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (course) => {
    set((state) => {
      if (state.items.some((item) => item.id === course.id)) {
        return state;
      }

      return { items: [...state.items, course] };
    });
  },
  removeItem: (courseId) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== courseId),
    }));
  },
  clear: () => set({ items: [] }),
  total: () => get().items.reduce((sum, item) => sum + item.price, 0),
}));
