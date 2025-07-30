import React, { useState, useRef, useEffect } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  MicrophoneIcon,
  PhotoIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CalendarIcon,
  UserIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  category?: 'transaction' | 'query' | 'suggestion' | 'analysis';
}

export default function Chatbot() {
  const { 
    transactions, 
    addTransaction, 
    getTotalBalance, 
    getMonthlyIncome, 
    getMonthlyExpenses,
    goals,
    assets,
    getAssetsValue
  } = useFinanceStore();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: '👋 Olá! Sou seu assistente financeiro inteligente. Posso ajudar você a:\n\n• Registrar gastos e receitas\n• Consultar seu saldo e resumos\n• Analisar seus hábitos financeiros\n• Dar sugestões de economia\n\nComo posso ajudar hoje?',
      timestamp: new Date(),
      category: 'suggestion'
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const processMessage = async (message: string) => {
    setIsProcessing(true);
    
    // Simulação de processamento de IA
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response = generateAIResponse(message.toLowerCase());
    
    const aiMessage: Message = {
      id: Date.now().toString() + '_ai',
      type: 'ai',
      content: response.content,
      timestamp: new Date(),
      category: response.category
    };
    
    setMessages(prev => [...prev, aiMessage]);
    setIsProcessing(false);
  };

  const generateAIResponse = (message: string): { content: string; category: Message['category'] } => {
    // Padrões para detectar transações
    const expensePatterns = [
      /gastei (r\$\s?)?(\d+(?:,\d{2})?)\s*(.*)/i,
      /paguei (r\$\s?)?(\d+(?:,\d{2})?)\s*(.*)/i,
      /comprei\s*(.*?)\s*por\s*(r\$\s?)?(\d+(?:,\d{2})?)/i,
      /despesa\s*de\s*(r\$\s?)?(\d+(?:,\d{2})?)\s*(.*)/i
    ];

    const incomePatterns = [
      /recebi (r\$\s?)?(\d+(?:,\d{2})?)\s*(.*)/i,
      /ganhei (r\$\s?)?(\d+(?:,\d{2})?)\s*(.*)/i,
      /renda\s*de\s*(r\$\s?)?(\d+(?:,\d{2})?)\s*(.*)/i
    ];

    // Detectar transações de gastos
    for (const pattern of expensePatterns) {
      const match = message.match(pattern);
      if (match) {
        const amount = parseFloat(match[2].replace(',', '.'));
        const description = match[3] || match[1] || 'Gasto registrado';
        
        addTransaction({
          type: 'expense',
          amount,
          description: description.trim(),
          category: categorizeExpense(description),
          date: new Date().toISOString().split('T')[0]
        });

        return {
          content: `✅ Gasto registrado com sucesso!\n\n💰 Valor: ${amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n📝 Descrição: ${description}\n📁 Categoria: ${categorizeExpense(description)}\n\nSeu saldo atual é ${getTotalBalance().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
          category: 'transaction'
        };
      }
    }

    // Detectar transações de receitas
    for (const pattern of incomePatterns) {
      const match = message.match(pattern);
      if (match) {
        const amount = parseFloat(match[2].replace(',', '.'));
        const description = match[3] || match[1] || 'Receita registrada';
        
        addTransaction({
          type: 'income',
          amount,
          description: description.trim(),
          category: 'Receita',
          date: new Date().toISOString().split('T')[0]
        });

        return {
          content: `✅ Receita registrada com sucesso!\n\n💰 Valor: ${amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n📝 Descrição: ${description}\n\nSeu saldo atual é ${getTotalBalance().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
          category: 'transaction'
        };
      }
    }

    // Consultas sobre saldo e resumos
    if (message.includes('saldo') || message.includes('quanto tenho')) {
      const balance = getTotalBalance();
      const monthlyIncome = getMonthlyIncome();
      const monthlyExpenses = getMonthlyExpenses();
      
      return {
        content: `💰 **Resumo Financeiro Atual**\n\n• **Saldo total:** ${balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n• **Receitas este mês:** ${monthlyIncome.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n• **Gastos este mês:** ${monthlyExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n• **Sobra mensal:** ${(monthlyIncome - monthlyExpenses).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
        category: 'query'
      };
    }

    if (message.includes('resumo') || message.includes('relatório')) {
      const totalTransactions = transactions.length;
      const totalAssets = getAssetsValue();
      const totalGoals = goals.length;
      
      return {
        content: `📊 **Resumo Completo**\n\n**Finanças:**\n• ${totalTransactions} transações registradas\n• Saldo: ${getTotalBalance().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n• Patrimônio em ativos: ${totalAssets.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n\n**Planejamento:**\n• ${totalGoals} metas ativas\n• ${goals.filter(g => (g.currentAmount / g.targetAmount) >= 1).length} metas concluídas\n\n**Tendência:** ${getMonthlyIncome() > getMonthlyExpenses() ? '📈 Positiva' : '📉 Atenção aos gastos'}`,
        category: 'analysis'
      };
    }

    if (message.includes('gastos') || message.includes('despesas')) {
      const monthlyExpenses = getMonthlyExpenses();
      const expensesByCategory = transactions
        .filter(t => t.type === 'expense' && t.date.startsWith(new Date().toISOString().substring(0, 7)))
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        }, {} as Record<string, number>);

      const categoryList = Object.entries(expensesByCategory)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([category, amount]) => `• ${category}: ${amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`)
        .join('\n');

      return {
        content: `💸 **Gastos deste mês: ${monthlyExpenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}**\n\n**Top categorias:**\n${categoryList}\n\n💡 **Dica:** Monitore as categorias com maiores gastos para identificar oportunidades de economia!`,
        category: 'analysis'
      };
    }

    if (message.includes('dica') || message.includes('sugestão') || message.includes('economia')) {
      const suggestions = [
        '💡 **Dica de Economia:** Use a regra 50-30-20: 50% para necessidades, 30% desejos, 20% poupança.',
        '🎯 **Estratégia:** Defina metas específicas para seus objetivos financeiros - isso aumenta em 60% as chances de sucesso!',
        '📊 **Análise:** Revise seus gastos mensalmente e identifique padrões. Pequenos ajustes podem gerar grandes economias.',
        '🔄 **Hábito:** Automatize suas poupanças - configure transferências automáticas para sua reserva de emergência.',
        '📱 **Tecnologia:** Use apps como este para registrar gastos em tempo real. O controle visual melhora muito a gestão!',
        '💰 **Investimento:** Antes de comprar algo, pergunte: "Este valor investido poderia me render mais no futuro?"'
      ];
      
      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      return {
        content: randomSuggestion,
        category: 'suggestion'
      };
    }

    if (message.includes('metas') || message.includes('objetivos')) {
      const activeGoals = goals.length;
      const completedGoals = goals.filter(g => (g.currentAmount / g.targetAmount) >= 1).length;
      const totalGoalsValue = goals.reduce((sum, g) => sum + g.targetAmount, 0);
      
      return {
        content: `🎯 **Suas Metas Financeiras**\n\n• **Total de metas:** ${activeGoals}\n• **Metas concluídas:** ${completedGoals}\n• **Valor total das metas:** ${totalGoalsValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n\n${activeGoals > 0 ? '✨ Continue firme! Metas claras são o primeiro passo para o sucesso financeiro.' : '💡 Que tal definir sua primeira meta? Comece com algo alcançável em 6 meses!'}`,
        category: 'analysis'
      };
    }

    // Resposta padrão inteligente
    const defaultResponses = [
      '🤔 Não entendi completamente sua mensagem. Posso ajudar você a:\n\n• Registrar gastos (Ex: "Gastei R$ 50 no supermercado")\n• Consultar saldo ("Qual meu saldo?")\n• Ver resumos ("Mostrar resumo")\n• Dicas de economia ("Dê uma dica")\n\nTente reformular sua pergunta!',
      '💭 Hmm, não consegui processar isso. Algumas sugestões:\n\n• "Paguei R$ 100 na farmácia"\n• "Recebi R$ 500 de freelance"\n• "Como estão meus gastos?"\n• "Preciso de uma sugestão"\n\nO que você gostaria de fazer?',
      '🔍 Não identifiquei um comando específico. Posso te ajudar com:\n\n✅ Registrar transações\n✅ Consultar informações financeiras\n✅ Análises e relatórios\n✅ Dicas personalizadas\n\nComo posso ser útil?'
    ];

    return {
      content: defaultResponses[Math.floor(Math.random() * defaultResponses.length)],
      category: 'suggestion'
    };
  };

  const categorizeExpense = (description: string): string => {
    const categories = {
      'Alimentação': ['supermercado', 'restaurante', 'lanche', 'comida', 'almoço', 'jantar', 'café'],
      'Transporte': ['uber', 'taxi', 'ônibus', 'metro', 'gasolina', 'combustível', 'estacionamento'],
      'Moradia': ['aluguel', 'luz', 'água', 'gás', 'internet', 'condomínio'],
      'Saúde': ['farmácia', 'médico', 'consulta', 'exame', 'dentista', 'hospital'],
      'Educação': ['curso', 'livro', 'escola', 'faculdade', 'material'],
      'Lazer': ['cinema', 'teatro', 'show', 'viagem', 'parque', 'diversão'],
      'Compras': ['roupa', 'sapato', 'presente', 'eletrônico', 'casa'],
      'Tecnologia': ['celular', 'computador', 'software', 'app', 'streaming']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => description.toLowerCase().includes(keyword))) {
        return category;
      }
    }

    return 'Outros';
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToProcess = inputMessage;
    setInputMessage('');

    await processMessage(messageToProcess);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const simulateVoiceInput = () => {
    const voiceExamples = [
      'Gastei R$ 45 no posto de gasolina hoje',
      'Paguei R$ 120 no supermercado',
      'Recebi R$ 800 de freelance',
      'Qual meu saldo atual?',
      'Como estão meus gastos este mês?'
    ];
    
    const randomExample = voiceExamples[Math.floor(Math.random() * voiceExamples.length)];
    setInputMessage(randomExample);
    toast.success('🎤 Áudio transcrito com sucesso!');
  };

  const simulateImageInput = () => {
    const imageExamples = [
      'Gastei R$ 89,90 no Supermercado Extra',
      'Paguei R$ 156,78 na farmácia Drogasil',
      'Almoço no restaurante - R$ 34,50',
      'Uber para o aeroporto - R$ 67,20'
    ];
    
    const randomExample = imageExamples[Math.floor(Math.random() * imageExamples.length)];
    setInputMessage(randomExample);
    toast.success('📷 Imagem processada e texto extraído!');
  };

  const quickCommands = [
    { text: 'Ver meu saldo', icon: CurrencyDollarIcon },
    { text: 'Resumo financeiro', icon: ChartBarIcon },
    { text: 'Gastos do mês', icon: CalendarIcon },
    { text: 'Dê uma dica', icon: CpuChipIcon }
  ];

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Assistente Financeiro IA</h1>
        <p className="text-muted-foreground">
          Converse naturalmente para controlar suas finanças
        </p>
      </div>

      {/* Chat Container */}
      <Card className="flex-1 flex flex-col shadow-soft">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="h-5 w-5 text-primary" />
            Chat Financeiro
            <Badge variant="secondary" className="ml-auto">
              Online
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Area */}
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-4 pb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-accent text-accent-foreground'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.type === 'ai' && (
                        <CpuChipIcon className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      )}
                      {message.type === 'user' && (
                        <UserIcon className="h-4 w-4 mt-0.5 text-primary-foreground flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="whitespace-pre-wrap text-sm">
                          {message.content}
                        </div>
                        <div className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-accent text-accent-foreground p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CpuChipIcon className="h-4 w-4 text-primary" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Quick Commands */}
          <div className="px-6 py-2 border-t border-border">
            <div className="flex flex-wrap gap-2">
              {quickCommands.map((command, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInputMessage(command.text)}
                  className="text-xs"
                >
                  <command.icon className="h-3 w-3 mr-1" />
                  {command.text}
                </Button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-border">
            <div className="flex gap-2">
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={simulateVoiceInput}
                  title="Simular entrada de voz"
                >
                  <MicrophoneIcon className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={simulateImageInput}
                  title="Simular OCR de imagem"
                >
                  <PhotoIcon className="h-4 w-4" />
                </Button>
              </div>
              
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem... (Ex: 'Gastei R$ 50 no supermercado')"
                className="flex-1"
                disabled={isProcessing}
              />
              
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isProcessing}
                className="bg-gradient-primary"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground mt-2">
              💡 Experimente: "Gastei R$ 50 no supermercado", "Qual meu saldo?", "Recebi R$ 200"
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}