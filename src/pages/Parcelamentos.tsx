import React, { useState } from 'react';
import { useFinanceStore, Transaction } from '@/store/useFinanceStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PlusIcon,
  CreditCardIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface InstallmentTransaction extends Transaction {
  installments: {
    total: number;
    current: number;
    installmentValue: number;
    paidInstallments?: number[];
  };
}

export default function Parcelamentos() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useFinanceStore();
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'active' | 'completed' | 'all'>('active');
  
  const [formData, setFormData] = useState({
    description: '',
    category: '',
    totalAmount: '',
    installments: '',
    firstInstallmentDate: ''
  });

  const resetForm = () => {
    setFormData({
      description: '',
      category: '',
      totalAmount: '',
      installments: '',
      firstInstallmentDate: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.totalAmount || !formData.installments) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const totalAmount = parseFloat(formData.totalAmount);
    const installmentCount = parseInt(formData.installments);
    const installmentValue = totalAmount / installmentCount;
    const startDate = formData.firstInstallmentDate || new Date().toISOString().split('T')[0];

    // Criar uma transação parcelada
    addTransaction({
      type: 'expense',
      amount: totalAmount,
      description: formData.description,
      category: formData.category || 'Parcelamento',
      date: startDate,
      installments: {
        total: installmentCount,
        current: 1,
        installmentValue,
        paidInstallments: []
      }
    });

    toast.success('Parcelamento criado com sucesso!');
    resetForm();
    setIsOpen(false);
  };

  const getInstallmentTransactions = (): InstallmentTransaction[] => {
    return transactions.filter(t => t.installments) as InstallmentTransaction[];
  };

  const markInstallmentAsPaid = (transactionId: string, installmentNumber: number) => {
    const transaction = transactions.find(t => t.id === transactionId) as InstallmentTransaction;
    if (!transaction) return;

    const paidInstallments = transaction.installments.paidInstallments || [];
    if (!paidInstallments.includes(installmentNumber)) {
      updateTransaction(transactionId, {
        installments: {
          ...transaction.installments,
          paidInstallments: [...paidInstallments, installmentNumber]
        }
      });
      toast.success(`Parcela ${installmentNumber} marcada como paga!`);
    }
  };

  const markInstallmentAsUnpaid = (transactionId: string, installmentNumber: number) => {
    const transaction = transactions.find(t => t.id === transactionId) as InstallmentTransaction;
    if (!transaction) return;

    const paidInstallments = transaction.installments.paidInstallments || [];
    const newPaidInstallments = paidInstallments.filter(n => n !== installmentNumber);
    
    updateTransaction(transactionId, {
      installments: {
        ...transaction.installments,
        paidInstallments: newPaidInstallments
      }
    });
    toast.success(`Parcela ${installmentNumber} marcada como não paga!`);
  };

  const payOffInstallment = (transactionId: string) => {
    const transaction = transactions.find(t => t.id === transactionId) as InstallmentTransaction;
    if (!transaction) return;

    const allInstallments = Array.from({ length: transaction.installments.total }, (_, i) => i + 1);
    updateTransaction(transactionId, {
      installments: {
        ...transaction.installments,
        paidInstallments: allInstallments
      }
    });
    toast.success('Parcelamento quitado com sucesso!');
  };

  const getInstallmentStatus = (transaction: InstallmentTransaction) => {
    const paidCount = transaction.installments.paidInstallments?.length || 0;
    const totalCount = transaction.installments.total;
    const progress = (paidCount / totalCount) * 100;
    
    if (paidCount === totalCount) return { status: 'completed', color: 'success', text: 'Quitado' };
    if (paidCount > 0) return { status: 'partial', color: 'warning', text: 'Em andamento' };
    return { status: 'pending', color: 'danger', text: 'Pendente' };
  };

  const generateInstallmentSchedule = (transaction: InstallmentTransaction) => {
    const schedule = [];
    const startDate = new Date(transaction.date);
    const paidInstallments = transaction.installments.paidInstallments || [];
    
    for (let i = 1; i <= transaction.installments.total; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(startDate.getMonth() + (i - 1));
      
      const isPaid = paidInstallments.includes(i);
      const isOverdue = !isPaid && dueDate < new Date();
      
      schedule.push({
        number: i,
        dueDate: dueDate.toISOString().split('T')[0],
        value: transaction.installments.installmentValue,
        isPaid,
        isOverdue
      });
    }
    
    return schedule;
  };

  const installmentTransactions = getInstallmentTransactions();
  const filteredTransactions = installmentTransactions.filter(transaction => {
    const status = getInstallmentStatus(transaction);
    if (viewMode === 'active') return status.status !== 'completed';
    if (viewMode === 'completed') return status.status === 'completed';
    return true;
  });

  const totalParcelamentos = installmentTransactions.length;
  const totalValue = installmentTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalPaid = installmentTransactions.reduce((sum, t) => {
    const paidCount = t.installments.paidInstallments?.length || 0;
    return sum + (paidCount * t.installments.installmentValue);
  }, 0);
  const totalRemaining = totalValue - totalPaid;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Controle de Parcelamentos</h1>
          <p className="text-muted-foreground">
            Gerencie suas compras parceladas e acompanhe os pagamentos
          </p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-gradient-primary hover:opacity-90"
              onClick={resetForm}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Novo Parcelamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Novo Parcelamento</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="description">Descrição da Compra</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Ex: iPhone 15 Pro"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Ex: Tecnologia"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="totalAmount">Valor Total (R$)</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    step="0.01"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: e.target.value }))}
                    placeholder="3.600"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="installments">Número de Parcelas</Label>
                  <Input
                    id="installments"
                    type="number"
                    value={formData.installments}
                    onChange={(e) => setFormData(prev => ({ ...prev, installments: e.target.value }))}
                    placeholder="12"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="firstInstallmentDate">Data da 1ª Parcela</Label>
                <Input
                  id="firstInstallmentDate"
                  type="date"
                  value={formData.firstInstallmentDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstInstallmentDate: e.target.value }))}
                />
              </div>

              {formData.totalAmount && formData.installments && (
                <div className="p-3 bg-accent/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">Valor da parcela:</p>
                  <p className="text-lg font-bold text-primary">
                    {(parseFloat(formData.totalAmount) / parseInt(formData.installments)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-gradient-primary">
                  Criar Parcelamento
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CreditCardIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Parcelamentos</p>
                <p className="text-2xl font-bold text-foreground">{totalParcelamentos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <CurrencyDollarIcon className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-xl font-bold text-foreground">
                  {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircleIcon className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Pago</p>
                <p className="text-xl font-bold text-success">
                  {totalPaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-danger/10 rounded-lg">
                <ClockIcon className="h-5 w-5 text-danger" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Restante</p>
                <p className="text-xl font-bold text-danger">
                  {totalRemaining.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Ativos ({installmentTransactions.filter(t => getInstallmentStatus(t).status !== 'completed').length})</TabsTrigger>
          <TabsTrigger value="completed">Quitados ({installmentTransactions.filter(t => getInstallmentStatus(t).status === 'completed').length})</TabsTrigger>
          <TabsTrigger value="all">Todos ({totalParcelamentos})</TabsTrigger>
        </TabsList>

        <TabsContent value={viewMode} className="space-y-6">
          {/* Installments List */}
          {filteredTransactions.length === 0 ? (
            <Card className="shadow-soft">
              <CardContent className="py-12 text-center">
                <CreditCardIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {viewMode === 'active' ? 'Nenhum parcelamento ativo' : 
                   viewMode === 'completed' ? 'Nenhum parcelamento quitado' : 
                   'Nenhum parcelamento criado'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {viewMode === 'all' ? 'Comece criando seu primeiro parcelamento para ter controle total das suas compras' : 
                   'Nenhum parcelamento encontrado nesta categoria'}
                </p>
                {viewMode === 'all' && (
                  <Button 
                    onClick={() => setIsOpen(true)}
                    className="bg-gradient-primary"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Criar Primeiro Parcelamento
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredTransactions.map((transaction) => {
              const status = getInstallmentStatus(transaction);
              const schedule = generateInstallmentSchedule(transaction);
              const paidCount = transaction.installments.paidInstallments?.length || 0;
              const progress = (paidCount / transaction.installments.total) * 100;

              return (
                <Card key={transaction.id} className="shadow-soft">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <CreditCardIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{transaction.description}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={status.color === 'success' ? 'default' : 'secondary'} className="text-xs">
                              {status.text}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {transaction.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-1">
                        {status.status !== 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => payOffInstallment(transaction.id)}
                          >
                            Quitar
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteTransaction(transaction.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Progress */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Progresso</span>
                          <span className="font-medium">{paidCount}/{transaction.installments.total} parcelas pagas</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      {/* Financial Summary */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-accent/30 rounded-lg">
                        <div>
                          <p className="text-xs text-muted-foreground">Valor Total</p>
                          <p className="font-medium text-foreground">
                            {transaction.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Valor da Parcela</p>
                          <p className="font-medium text-foreground">
                            {transaction.installments.installmentValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Valor Pago</p>
                          <p className="font-medium text-success">
                            {(paidCount * transaction.installments.installmentValue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Valor Restante</p>
                          <p className="font-medium text-danger">
                            {((transaction.installments.total - paidCount) * transaction.installments.installmentValue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                        </div>
                      </div>

                      {/* Installment Schedule */}
                      <div>
                        <h4 className="font-medium mb-3">Cronograma de Parcelas</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {schedule.map((installment) => (
                            <div
                              key={installment.number}
                              className={`p-3 rounded border text-sm ${
                                installment.isPaid
                                  ? 'bg-success/10 border-success/30 text-success'
                                  : installment.isOverdue
                                  ? 'bg-danger/10 border-danger/30 text-danger'
                                  : 'bg-accent/30 border-border/50'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium">Parcela {installment.number}</p>
                                  <p className="text-xs opacity-80">
                                    {new Date(installment.dueDate).toLocaleDateString('pt-BR')}
                                  </p>
                                  <p className="text-xs font-medium">
                                    {installment.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                  </p>
                                </div>
                                <div className="flex flex-col gap-1">
                                  {installment.isPaid ? (
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-6 w-6"
                                      onClick={() => markInstallmentAsUnpaid(transaction.id, installment.number)}
                                    >
                                      <CheckCircleIcon className="h-4 w-4 text-success" />
                                    </Button>
                                  ) : (
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-6 w-6"
                                      onClick={() => markInstallmentAsPaid(transaction.id, installment.number)}
                                    >
                                      <XCircleIcon className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}