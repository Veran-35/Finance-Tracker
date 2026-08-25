export type TodoPriority = 'low' | 'medium' | 'high';

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  priority: TodoPriority;
  due_date: string | null;
  created_at: string;
}

export interface TodoFormData {
  title: string;
  description: string;
  priority: TodoPriority;
  due_date: string;
}

export const PRIORITY_CONFIG: Record<TodoPriority, { label: string; color: string; bg: string; icon: string }> = {
  low: { label: 'Rendah', color: '#2A9D8F', bg: 'rgba(42,157,143,0.12)', icon: '🟢' },
  medium: { label: 'Sedang', color: '#F4A261', bg: 'rgba(244,162,97,0.12)', icon: '🟡' },
  high: { label: 'Tinggi', color: '#E76F51', bg: 'rgba(231,111,81,0.12)', icon: '🔴' },
};
