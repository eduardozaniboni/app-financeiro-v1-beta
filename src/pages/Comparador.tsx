import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SimpleChart } from '@/components/ui/simple-chart';
import { 
  CreditCardIcon, 
  BanknotesIcon, 
  CalculatorIcon,
  ArrowTrendingUpIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface ComparisonResult {
  cashPayment: {
    totalPaid: number;
    discount: number;
    finalAmount: number;
  };
  installmentPayment: {
    totalPaid: number;
    totalInterest: number;
    monthlyPayment: number;
  };
  investment: {
    totalInvested: number;
    totalReturn: number;
    finalAmount: number;
    monthlyEarnings: number;
  };
  recommendation: 'cash' | 'installment';
  savings: number;
}

export default function Comparador() {
  const [formData, setFormData] = useState({
    fullPrice: '5000',
    cashDiscount: '10',
    installmentValue: '500',
    installmentCount: '12',
    investmentReturn: '10.5'
  });

  const [result, setResult] = useState<ComparisonResult | null>(null);

  const calculateComparison = () => {
    const fullPrice = parseFloat(formData.fullPrice) || 0;
    const discount = parseFloat(formData.cashDiscount) || 0;
    const installmentValue = parseFloat(formData.installmentValue) || 0;
    const installmentCount = parseInt(formData.installmentCount) || 1;
    const monthlyReturn = (parseFloat(formData.investmentReturn) || 0) / 100 / 12;

    // Pagamento à vista
    const discountAmount = (fullPrice * discount) / 100;
    const cashFinalAmount = fullPrice - discountAmount;

    // Pagamento parcelado
    const installmentTotal = installmentValue * installmentCount;
    const installmentInterest = installmentTotal - fullPrice;

    // Simulação de investimento (se pagar à vista, investe a diferença das parcelas)
    let investmentTotal = 0;
    let currentInvestment = cashFinalAmount; // Valor inicial investido

    for (let month = 1; month <= installmentCount; month++) {
      // Rendimento do valor já investido
      currentInvestment = currentInvestment * (1 + monthlyReturn);
      
      // Adiciona o valor que seria pago na parcela como novo aporte
      if (month < installmentCount) {
        currentInvestment += installmentValue;
      }
    }

    const investmentReturn = currentInvestment - cashFinalAmount - (installmentValue * (installmentCount - 1));
    const monthlyEarnings = investmentReturn / installmentCount;

    const savings = installmentTotal - currentInvestment;
    const recommendation = currentInvestment > installmentTotal ? 'cash' : 'installment';

    const calculationResult: ComparisonResult = {
      cashPayment: {
        totalPaid: cashFinalAmount,
        discount: discountAmount,
        finalAmount: cashFinalAmount
      },
      installmentPayment: {
        totalPaid: installmentTotal,
        totalInterest: installmentInterest,
        monthlyPayment: installmentValue
      },
      investment: {
        totalInvested: cashFinalAmount + (installmentValue * (installmentCount - 1)),
        totalReturn: investmentReturn,
        finalAmount: currentInvestment,
        monthlyEarnings
      },
      recommendation,
      savings: Math.abs(savings)
    };

    setResult(calculationResult);
  };

  const generateChartData = () => {
    if (!result) return [];

    const data = [];
    const installmentCount = parseInt(formData.installmentCount) || 1;
    const installmentValue = parseFloat(formData.installmentValue) || 0;
    const monthlyReturn = (parseFloat(formData.investmentReturn) || 0) / 100 / 12;
    
    let investmentValue = result.cashPayment.finalAmount;
    let installmentPaid = 0;

    for (let month = 0; month <= installmentCount; month++) {
      if (month > 0) {
        // Investimento cresce
        investmentValue = investmentValue * (1 + monthlyReturn);
        if (month < installmentCount) {
          investmentValue += installmentValue;
        }
        
        // Parcelamento acumula
        installmentPaid += installmentValue;
      } else {
        installmentPaid = 0;
        investmentValue = result.cashPayment.finalAmount;
      }

      data.push({
        name: `${month}m`,
        investimento: Math.round(investmentValue),
        parcelamento: Math.round(installmentPaid),
        month
      });
    }

    return data;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">À Vista vs Parcelado</h1>
        <p className="text-muted-foreground">
          Compare cenários e descubra a melhor forma de pagar suas compras
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulário de Simulação */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalculatorIcon className="h-5 w-5 text-primary" />
              Parâmetros da Simulação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="fullPrice">Valor Total do Produto (R$)</Label>
              <Input
                id="fullPrice"
                type="number"
                value={formData.fullPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, fullPrice: e.target.value }))}
                placeholder="5.000"
              />
            </div>

            <div>
              <Label htmlFor="cashDiscount">Desconto à Vista (%)</Label>
              <Input
                id="cashDiscount"
                type="number"
                step="0.1"
                value={formData.cashDiscount}
                onChange={(e) => setFormData(prev => ({ ...prev, cashDiscount: e.target.value }))}
                placeholder="10"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="installmentValue">Valor da Parcela (R$)</Label>
                <Input
                  id="installmentValue"
                  type="number"
                  value={formData.installmentValue}
                  onChange={(e) => setFormData(prev => ({ ...prev, installmentValue: e.target.value }))}
                  placeholder="500"
                />
              </div>
              <div>
                <Label htmlFor="installmentCount">Número de Parcelas</Label>
                <Input
                  id="installmentCount"
                  type="number"
                  value={formData.installmentCount}
                  onChange={(e) => setFormData(prev => ({ ...prev, installmentCount: e.target.value }))}
                  placeholder="12"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="investmentReturn">Rentabilidade do Investimento (% a.a.)</Label>
              <Input
                id="investmentReturn"
                type="number"
                step="0.1"
                value={formData.investmentReturn}
                onChange={(e) => setFormData(prev => ({ ...prev, investmentReturn: e.target.value }))}
                placeholder="10.5"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Rentabilidade se você investir o valor à vista
              </p>
            </div>

            <Button 
              onClick={calculateComparison}
              className="w-full bg-gradient-primary"
            >
              <CalculatorIcon className="h-4 w-4 mr-2" />
              Calcular Comparação
            </Button>
          </CardContent>
        </Card>

        {/* Resultado da Comparação */}
        {result && (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowTrendingUpIcon className="h-5 w-5 text-primary" />
                Resultado da Análise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Recomendação */}
              <Alert className={`border-2 ${result.recommendation === 'cash' ? 'border-success bg-success/5' : 'border-warning bg-warning/5'}`}>
                <InformationCircleIcon className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Recomendação: </strong>
                  {result.recommendation === 'cash' 
                    ? 'Pague à vista e invista a diferença das parcelas!' 
                    : 'Pague parcelado e use seu dinheiro para outras oportunidades!'
                  }
                  <br />
                  <span className="text-xs">
                    Economia de <strong>{result.savings.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                  </span>
                </AlertDescription>
              </Alert>

              {/* Comparação de Valores */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-accent/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <BanknotesIcon className="h-5 w-5 text-success" />
                    <span className="font-medium text-success">À Vista</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Valor pago:</span>
                      <span className="font-medium">
                        {result.cashPayment.totalPaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Desconto:</span>
                      <span className="font-medium text-success">
                        -{result.cashPayment.discount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-accent/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCardIcon className="h-5 w-5 text-warning" />
                    <span className="font-medium text-warning">Parcelado</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total pago:</span>
                      <span className="font-medium">
                        {result.installmentPayment.totalPaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Juros:</span>
                      <span className="font-medium text-danger">
                        +{result.installmentPayment.totalInterest.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Simulação de Investimento */}
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="font-medium text-primary mb-3">Simulação de Investimento</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor investido:</span>
                    <span className="font-medium">
                      {result.investment.totalInvested.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rendimento:</span>
                    <span className="font-medium text-success">
                      +{result.investment.totalReturn.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor final:</span>
                    <span className="font-bold text-primary">
                      {result.investment.finalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Badge de Status */}
              <div className="text-center">
                <Badge 
                  variant={result.recommendation === 'cash' ? 'default' : 'secondary'}
                  className="text-sm py-1 px-3"
                >
                  {result.recommendation === 'cash' ? '✅ À vista é melhor!' : '💳 Parcelado é melhor!'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Gráfico de Evolução */}
      {result && (
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Evolução dos Cenários</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleChart
              data={generateChartData()}
              type="line"
              height={300}
              dataKey="investimento"
              secondaryDataKey="parcelamento"
              colors={['hsl(var(--primary))', 'hsl(var(--warning))']}
            />
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded"></div>
                <span>Investimento (À vista + aportes)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-warning rounded"></div>
                <span>Parcelamento (Acumulado pago)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}