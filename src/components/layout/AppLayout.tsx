import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import UserMenu from './UserMenu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Bars3Icon, 
  XMarkIcon,
  HomeIcon,
  CreditCardIcon,
  ChartBarIcon,
  FlagIcon,
  ScaleIcon,
  ChatBubbleLeftRightIcon,
  BanknotesIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Transações', href: '/transacoes', icon: CreditCardIcon },
  { name: 'Planejamento', href: '/planejamento', icon: ChartBarIcon },
  { name: 'Metas', href: '/metas', icon: FlagIcon },
  { name: 'À Vista vs Parcelado', href: '/comparador', icon: ScaleIcon },
  { name: 'Chatbot IA', href: '/chatbot', icon: ChatBubbleLeftRightIcon },
  { name: 'Ativos', href: '/ativos', icon: BanknotesIcon },
  { name: 'Parcelamentos', href: '/parcelamentos', icon: DocumentTextIcon },
];

function SidebarContent({ onItemClick }: { onItemClick?: () => void }) {
  const location = useLocation();

  return (
    <div className="flex h-full flex-col bg-gradient-sidebar border-r border-border/50">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <BanknotesIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">FinanceIA</h1>
            <p className="text-xs text-muted-foreground">Gestão Inteligente</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onItemClick}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-soft'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border/50">
        <div className="text-xs text-muted-foreground">
          <p>Versão 1.0 MVP</p>
          <p className="mt-1">Dados salvos localmente</p>
        </div>
      </div>
    </div>
  );
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden fixed top-4 left-4 z-50 bg-card shadow-medium"
          >
            <Bars3Icon className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent onItemClick={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Header */}
        <header className="h-16 border-b border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="flex h-full items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <div className="lg:hidden w-10" /> {/* Spacer for mobile menu button */}
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Gestão Financeira Inteligente
                </h2>
                <p className="text-sm text-muted-foreground">
                  Controle suas finanças com inteligência artificial
                </p>
              </div>
            </div>
            
            <UserMenu />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}