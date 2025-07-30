import React, { useState } from 'react';
import { useFinanceStore, Transaction } from '@/store/useFinanceStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Transacoes() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useFinanceStore();
  const [isOpen, setIsOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    isRecurring: false,
    installments: {
      total: '',
      current: '',
      installmentValue: ''
    }
  });

  const categories = {
    income: ['Salário', 'Freelance', 'Investimentos', 'Outros'],
    expense: ['Moradia', 'Alimentação', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Tecnologia', 'Outros']
  };

  const resetForm = () => {
    setFormData({
      type: 'expense',
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      isRecurring: false,
      installments: {
        total: '',
        current: '',
        installmentValue: ''
      }
    });
    setEditingTransaction(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description || !formData.category) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const transactionData = {
      type: formData.type,
      amount: parseFloat(formData.amount),
      description: formData.description,
      category: formData.category,
      date: formData.date,
      isRecurring: formData.isRecurring,
      ...(formData.installments.total && {
        installments: {
          total: parseInt(formData.installments.total),
          current: parseInt(formData.installments.current) || 1,
          installmentValue: parseFloat(formData.installments.installmentValue) || parseFloat(formData.amount)
        }
      })
    };

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, transactionData);
      toast.success('Transação atualizada com sucesso!');
    } else {
      addTransaction(transactionData);
      toast.success('Transação adicionada com sucesso!');
    }

    resetForm();
    setIsOpen(false);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      description: transaction.description,
      category: transaction.category,
      date: transaction.date,
      isRecurring: transaction.isRecurring || false,
      installments: {
        total: transaction.installments?.total?.toString() || '',
        current: transaction.installments?.current?.toString() || '',
        installmentValue: transaction.installments?.installmentValue?.toString() || ''
      }
    });
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    toast.success('Transação removida com sucesso!');
  };

  const filteredTransactions = transactions.filter(t => 
    filter === 'all' || t.type === filter
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Transações</h1>
          <p className="text-muted-foreground">
            Gerencie suas receitas e despesas
          </p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-gradient-primary hover:opacity-90"
              onClick={resetForm}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Nova Transação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value: 'income' | 'expense') => 
                      setFormData(prev => ({ ...prev, type: value, category: '' }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Receita</SelectItem>
                      <SelectItem value="expense">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="amount">Valor (R$)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0,00"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Ex: Supermercado, Salário..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories[formData.type].map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="recurring"
                  checked={formData.isRecurring}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, isRecurring: checked }))
                  }
                />
                <Label htmlFor="recurring">Transação recorrente</Label>
              </div>

              {/* Parcelamento */}
              <div className="border-t pt-4">
                <Label className="text-sm font-medium">Parcelamento (opcional)</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div>
                    <Label htmlFor="installments-total" className="text-xs">Total de parcelas</Label>
                    <Input
                      id="installments-total"
                      type="number"
                      value={formData.installments.total}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        installments: { ...prev.installments, total: e.target.value }
                      }))}
                      placeholder="12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="installments-current" className="text-xs">Parcela atual</Label>
                    <Input
                      id="installments-current"
                      type="number"
                      value={formData.installments.current}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        installments: { ...prev.installments, current: e.target.value }
                      }))}
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="installments-value" className="text-xs">Valor da parcela</Label>
                    <Input
                      id="installments-value"
                      type="number"
                      step="0.01"
                      value={formData.installments.installmentValue}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        installments: { ...prev.installments, installmentValue: e.target.value }
                      }))}
                      placeholder="100,00"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-gradient-primary">
                  {editingTransaction ? 'Salvar' : 'Adicionar'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <ArrowUpIcon className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Receitas</p>
                <p className="text-2xl font-bold text-success">
                  {totalIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-danger/10 rounded-lg">
                <ArrowDownIcon className="h-5 w-5 text-danger" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Despesas</p>
                <p className="text-2xl font-bold text-danger">
                  {totalExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CreditCardIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saldo Total</p>
                <p className={`text-2xl font-bold ${(totalIncome - totalExpenses) >= 0 ? 'text-success' : 'text-danger'}`}>
                  {(totalIncome - totalExpenses).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Transactions List */}
      <Card className="shadow-soft">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Lista de Transações</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                Todas
              </Button>
              <Button 
                variant={filter === 'income' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('income')}
              >
                Receitas
              </Button>
              <Button 
                variant={filter === 'expense' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('expense')}
              >
                Despesas
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma transação encontrada
              </div>
            ) : (
              filteredTransactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-accent/30 rounded-lg border border-border/50 hover:shadow-soft transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      transaction.type === 'income' ? 'bg-success/10' : 'bg-danger/10'
                    }`}>
                      {transaction.type === 'income' ? (
                        <ArrowUpIcon className="h-4 w-4 text-success" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 text-danger" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground">{transaction.description}</h3>
                        {transaction.isRecurring && (
                          <Badge variant="secondary" className="text-xs">Recorrente</Badge>
                        )}
                        {transaction.installments && (
                          <Badge variant="outline" className="text-xs">
                            {transaction.installments.current}/{transaction.installments.total}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{transaction.category}</span>
                        <span>•</span>
                        <span>{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`font-bold ${
                        transaction.type === 'income' ? 'text-success' : 'text-danger'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {transaction.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(transaction)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(transaction.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}