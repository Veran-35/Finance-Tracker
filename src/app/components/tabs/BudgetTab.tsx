'use client';

import { useState } from 'react';
import { UseBudgetsReturn } from '@/app/hooks/useBudgets';
import { BudgetCard } from '@/app/components/BudgetCard';
import { BudgetModal } from '@/app/components/BudgetModal';
import { Budget } from '@/app/types';
import { fmt } from '@/app/utils/format';

interface BudgetTabProps {
  budget: UseBudgetsReturn;
}

export function BudgetTab({ budget }: BudgetTabProps) {
  const [showModal, setShowModal] = useState(false);

  const handleOpenAdd = () => {
    budget.cancelEdit();
    setShowModal(true);
  };

  const handleEdit = (b: Budget) => {
    budget.startEdit(b);
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (budget.editingId) {
      budget.saveEdit();
    } else {
      budget.addBudget();
    }
    setShowModal(false);
  };

  const handleClose = () => {
    budget.cancelEdit();
    setShowModal(false);
  };

  return (
    <div>
      {/* Header Stats */}
      <div className="grid grid-cols-2 gap-4 mb-7 animate-[fadeInUp_0.4s_ease-out]">
        <div className="bg-white rounded-2xl py-4.5 px-5 border border-border flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center text-xl">🎯</div>
          <div>
            <div className="text-[22px] font-bold text-dark leading-tight">{budget.budgets.length}</div>
            <div className="text-xs text-muted">Kategori Budget</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl py-4.5 px-5 border border-border flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal/10 flex items-center justify-center text-xl">💵</div>
          <div>
            <div className="text-[22px] font-bold text-dark leading-tight">{fmt(budget.totalBudget)}</div>
            <div className="text-xs text-muted">Total Batas Bulanan</div>
          </div>
        </div>
      </div>

      {/* Section Header + Add */}
      <div className="flex items-center justify-between mb-4 animate-[fadeInUp_0.5s_ease-out]">
        <div className="text-[13px] font-semibold text-muted uppercase tracking-[0.06em]">
          Monitoring Budget Bulanan
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-gradient-accent text-white border-none rounded-[10px] py-2.5 px-5 text-[13px] font-semibold cursor-pointer flex items-center gap-1.5 shadow-accent transition-all hover:shadow-accent-lg"
        >
          <span className="text-base leading-none">+</span>
          Budget Baru
        </button>
      </div>

      {/* Budget List */}
      <div className="flex flex-col gap-3 animate-[fadeInUp_0.6s_ease-out]">
        {budget.budgets.length === 0 ? (
          <div className="text-center py-15 bg-white rounded-2xl border border-border">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-base font-semibold text-dark m-0 mb-2">Belum ada budget</h3>
            <p className="text-[13px] text-muted-light m-0 mb-5">
              Buat kategori budget untuk memantau pengeluaran bulananmu
            </p>
            <button
              onClick={handleOpenAdd}
              className="bg-gradient-accent text-white border-none rounded-[10px] py-2.5 px-6 text-[13px] font-semibold cursor-pointer shadow-accent"
            >
              + Buat Budget Pertama
            </button>
          </div>
        ) : (
          budget.budgets.map((b) => (
            <BudgetCard
              key={b.id}
              budget={b}
              spent={0}
              onEdit={handleEdit}
              onDelete={budget.deleteBudget}
            />
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <BudgetModal
          form={budget.form}
          onFormChange={budget.setForm}
          onSubmit={handleSubmit}
          onClose={handleClose}
          isEditing={!!budget.editingId}
          iconOptions={budget.ICON_OPTIONS}
          colorOptions={budget.COLOR_OPTIONS}
        />
      )}
    </div>
  );
}
