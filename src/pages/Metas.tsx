import React, { useState } from 'react';
import { useFinanceStore, Goal } from '@/store/useFinanceStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  PlusIcon, 
  FlagIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Metas() {
  const { goals, addGoal, updateGoal, deleteGoal, addContribution } = useFinanceStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isContributionOpen, setIsContributionOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [expandedGoals, setExpandedGoals] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    monthlyContribution: '',
    expectedReturn: '8'
  });

  const resetForm = () => {
    setFormData({
      name: '',
      targetAmount: '',
      currentAmount: '',
      deadline: '',
      monthlyContribution: '',
      expectedReturn: '8'
    });
    setEditingGoal(null);
  };

  const calculateRequiredMonthly = (targetAmount: number, currentAmount: number, deadline: string, expectedReturn: number) => {
    const deadlineDate = new Date(deadline);
    const currentDate = new Date();
    const monthsLeft = Math.max(1, Math.round((deadlineDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));
    
    const monthlyRate = expectedReturn / 100 / 12;
    const remaining = targetAmount - currentAmount;
    
    if (monthlyRate === 0) {
      return remaining / monthsLeft;
    }
    
    // Fórmula para calcular pagamento mensal necessário
    const payment = remaining / (((Math.pow(1 + monthlyRate, monthsLeft) - 1) / monthlyRate));
    return Math.max(0, payment);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.targetAmount || !formData.deadline) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    const targetAmount = parseFloat(formData.targetAmount);
    const currentAmount = parseFloat(formData.currentAmount) || 0;
    const expectedReturn = parseFloat(formData.expectedReturn) || 0;
    
    const calculatedMonthly = formData.monthlyContribution 
      ? parseFloat(formData.monthlyContribution)
      : calculateRequiredMonthly(targetAmount, currentAmount, formData.deadline, expectedReturn);

    const goalData = {
      name: formData.name,
      targetAmount,
      currentAmount,
      deadline: formData.deadline,
      monthlyContribution: calculatedMonthly,
      expectedReturn
    };

    if (editingGoal) {
      updateGoal(editingGoal.id, goalData);
      toast.success('Meta atualizada com sucesso!');
    } else {
      addGoal(goalData);
      toast.success('Meta criada com sucesso!');
    }

    resetForm();
    setIsOpen(false);
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      deadline: goal.deadline,
      monthlyContribution: goal.monthlyContribution.toString(),
      expectedReturn: goal.expectedReturn.toString()
    });
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteGoal(id);
    toast.success('Meta removida com sucesso!');
  };

  const getGoalStatus = (goal: Goal) => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    const deadlineDate = new Date(goal.deadline);
    const currentDate = new Date();
    const daysLeft = Math.ceil((deadlineDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (progress >= 100) return { status: 'completed', color: 'success', text: 'Concluída' };
    if (daysLeft < 0) return { status: 'overdue', color: 'danger', text: 'Vencida' };
    if (daysLeft <= 30) return { status: 'urgent', color: 'warning', text: 'Urgente' };
    return { status: 'active', color: 'primary', text: 'Em andamento' };
  };

  const totalGoalsValue = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalCurrentValue = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalProgress = totalGoalsValue > 0 ? (totalCurrentValue / totalGoalsValue) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Metas Financeiras</h1>
          <p className="text-muted-foreground">
            Defina e acompanhe seus objetivos financeiros
          </p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-gradient-primary hover:opacity-90"
              onClick={resetForm}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingGoal ? 'Editar Meta' : 'Nova Meta'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Meta</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Casa própria, Viagem..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target">Valor da Meta (R$)</Label>
                  <Input
                    id="target"
                    type="number"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
                    placeholder="100.000"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="current">Valor Atual (R$)</Label>
                  <Input
                    id="current"
                    type="number"
                    value={formData.currentAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentAmount: e.target.value }))}
                    placeholder="10.000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="deadline">Prazo</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="return">Rentabilidade Anual (%)</Label>
                  <Input
                    id="return"
                    type="number"
                    step="0.1"
                    value={formData.expectedReturn}
                    onChange={(e) => setFormData(prev => ({ ...prev, expectedReturn: e.target.value }))}
                    placeholder="8.0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="monthly">Aporte Mensal (R$) - Opcional</Label>
                <Input
                  id="monthly"
                  type="number"
                  value={formData.monthlyContribution}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthlyContribution: e.target.value }))}
                  placeholder="Será calculado automaticamente"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Se não informado, será calculado o valor necessário para atingir a meta
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-gradient-primary">
                  {editingGoal ? 'Salvar' : 'Criar Meta'}
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
                <FlagIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Metas</p>
                <p className="text-2xl font-bold text-foreground">{goals.length}</p>
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
                <p className="text-sm text-muted-foreground">Valor Total das Metas</p>
                <p className="text-xl font-bold text-foreground">
                  {totalGoalsValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <ChartBarIcon className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Acumulado</p>
                <p className="text-xl font-bold text-success">
                  {totalCurrentValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Progresso Geral</p>
                <p className="text-2xl font-bold text-primary">{totalProgress.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <div className="space-y-6">
        {goals.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="py-12 text-center">
              <FlagIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma meta criada</h3>
              <p className="text-muted-foreground mb-6">
                Comece definindo seus objetivos financeiros para um futuro mais próspero
              </p>
              <Button 
                onClick={() => setIsOpen(true)}
                className="bg-gradient-primary"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Criar Primeira Meta
              </Button>
            </CardContent>
          </Card>
        ) : (
          goals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const { status, color, text } = getGoalStatus(goal);
            const deadlineDate = new Date(goal.deadline);
            const currentDate = new Date();
            const monthsLeft = Math.max(0, Math.round((deadlineDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));
            const remaining = goal.targetAmount - goal.currentAmount;

            return (
              <Card key={goal.id} className="shadow-soft">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FlagIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{goal.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={color === 'success' ? 'default' : 'secondary'} className="text-xs">
                            {text}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {deadlineDate.toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setSelectedGoal(goal);
                          setIsContributionOpen(true);
                        }}
                      >
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(goal)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(goal.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={Math.min(progress, 100)} className="h-2" />
                    </div>

                    {/* Financial Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border/50">
                      <div>
                        <p className="text-xs text-muted-foreground">Valor Atual</p>
                        <p className="font-medium text-foreground">
                          {goal.currentAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Meta</p>
                        <p className="font-medium text-foreground">
                          {goal.targetAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Falta</p>
                        <p className="font-medium text-warning">
                          {remaining.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Aporte Mensal</p>
                        <p className="font-medium text-primary">
                          {goal.monthlyContribution.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                    </div>

                    {/* Timeline Info */}
                    <div className="bg-accent/30 rounded-lg p-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">
                          {monthsLeft > 0 ? `Restam ${monthsLeft} meses` : 'Meta vencida'}
                        </span>
                        <span className="text-muted-foreground">
                          Rentabilidade: {goal.expectedReturn}% a.a.
                        </span>
                      </div>
                      {monthsLeft > 0 && remaining > 0 && (
                        <div className="mt-2 text-xs">
                          <p className="text-muted-foreground">
                            Com o aporte atual, você precisará de{' '}
                            <span className="font-medium text-foreground">
                              {Math.ceil(remaining / goal.monthlyContribution)} meses
                            </span>{' '}
                            para atingir a meta
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Contributions History */}
                    {goal.contributions && goal.contributions.length > 0 && (
                      <div className="pt-4 border-t border-border/50">
                        <button
                          className="flex justify-between items-center w-full"
                          onClick={() =>
                            setExpandedGoals((prev) => ({
                              ...prev,
                              [goal.id]: !prev[goal.id],
                            }))
                          }
                        >
                          <h4 className="text-sm font-medium">Histórico de Aportes</h4>
                          <ChevronDownIcon
                            className={`h-4 w-4 transition-transform ${
                              expandedGoals[goal.id] ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        {expandedGoals[goal.id] && (
                          <ul className="space-y-2 mt-2">
                            {goal.contributions.map((c) => (
                              <li key={c.id} className="flex justify-between items-center text-sm">
                                <span>{new Date(c.date).toLocaleDateString('pt-BR')}</span>
                                <span className="font-medium text-success">
                                  {c.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Contribution Dialog */}
      <Dialog open={isContributionOpen} onOpenChange={setIsContributionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Aporte</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Meta: <span className="font-medium">{selectedGoal?.name}</span>
            </p>
            <div>
              <Label htmlFor="contribution">Valor do Aporte (R$)</Label>
              <Input
                id="contribution"
                type="number"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
                placeholder="100.00"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => {
                  if (selectedGoal && contributionAmount) {
                    addContribution(selectedGoal.id, parseFloat(contributionAmount));
                    toast.success('Aporte adicionado com sucesso!');
                    setContributionAmount('');
                    setIsContributionOpen(false);
                  } else {
                    toast.error('O valor do aporte não pode estar vazio.');
                  }
                }}
                className="flex-1"
              >
                Salvar Aporte
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsContributionOpen(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}