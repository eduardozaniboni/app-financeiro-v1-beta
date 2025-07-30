import React from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SimpleChart } from '@/components/ui/simple-chart';
import { 
  BanknotesIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  ChartBarIcon,
  CreditCardIcon,
  FlagIcon
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const { 
    transactions, 
    assets, 
    goals,
    getTotalBalance, 
    getMonthlyIncome, 
    getMonthlyExpenses,
    getAssetsValue 
  } = useFinanceStore();

  const totalBalance = getTotalBalance();
  const monthlyIncome = getMonthlyIncome();
  const monthlyExpenses = getMonthlyExpenses();
  const assetsValue = getAssetsValue();
  const monthlyNet = monthlyIncome - monthlyExpenses;

  // Dados para gráficos
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const expensesChartData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value
  }));

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - (5 - i));
    return {
      name: month.toLocaleDateString('pt-BR', { month: 'short' }),
      value: Math.floor(Math.random() * 2000) + 4000,
      receitas: Math.floor(Math.random() * 2000) + 4000,
      despesas: Math.floor(Math.random() * 1500) + 2500,
      investimentos: Math.floor(Math.random() * 1000) + 1500
    };
  });

  const assetsByType = assets.reduce((acc, asset) => {
    const value = asset.quantity * asset.currentPrice;
    acc[asset.type] = (acc[asset.type] || 0) + value;
    return acc;
  }, {} as Record<string, number>);

  const assetsChartData = Object.entries(assetsByType).map(([type, value]) => ({
    name: type === 'renda-fixa' ? 'Renda Fixa' :
          type === 'renda-variavel' ? 'Renda Variável' :
          type === 'criptomoeda' ? 'Criptomoedas' : 'Fundos',
    value
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard Financeiro</h1>
        <p className="text-muted-foreground">
          Visão geral das suas finanças e investimentos
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Saldo Total"
          value={totalBalance}
          icon={BanknotesIcon}
          variant={totalBalance >= 0 ? 'success' : 'danger'}
          change={{
            value: 12.5,
            type: 'increase',
            period: 'mês anterior'
          }}
        />
        <StatCard
          title="Receitas do Mês"
          value={monthlyIncome}
          icon={ArrowUpIcon}
          variant="success"
          change={{
            value: 8.2,
            type: 'increase',
            period: 'mês anterior'
          }}
        />
        <StatCard
          title="Despesas do Mês"
          value={monthlyExpenses}
          icon={ArrowDownIcon}
          variant="warning"
          change={{
            value: 3.1,
            type: 'decrease',
            period: 'mês anterior'
          }}
        />
        <StatCard
          title="Patrimônio em Ativos"
          value={assetsValue}
          icon={ChartBarIcon}
          variant="default"
          change={{
            value: 15.8,
            type: 'increase',
            period: 'mês anterior'
          }}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução Mensal */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5 text-primary" />
              Evolução Financeira (6 meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleChart
              data={monthlyData}
              type="area"
              height={300}
              dataKey="receitas"
              colors={['hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--primary))']}
            />
          </CardContent>
        </Card>

        {/* Despesas por Categoria */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCardIcon className="h-5 w-5 text-warning" />
              Despesas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleChart
              data={expensesChartData}
              type="pie"
              height={300}
              colors={[
                'hsl(var(--primary))',
                'hsl(var(--success))',
                'hsl(var(--warning))',
                'hsl(var(--danger))',
                'hsl(var(--secondary))'
              ]}
            />
          </CardContent>
        </Card>
      </div>

      {/* Segunda linha de gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribuição de Ativos */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BanknotesIcon className="h-5 w-5 text-primary" />
              Distribuição de Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleChart
              data={assetsChartData}
              type="pie"
              height={250}
              colors={['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))']}
            />
          </CardContent>
        </Card>

        {/* Resumo Mensal */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Resumo do Mês</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Receitas:</span>
              <span className="font-medium text-success">
                {monthlyIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Despesas:</span>
              <span className="font-medium text-danger">
                {monthlyExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Resultado:</span>
                <span className={`font-bold ${monthlyNet >= 0 ? 'text-success' : 'text-danger'}`}>
                  {monthlyNet.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-accent rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Taxa de poupança</p>
              <p className="text-lg font-bold text-foreground">
                {monthlyIncome > 0 ? Math.round((monthlyNet / monthlyIncome) * 100) : 0}%
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Metas */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlagIcon className="h-5 w-5 text-primary" />
              Progresso das Metas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {goals.slice(0, 3).map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{goal.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {goal.currentAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} de{' '}
                    {goal.targetAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}