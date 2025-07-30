import React, { useState } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { SimpleChart } from '@/components/ui/simple-chart';
import { ChartBarIcon, CurrencyDollarIcon, CalendarIcon } from '@heroicons/react/24/outline';

export default function Planejamento() {
  const { investments, addInvestment } = useFinanceStore();
  
  const [simulation, setSimulation] = useState({
    initialAmount: '10000',
    monthlyContribution: '1000',
    period: '60', // months
    expectedReturn: '10.5',
    compoundInterest: true,
    inflation: '4.5'
  });

  const calculateProjection = () => {
    const initial = parseFloat(simulation.initialAmount) || 0;
    const monthly = parseFloat(simulation.monthlyContribution) || 0;
    const periods = parseInt(simulation.period) || 1;
    const rate = (parseFloat(simulation.expectedReturn) || 0) / 100 / 12; // monthly rate
    const inflationRate = (parseFloat(simulation.inflation) || 0) / 100 / 12;

    const projectionData = [];
    let currentValue = initial;
    
    for (let month = 0; month <= periods; month++) {
      if (month > 0) {
        if (simulation.compoundInterest) {
          currentValue = (currentValue + monthly) * (1 + rate);
        } else {
          currentValue = currentValue + monthly + (initial * rate);
        }
      }
      
      // Ajuste pela inflação (valor real)
      const realValue = currentValue / Math.pow(1 + inflationRate, month);
      
      projectionData.push({
        name: `${month}m`,
        value: Math.round(currentValue),
        nominal: Math.round(currentValue),
        real: Math.round(realValue),
        month
      });
    }
    
    return projectionData;
  };

  const projectionData = calculateProjection();
  const finalValue = projectionData[projectionData.length - 1];
  const totalContributed = parseFloat(simulation.initialAmount) + (parseFloat(simulation.monthlyContribution) * parseInt(simulation.period));
  const totalReturn = finalValue.nominal - totalContributed;
  const returnPercentage = ((totalReturn / totalContributed) * 100);

  const saveInvestment = () => {
    addInvestment({
      name: `Planejamento ${new Date().toLocaleDateString('pt-BR')}`,
      initialAmount: parseFloat(simulation.initialAmount),
      monthlyContribution: parseFloat(simulation.monthlyContribution),
      expectedReturn: parseFloat(simulation.expectedReturn),
      period: parseInt(simulation.period),
      compoundInterest: simulation.compoundInterest,
      inflation: parseFloat(simulation.inflation)
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Planejamento Financeiro</h1>
        <p className="text-muted-foreground">
          Simule o crescimento do seu patrimônio com aportes regulares
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Simulation Form */}
        <div className="lg:col-span-1">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CurrencyDollarIcon className="h-5 w-5 text-primary" />
                Parâmetros da Simulação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="initial">Valor Inicial (R$)</Label>
                <Input
                  id="initial"
                  type="number"
                  value={simulation.initialAmount}
                  onChange={(e) => setSimulation(prev => ({ ...prev, initialAmount: e.target.value }))}
                  placeholder="10.000"
                />
              </div>

              <div>
                <Label htmlFor="monthly">Aporte Mensal (R$)</Label>
                <Input
                  id="monthly"
                  type="number"
                  value={simulation.monthlyContribution}
                  onChange={(e) => setSimulation(prev => ({ ...prev, monthlyContribution: e.target.value }))}
                  placeholder="1.000"
                />
              </div>

              <div>
                <Label htmlFor="period">Prazo (meses)</Label>
                <Input
                  id="period"
                  type="number"
                  value={simulation.period}
                  onChange={(e) => setSimulation(prev => ({ ...prev, period: e.target.value }))}
                  placeholder="60"
                />
              </div>

              <div>
                <Label htmlFor="return">Rentabilidade Anual (%)</Label>
                <Input
                  id="return"
                  type="number"
                  step="0.1"
                  value={simulation.expectedReturn}
                  onChange={(e) => setSimulation(prev => ({ ...prev, expectedReturn: e.target.value }))}
                  placeholder="10.5"
                />
              </div>

              <div>
                <Label htmlFor="inflation">Inflação Anual (%)</Label>
                <Input
                  id="inflation"
                  type="number"
                  step="0.1"
                  value={simulation.inflation}
                  onChange={(e) => setSimulation(prev => ({ ...prev, inflation: e.target.value }))}
                  placeholder="4.5"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="compound"
                  checked={simulation.compoundInterest}
                  onCheckedChange={(checked) => 
                    setSimulation(prev => ({ ...prev, compoundInterest: checked }))
                  }
                />
                <Label htmlFor="compound">Juros Compostos</Label>
              </div>

              <div className="space-y-2">
                <Button 
                  onClick={saveInvestment}
                  className="w-full bg-gradient-primary"
                >
                  Salvar Planejamento
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Salve esta simulação nos seus investimentos
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Benchmark Info */}
          <Card className="shadow-soft mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Referências do Mercado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">CDI (2024):</span>
                <span className="font-medium">10.75%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">SELIC:</span>
                <span className="font-medium">10.75%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IPCA (Meta):</span>
                <span className="font-medium">3.0%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Poupança:</span>
                <span className="font-medium">~7.5%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results and Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-soft">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Valor Final</p>
                  <p className="text-xl font-bold text-success">
                    {finalValue.nominal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Investido</p>
                  <p className="text-xl font-bold text-primary">
                    {totalContributed.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Rendimento</p>
                  <p className="text-xl font-bold text-warning">
                    {totalReturn.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Rentabilidade</p>
                  <p className="text-xl font-bold text-success">
                    {returnPercentage.toFixed(1)}%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Projection Chart */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartBarIcon className="h-5 w-5 text-primary" />
                Projeção de Crescimento Patrimonial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleChart
                data={projectionData.filter((_, index) => index % Math.ceil(projectionData.length / 20) === 0)}
                type="area"
                height={400}
                dataKey="nominal"
                colors={['hsl(var(--primary))', 'hsl(var(--success))']}
              />
            </CardContent>
          </Card>

          {/* Detailed Table */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Evolução Detalhada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2">Período</th>
                      <th className="text-right p-2">Valor Nominal</th>
                      <th className="text-right p-2">Valor Real*</th>
                      <th className="text-right p-2">Rendimento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectionData
                      .filter((_, index) => index % Math.ceil(projectionData.length / 10) === 0)
                      .map((item, index) => {
                        const contribution = parseFloat(simulation.initialAmount) + (parseFloat(simulation.monthlyContribution) * item.month);
                        const earnings = item.nominal - contribution;
                        return (
                          <tr key={index} className="border-b border-border/50">
                            <td className="p-2">{item.month} meses</td>
                            <td className="text-right p-2 font-medium">
                              {item.nominal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                            <td className="text-right p-2 text-muted-foreground">
                              {item.real.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                            <td className="text-right p-2 text-success">
                              {earnings.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                * Valor real: ajustado pela inflação de {simulation.inflation}% ao ano
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Saved Investments */}
      {investments.length > 0 && (
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Planejamentos Salvos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {investments.map((investment) => (
                <div key={investment.id} className="p-4 bg-accent/30 rounded-lg border border-border/50">
                  <h3 className="font-medium text-foreground mb-2">{investment.name}</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Inicial: {investment.initialAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    <p>Mensal: {investment.monthlyContribution.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    <p>Prazo: {investment.period} meses</p>
                    <p>Rentabilidade: {investment.expectedReturn}% a.a.</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}