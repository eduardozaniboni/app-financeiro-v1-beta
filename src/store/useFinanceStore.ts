import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  isRecurring?: boolean;
  installments?: {
    total: number;
    current: number;
    installmentValue: number;
    paidInstallments?: number[];
  };
}

export interface Asset {
  id: string;
  name: string;
  type: 'renda-fixa' | 'renda-variavel' | 'criptomoeda' | 'fundo';
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  purchaseDate: string;
}

export interface Contribution {
  id: string;
  amount: number;
  date: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  monthlyContribution: number;
  expectedReturn: number;
  contributions?: Contribution[];
}

export interface Investment {
  id: string;
  name: string;
  initialAmount: number;
  monthlyContribution: number;
  expectedReturn: number;
  period: number; // months
  compoundInterest: boolean;
  inflation?: number;
}

interface FinanceState {
  // Transactions
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  
  // Assets
  assets: Asset[];
  addAsset: (asset: Omit<Asset, 'id'>) => void;
  updateAsset: (id: string, asset: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  
  // Goals
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addContribution: (goalId: string, amount: number) => void;
  
  // Investments
  investments: Investment[];
  addInvestment: (investment: Omit<Investment, 'id'>) => void;
  updateInvestment: (id: string, investment: Partial<Investment>) => void;
  deleteInvestment: (id: string) => void;
  
  // Computed values
  getTotalBalance: () => number;
  getMonthlyIncome: () => number;
  getMonthlyExpenses: () => number;
  getAssetsValue: () => number;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      transactions: [
        {
          id: '1',
          type: 'income',
          amount: 5000,
          description: 'Salário',
          category: 'Trabalho',
          date: '2024-07-01',
          isRecurring: true
        },
        {
          id: '2',
          type: 'expense',
          amount: 1200,
          description: 'Aluguel',
          category: 'Moradia',
          date: '2024-07-05',
          isRecurring: true
        },
        {
          id: '3',
          type: 'expense',
          amount: 800,
          description: 'Supermercado',
          category: 'Alimentação',
          date: '2024-07-10'
        },
        {
          id: '4',
          type: 'expense',
          amount: 300,
          description: 'Celular iPhone',
          category: 'Tecnologia',
          date: '2024-07-15',
          installments: {
            total: 12,
            current: 3,
            installmentValue: 300
          }
        }
      ],
      
      assets: [
        {
          id: '1',
          name: 'Tesouro Selic 2029',
          type: 'renda-fixa',
          quantity: 1000,
          purchasePrice: 100,
          currentPrice: 108.5,
          purchaseDate: '2024-01-15'
        },
        {
          id: '2',
          name: 'PETR4',
          type: 'renda-variavel',
          quantity: 100,
          purchasePrice: 32.50,
          currentPrice: 38.20,
          purchaseDate: '2024-03-20'
        },
        {
          id: '3',
          name: 'Bitcoin',
          type: 'criptomoeda',
          quantity: 0.5,
          purchasePrice: 160000,
          currentPrice: 180000,
          purchaseDate: '2024-02-10'
        }
      ],
      
      goals: [
        {
          id: '1',
          name: 'Casa Própria',
          targetAmount: 300000,
          currentAmount: 45000,
          deadline: '2026-12-31',
          monthlyContribution: 2000,
          expectedReturn: 0.8
        },
        {
          id: '2',
          name: 'Viagem Europa',
          targetAmount: 15000,
          currentAmount: 3000,
          deadline: '2025-06-30',
          monthlyContribution: 500,
          expectedReturn: 0.6
        }
      ],
      
      investments: [
        {
          id: '1',
          name: 'Reserva de Emergência',
          initialAmount: 10000,
          monthlyContribution: 1000,
          expectedReturn: 10.5,
          period: 24,
          compoundInterest: true,
          inflation: 4.5
        },
        {
          id: '2',
          name: 'Aposentadoria',
          initialAmount: 50000,
          monthlyContribution: 2000,
          expectedReturn: 12,
          period: 240,
          compoundInterest: true,
          inflation: 4
        }
      ],

      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [
            ...state.transactions,
            { ...transaction, id: Date.now().toString() }
          ]
        })),

      updateTransaction: (id, transaction) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...transaction } : t
          )
        })),

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id)
        })),

      addAsset: (asset) =>
        set((state) => ({
          assets: [...state.assets, { ...asset, id: Date.now().toString() }]
        })),

      updateAsset: (id, asset) =>
        set((state) => ({
          assets: state.assets.map((a) =>
            a.id === id ? { ...a, ...asset } : a
          )
        })),

      deleteAsset: (id) =>
        set((state) => ({
          assets: state.assets.filter((a) => a.id !== id)
        })),

      addGoal: (goal) =>
        set((state) => ({
          goals: [...state.goals, { ...goal, id: Date.now().toString() }]
        })),

      updateGoal: (id, goal) =>
        set((state) => ({
          goals: state.goals.map((g) => (g.id === id ? { ...g, ...goal } : g))
        })),

      deleteGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id)
        })),

      addContribution: (goalId, amount) =>
        set((state) => ({
          goals: state.goals.map((g) => {
            if (g.id === goalId) {
              const newContribution: Contribution = {
                id: Date.now().toString(),
                amount,
                date: new Date().toISOString(),
              };
              return {
                ...g,
                currentAmount: g.currentAmount + amount,
                contributions: [...(g.contributions || []), newContribution],
              };
            }
            return g;
          }),
        })),

      addInvestment: (investment) =>
        set((state) => ({
          investments: [
            ...state.investments,
            { ...investment, id: Date.now().toString() }
          ]
        })),

      updateInvestment: (id, investment) =>
        set((state) => ({
          investments: state.investments.map((i) =>
            i.id === id ? { ...i, ...investment } : i
          )
        })),

      deleteInvestment: (id) =>
        set((state) => ({
          investments: state.investments.filter((i) => i.id !== id)
        })),

      getTotalBalance: () => {
        const { transactions } = get();
        return transactions.reduce((total, transaction) => {
          return transaction.type === 'income'
            ? total + transaction.amount
            : total - transaction.amount;
        }, 0);
      },

      getMonthlyIncome: () => {
        const { transactions } = get();
        const currentMonth = new Date().toISOString().substring(0, 7);
        return transactions
          .filter(
            (t) => t.type === 'income' && t.date.startsWith(currentMonth)
          )
          .reduce((total, t) => total + t.amount, 0);
      },

      getMonthlyExpenses: () => {
        const { transactions } = get();
        const currentMonth = new Date().toISOString().substring(0, 7);
        return transactions
          .filter(
            (t) => t.type === 'expense' && t.date.startsWith(currentMonth)
          )
          .reduce((total, t) => total + t.amount, 0);
      },

      getAssetsValue: () => {
        const { assets } = get();
        return assets.reduce(
          (total, asset) => total + asset.quantity * asset.currentPrice,
          0
        );
      }
    }),
    {
      name: 'finance-storage'
    }
  )
);