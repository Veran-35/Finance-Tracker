'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Sidebar } from "@/app/components/Sidebar";
import { Header } from "@/app/components/Header";
import { OverviewTab } from "@/app/components/tabs/OverviewTab";
import { TransactionsTab } from "@/app/components/tabs/TransactionsTab";
import { BudgetTab } from "@/app/components/tabs/BudgetTab";
import { TodoTab } from "@/app/components/tabs/TodoTab";
import { StudyTimerTab } from "@/app/components/tabs/StudyTimerTab";
import { TransactionModal } from "@/app/components/TransactionModal";
import { useTransactions } from "@/app/hooks/useTransactions";
import { useNavigation } from "@/app/hooks/useNavigation";
import { useBudgets } from "@/app/hooks/useBudgets";

export default function FinancialTracker() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const txn = useTransactions();
  const nav = useNavigation();
  const bgt = useBudgets();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-accent/20 border-t-accent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="bg-cream min-h-screen text-dark flex">

      <Sidebar
        activeTab={nav.activeTab}
        sidebarOpen={nav.sidebarOpen}
        balance={txn.balance}
        totalIncome={txn.totalIncome}
        totalExpense={txn.totalExpense}
        onTabChange={nav.setActiveTab}
        onToggleSidebar={() => nav.setSidebarOpen(!nav.sidebarOpen)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <Header activeTab={nav.activeTab} onOpenSidebar={() => nav.setSidebarOpen(true)} />

        <main className="py-7 px-8 max-w-[1100px] w-full mx-auto max-lg:px-4 max-lg:py-4">
          {nav.activeTab === "overview" && (
            <OverviewTab
              balance={txn.balance}
              totalIncome={txn.totalIncome}
              totalExpense={txn.totalExpense}
              expenseByCategory={txn.expenseByCategory}
              transactions={txn.transactions}
              categories={txn.categories}
            />
          )}

          {nav.activeTab === "transaksi" && (
            <TransactionsTab
              txn={txn}
              onEdit={(transaction) => {
                txn.startEdit(transaction);
                nav.setShowModal(true);
              }}
              onAddNew={() => {
                txn.cancelEdit();
                nav.setShowModal(true);
              }}
            />
          )}

          {nav.activeTab === "budget" && (
            <BudgetTab budget={bgt} />
          )}

          {nav.activeTab === "todos" && (
            <TodoTab />
          )}

          {nav.activeTab === "study" && (
            <StudyTimerTab />
          )}
        </main>
      </div>

      {nav.showModal && (
        <TransactionModal
          form={txn.form}
          categories={txn.categories}
          isEditing={!!txn.editingId}
          onFormChange={txn.setForm}
          onSubmit={() => {
            if (txn.editingId) {
              txn.updateTransaction();
            } else {
              txn.addTransaction();
            }
            nav.setShowModal(false);
          }}
          onClose={() => {
            txn.cancelEdit();
            nav.setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
