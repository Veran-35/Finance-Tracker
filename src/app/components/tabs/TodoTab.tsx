'use client';

import { useState } from 'react';
import { useTodos } from '@/app/hooks/useTodos';
import { TodoItem } from '@/app/components/TodoItem';
import { TodoModal } from '@/app/components/TodoModal';

export function TodoTab() {
  const todo = useTodos();
  const [showModal, setShowModal] = useState(false);

  const handleOpenAdd = () => {
    todo.cancelEdit();
    setShowModal(true);
  };

  const handleEdit = (t: Parameters<typeof todo.startEdit>[0]) => {
    todo.startEdit(t);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (todo.editingId) {
      await todo.saveEdit();
    } else {
      await todo.addTodo();
    }
    setShowModal(false);
  };

  const handleClose = () => {
    todo.cancelEdit();
    setShowModal(false);
  };

  const filters = [
    { key: 'all' as const, label: 'Semua', count: todo.stats.total },
    { key: 'active' as const, label: 'Aktif', count: todo.stats.active },
    { key: 'completed' as const, label: 'Selesai', count: todo.stats.completed },
  ];

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-7 animate-[fadeInUp_0.4s_ease-out]">
        {[
          { label: 'Total', value: todo.stats.total, icon: '📋', color: '#219EBC' },
          { label: 'Aktif', value: todo.stats.active, icon: '⏳', color: '#F4A261' },
          { label: 'Selesai', value: todo.stats.completed, icon: '✅', color: '#06D6A0' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl py-4.5 px-5 border border-border flex items-center gap-3.5">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ background: `${stat.color}12` }}
            >
              {stat.icon}
            </div>
            <div>
              <div className="text-[22px] font-bold text-dark leading-tight">{stat.value}</div>
              <div className="text-xs text-muted">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar + Add Button */}
      <div className="flex items-center justify-between mb-5 animate-[fadeInUp_0.5s_ease-out]">
        <div className="flex gap-1.5 bg-[#F0EDE8] rounded-[10px] p-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => todo.setFilter(f.key)}
              className={`py-2 px-4 border-none rounded-lg text-[13px] font-semibold cursor-pointer transition-all duration-200 flex items-center gap-1.5 ${
                todo.filter === f.key
                  ? "bg-white text-dark shadow-[0_2px_6px_rgba(0,0,0,0.06)]"
                  : "bg-transparent text-muted hover:bg-accent/[0.06]"
              }`}
            >
              {f.label}
              <span className={`text-[11px] py-0.5 px-1.5 rounded-md font-bold ${
                todo.filter === f.key
                  ? "bg-accent/10 text-accent"
                  : "bg-muted/10 text-muted-light"
              }`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-gradient-accent text-white border-none rounded-[10px] py-2.5 px-5 text-[13px] font-semibold cursor-pointer flex items-center gap-1.5 shadow-accent transition-all hover:shadow-accent-lg"
        >
          <span className="text-base leading-none">+</span>
          Todo Baru
        </button>
      </div>

      {/* Todo List */}
      <div className="flex flex-col gap-2.5 animate-[fadeInUp_0.6s_ease-out]">
        {todo.loading ? (
          <div className="text-center py-15 text-muted text-sm">
            <div className="w-9 h-9 border-3 border-accent/15 border-t-accent rounded-full animate-spin mx-auto mb-4" />
            Memuat todo list...
          </div>
        ) : todo.todos.length === 0 ? (
          <div className="text-center py-15 bg-white rounded-2xl border border-border">
            <div className="text-5xl mb-4">
              {todo.filter === 'completed' ? '🎉' : todo.filter === 'active' ? '✨' : '📝'}
            </div>
            <h3 className="text-base font-semibold text-dark m-0 mb-2">
              {todo.filter === 'completed'
                ? 'Belum ada yang selesai'
                : todo.filter === 'active'
                ? 'Semua sudah selesai!'
                : 'Belum ada todo'}
            </h3>
            <p className="text-[13px] text-muted-light m-0">
              {todo.filter === 'all'
                ? 'Klik "Todo Baru" untuk mulai membuat daftar tugas'
                : 'Coba ganti filter untuk melihat todo lainnya'}
            </p>
          </div>
        ) : (
          todo.todos.map((t) => (
            <TodoItem
              key={t.id}
              todo={t}
              onToggle={todo.toggleTodo}
              onDelete={todo.deleteTodo}
              onEdit={handleEdit}
            />
          ))
        )}
      </div>

      {/* Progress Bar */}
      {todo.stats.total > 0 && (
        <div className="mt-6 p-4 px-5 bg-white rounded-[14px] border border-border animate-[fadeInUp_0.7s_ease-out]">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-[13px] font-semibold text-dark">Progress</span>
            <span className="text-[13px] font-bold text-green">
              {Math.round((todo.stats.completed / todo.stats.total) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-[#F0EDE8] rounded-[10px] overflow-hidden">
            <div
              className="h-full bg-gradient-teal rounded-[10px] transition-[width] duration-500 ease-in-out"
              style={{ width: `${(todo.stats.completed / todo.stats.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Todo Modal */}
      {showModal && (
        <TodoModal
          form={todo.form}
          onFormChange={todo.setForm}
          onSubmit={handleSubmit}
          onClose={handleClose}
          isEditing={!!todo.editingId}
        />
      )}
    </div>
  );
}
