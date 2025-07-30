import React, { useState } from 'react';
import { useFinanceStore, Asset } from '@/store/useFinanceStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SimpleChart } from '@/components/ui/simple-chart';
import { 
  PlusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  ChartPieIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const assetTypeLabels = {
  'renda-fixa': 'Renda Fixa',
  'renda-variavel': 'Renda Variável',
  'criptomoeda': 'Criptomoedas',
  'fundo': 'Fundos'
};

const assetTypeColors = {
  'renda-fixa': 'hsl(var(--success))',
  'renda-variavel': 'hsl(var(--primary))',
  'criptomoeda': 'hsl(var(--warning))',
  'fundo': 'hsl(var(--muted))'
};

export default function Ativos() {
  const { assets, addAsset, updateAsset, deleteAsset } = useFinanceStore();
  const [isOpen, setIsOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [formData, setFormData] = useState({
    name: '',
    type: 'renda-fixa' as Asset['type'],
    quantity: '',
    purchasePrice: '',
    currentPrice: '',
    purchaseDate: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'renda-fixa',
      quantity: '',
      purchasePrice: '',
      currentPrice: '',
      purchaseDate: ''
    });
    setEditingAsset(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.quantity || !formData.purchasePrice || !formData.currentPrice) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const assetData = {
      name: formData.name,
      type: formData.type,
      quantity: parseFloat(formData.quantity),
      purchasePrice: parseFloat(formData.purchasePrice),
      currentPrice: parseFloat(formData.currentPrice),
      purchaseDate: formData.purchaseDate || new Date().toISOString().split('T')[0]
    };

    if (editingAsset) {
      updateAsset(editingAsset.id, assetData);
      toast.success('Ativo atualizado com sucesso!');
    } else {
      addAsset(assetData);
      toast.success('Ativo adicionado com sucesso!');
    }

    resetForm();
    setIsOpen(false);
  };

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name,
      type: asset.type,
      quantity: asset.quantity.toString(),
      purchasePrice: asset.purchasePrice.toString(),
      currentPrice: asset.currentPrice.toString(),
      purchaseDate: asset.purchaseDate
    });
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteAsset(id);
    toast.success('Ativo removido com sucesso!');
  };

  const calculateAssetReturn = (asset: Asset) => {
    const totalInvested = asset.quantity * asset.purchasePrice;
    const currentValue = asset.quantity * asset.currentPrice;
    const absoluteReturn = currentValue - totalInvested;
    const percentageReturn = ((currentValue - totalInvested) / totalInvested) * 100;
    
    return {
      totalInvested,
      currentValue,
      absoluteReturn,
      percentageReturn
    };
  };

  const getTotalPortfolioValue = () => {
    return assets.reduce((total, asset) => total + (asset.quantity * asset.currentPrice), 0);
  };

  const getTotalInvested = () => {
    return assets.reduce((total, asset) => total + (asset.quantity * asset.purchasePrice), 0);
  };

  const getPortfolioReturn = () => {
    const totalInvested = getTotalInvested();
    const currentValue = getTotalPortfolioValue();
    return {
      absolute: currentValue - totalInvested,
      percentage: totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0
    };
  };

  const getAssetsByType = () => {
    const assetsByType = assets.reduce((acc, asset) => {
      const value = asset.quantity * asset.currentPrice;
      acc[asset.type] = (acc[asset.type] || 0) + value;
      return acc;
    }, {} as Record<Asset['type'], number>);

    return Object.entries(assetsByType).map(([type, value]) => ({
      name: assetTypeLabels[type as Asset['type']],
      value: Math.round(value),
      type: type as Asset['type']
    }));
  };

  const getPerformanceData = () => {
    return assets.map(asset => {
      const returns = calculateAssetReturn(asset);
      return {
        name: asset.name.length > 15 ? asset.name.substring(0, 15) + '...' : asset.name,
        rentabilidade: Number(returns.percentageReturn.toFixed(2)),
        valor: returns.currentValue,
        tipo: asset.type
      };
    }).sort((a, b) => b.rentabilidade - a.rentabilidade);
  };

  const portfolioReturn = getPortfolioReturn();
  const distributionData = getAssetsByType();
  const performanceData = getPerformanceData();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Gestão de Ativos</h1>
          <p className="text-muted-foreground">
            Controle seus investimentos e acompanhe a rentabilidade
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
          >
            <EyeIcon className="h-4 w-4 mr-2" />
            {viewMode === 'grid' ? 'Tabela' : 'Cards'}
          </Button>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-gradient-primary hover:opacity-90"
                onClick={resetForm}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Novo Ativo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingAsset ? 'Editar Ativo' : 'Novo Ativo'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Ativo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Tesouro Selic 2029"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type">Tipo de Ativo</Label>
                  <Select value={formData.type} onValueChange={(value: Asset['type']) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="renda-fixa">Renda Fixa</SelectItem>
                      <SelectItem value="renda-variavel">Renda Variável</SelectItem>
                      <SelectItem value="criptomoeda">Criptomoedas</SelectItem>
                      <SelectItem value="fundo">Fundos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantidade</Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="0.01"
                      value={formData.quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                      placeholder="100"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="purchaseDate">Data da Compra</Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="purchasePrice">Preço de Compra (R$)</Label>
                    <Input
                      id="purchasePrice"
                      type="number"
                      step="0.01"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
                      placeholder="32.50"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="currentPrice">Preço Atual (R$)</Label>
                    <Input
                      id="currentPrice"
                      type="number"
                      step="0.01"
                      value={formData.currentPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentPrice: e.target.value }))}
                      placeholder="38.20"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1 bg-gradient-primary">
                    {editingAsset ? 'Salvar' : 'Adicionar'}
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
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BanknotesIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Patrimônio Total</p>
                <p className="text-xl font-bold text-foreground">
                  {getTotalPortfolioValue().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted/10 rounded-lg">
                <ChartPieIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Investido</p>
                <p className="text-xl font-bold text-foreground">
                  {getTotalInvested().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${portfolioReturn.absolute >= 0 ? 'bg-success/10' : 'bg-danger/10'}`}>
                {portfolioReturn.absolute >= 0 ? (
                  <ArrowTrendingUpIcon className="h-5 w-5 text-success" />
                ) : (
                  <ArrowTrendingDownIcon className="h-5 w-5 text-danger" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rentabilidade</p>
                <p className={`text-xl font-bold ${portfolioReturn.absolute >= 0 ? 'text-success' : 'text-danger'}`}>
                  {portfolioReturn.absolute.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${portfolioReturn.percentage >= 0 ? 'bg-success/10' : 'bg-danger/10'}`}>
                {portfolioReturn.percentage >= 0 ? (
                  <ArrowTrendingUpIcon className="h-5 w-5 text-success" />
                ) : (
                  <ArrowTrendingDownIcon className="h-5 w-5 text-danger" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rentabilidade %</p>
                <p className={`text-xl font-bold ${portfolioReturn.percentage >= 0 ? 'text-success' : 'text-danger'}`}>
                  {portfolioReturn.percentage.toFixed(2)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Distribution Chart */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Distribuição por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            {distributionData.length > 0 ? (
              <SimpleChart
                data={distributionData}
                type="pie"
                height={300}
                dataKey="value"
                colors={distributionData.map(d => assetTypeColors[d.type])}
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Adicione ativos para ver a distribuição
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Chart */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Ranking de Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {performanceData.length > 0 ? (
              <SimpleChart
                data={performanceData}
                type="bar"
                height={300}
                dataKey="rentabilidade"
                colors={['hsl(var(--primary))']}
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Adicione ativos para ver o ranking
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assets List */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Seus Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          {assets.length === 0 ? (
            <div className="py-12 text-center">
              <BanknotesIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Nenhum ativo cadastrado</h3>
              <p className="text-muted-foreground mb-6">
                Comece adicionando seus investimentos para acompanhar o desempenho
              </p>
              <Button 
                onClick={() => setIsOpen(true)}
                className="bg-gradient-primary"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Adicionar Primeiro Ativo
              </Button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assets.map((asset) => {
                const returns = calculateAssetReturn(asset);
                return (
                  <div key={asset.id} className="p-4 bg-accent/30 rounded-lg border border-border/50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-foreground">{asset.name}</h3>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {assetTypeLabels[asset.type]}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(asset)}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(asset.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Quantidade:</span>
                        <span className="font-medium">{asset.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Preço médio:</span>
                        <span className="font-medium">
                          {asset.purchasePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Preço atual:</span>
                        <span className="font-medium">
                          {asset.currentPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Valor investido:</span>
                        <span className="font-medium">
                          {returns.totalInvested.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Valor atual:</span>
                        <span className="font-medium">
                          {returns.currentValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rentabilidade:</span>
                        <span className={`font-bold ${returns.absoluteReturn >= 0 ? 'text-success' : 'text-danger'}`}>
                          {returns.percentageReturn.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2">Ativo</th>
                    <th className="text-right p-2">Quantidade</th>
                    <th className="text-right p-2">Preço Médio</th>
                    <th className="text-right p-2">Preço Atual</th>
                    <th className="text-right p-2">Valor Investido</th>
                    <th className="text-right p-2">Valor Atual</th>
                    <th className="text-right p-2">Rentabilidade</th>
                    <th className="text-center p-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => {
                    const returns = calculateAssetReturn(asset);
                    return (
                      <tr key={asset.id} className="border-b border-border/50">
                        <td className="p-2">
                          <div>
                            <div className="font-medium">{asset.name}</div>
                            <Badge variant="secondary" className="text-xs">
                              {assetTypeLabels[asset.type]}
                            </Badge>
                          </div>
                        </td>
                        <td className="text-right p-2">{asset.quantity}</td>
                        <td className="text-right p-2">
                          {asset.purchasePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td className="text-right p-2">
                          {asset.currentPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td className="text-right p-2">
                          {returns.totalInvested.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td className="text-right p-2 font-medium">
                          {returns.currentValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td className={`text-right p-2 font-bold ${returns.absoluteReturn >= 0 ? 'text-success' : 'text-danger'}`}>
                          {returns.percentageReturn.toFixed(2)}%
                        </td>
                        <td className="text-center p-2">
                          <div className="flex justify-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEdit(asset)}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDelete(asset.id)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}