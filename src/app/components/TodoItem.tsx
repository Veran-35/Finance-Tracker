import { Todo, PRIORITY_CONFIG } from '@/app/types/todo';
import { daysUntil } from '@/app/utils/date';

interface TodoItemProps {
  todo: Todo;
  reminderDays: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDragStart: (id: string) => void;
  onDragEnter: (id: string) => void;
  onDragEnd: () => void;
  onDrop: (id: string) => void;
  isDragOver: boolean;
}

export function TodoItem({
  todo,
  reminderDays,
  onToggle,
  onDelete,
  onEdit,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onDrop,
  isDragOver,
}: TodoItemProps) {
  const priority = PRIORITY_CONFIG[todo.priority];
  const isOverdue = todo.due_date && !todo.is_completed && new Date(todo.due_date) < new Date(new Date().toDateString());
  const daysLeft = todo.due_date ? daysUntil(todo.due_date) : null;
  const isDueSoon =
    !isOverdue &&
    !todo.is_completed &&
    daysLeft !== null &&
    daysLeft >= 0 &&
    daysLeft <= reminderDays;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === now.toDateString()) return 'Hari ini';
    if (date.toDateString() === tomorrow.toDateString()) return 'Besok';
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(todo.id);
      }}
      onDragEnter={() => onDragEnter(todo.id)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(todo.id);
      }}
      onDragEnd={onDragEnd}
      className={`flex items-start gap-3.5 py-4 px-4.5 bg-white rounded-[14px] transition-all duration-250 relative overflow-hidden cursor-grab active:cursor-grabbing hover:border-accent hover:shadow-[0_4px_16px_rgba(231,111,81,0.08)] ${
        isOverdue ? "border border-accent/25" : "border border-border"
      } ${isDragOver ? "ring-2 ring-accent/40 border-accent" : ""}`}
      style={{ opacity: todo.is_completed ? 0.65 : 1 }}
    >
      {/* Drag handle */}
      <span
        className="text-muted-lighter text-base leading-none mt-1 shrink-0 select-none"
        aria-hidden="true"
      >
        ⠿
      </span>

      {/* Checkbox */}
      <button
        onClick={() => onToggle(todo.id)}
        className={`w-[22px] h-[22px] rounded-[7px] border-2 cursor-pointer flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200 p-0 ${
          todo.is_completed
            ? "border-green bg-green"
            : "border-muted-lighter bg-transparent hover:border-teal"
        }`}
      >
        {todo.is_completed && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6L5 9L10 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-sm font-medium leading-snug ${
            todo.is_completed ? "text-muted-light line-through" : "text-dark"
          }`}>
            {todo.title}
          </span>
        </div>

        {todo.content && (
          <p className="text-xs text-muted-light m-0 mb-2 leading-relaxed">{todo.content}</p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          {/* Priority Badge */}
          <span
            className="text-[11px] font-semibold py-0.5 px-2.5 rounded-md"
            style={{ color: priority.color, background: priority.bg }}
          >
            {priority.icon} {priority.label}
          </span>

          {/* Due Date */}
          {todo.due_date && (
            <span className={`text-[11px] font-medium py-0.5 px-2.5 rounded-md flex items-center gap-1 ${
              isOverdue
                ? "text-accent bg-accent/[0.08]"
                : "text-muted bg-muted/[0.08]"
            }`}>
              📅 {formatDate(todo.due_date)}
              {isOverdue && ' (Terlambat)'}
            </span>
          )}

          {/* Due soon reminder */}
          {isDueSoon && (
            <span className="text-[11px] font-medium py-0.5 px-2.5 rounded-md flex items-center gap-1 text-[#F4A261] bg-[#F4A261]/[0.12]">
              ⏰ H-{daysLeft}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-1 shrink-0 mt-0.5">
        <button
          onClick={() => onEdit(todo)}
          title="Edit"
          className="w-[30px] h-[30px] rounded-lg border-none bg-muted/[0.08] cursor-pointer text-[13px] flex items-center justify-center transition-all duration-200 text-muted hover:bg-accent-light/15 hover:text-accent-light"
        >
          ✏️
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          title="Hapus"
          className="w-[30px] h-[30px] rounded-lg border-none bg-muted/[0.08] cursor-pointer text-[13px] flex items-center justify-center transition-all duration-200 text-muted hover:bg-accent/15 hover:text-accent"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
