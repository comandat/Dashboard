
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import FinancialPage from './pages/FinancialPage';
import StockPage from './pages/StockPage';
import OperationalPage from './pages/OperationalPage';
import AddExpensePage from './pages/AddExpensePage';
import { getFinancialSummary, getMonthlyData, getDeadStock, getOperationalAlerts, getRecentExpenses } from './services/api';
import { FinancialSummary, MonthlyData, Product, Order, Expense, TimePeriod } from './types';

// Define view types for our manual router
export type View = 'dashboard' | 'financial' | 'stock' | 'operational' | 'reports' | 'settings' | 'add-expense';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  // Global State for Persistence
  const [loading, setLoading] = useState(true);
  
  // Financial Data
  const [financialPeriod, setFinancialPeriod] = useState<TimePeriod>('current_month');
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Stock Data
  const [deadStock, setDeadStock] = useState<Product[]>([]);

  // Operational Data
  const [operationalOrders, setOperationalOrders] = useState<Order[]>([]);

  // Initial Load
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        const [summary, monthly, recentExpenses, stock, orders] = await Promise.all([
          getFinancialSummary(financialPeriod),
          getMonthlyData(),
          getRecentExpenses(financialPeriod),
          getDeadStock(),
          getOperationalAlerts()
        ]);

        setFinancialSummary(summary);
        setMonthlyData(monthly);
        setExpenses(recentExpenses);
        setDeadStock(stock);
        setOperationalOrders(orders);
      } catch (error) {
        console.error("Error loading data", error);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []); // Run once on mount

  // Handle Financial Period Change (Update specific data only)
  const handleFinancialPeriodChange = async (period: TimePeriod) => {
    setFinancialPeriod(period);
    // Optimistic UI or loading state for section could go here
    const [newSummary, newExpenses] = await Promise.all([
        getFinancialSummary(period),
        getRecentExpenses(period)
    ]);
    setFinancialSummary(newSummary);
    setExpenses(newExpenses);
  };

  const handleAddExpenseBack = async () => {
      // Refresh expenses when coming back from add page
      const newExpenses = await getRecentExpenses(financialPeriod);
      setExpenses(newExpenses);
      setCurrentView('financial');
  }

  const renderView = () => {
    if (loading && !financialSummary) {
        return (
            <div className="flex h-full items-center justify-center text-slate-400">
                <div className="flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
                    <p>Se încarcă datele...</p>
                </div>
            </div>
        );
    }

    switch (currentView) {
      case 'dashboard':
        return (
            <DashboardPage 
                setCurrentView={setCurrentView} 
                summary={financialSummary!} 
                chartData={monthlyData}
                operationalCount={operationalOrders.length}
            />
        );
      case 'financial':
        return (
            <FinancialPage 
                setCurrentView={setCurrentView} 
                summary={financialSummary!}
                expenses={expenses}
                monthlyData={monthlyData}
                selectedPeriod={financialPeriod}
                onPeriodChange={handleFinancialPeriodChange}
            />
        );
      case 'stock':
        return (
            <StockPage 
                deadStock={deadStock}
            />
        );
      case 'operational':
        return (
            <OperationalPage 
                orders={operationalOrders}
            />
        );
      case 'add-expense':
        return <AddExpensePage onBack={handleAddExpenseBack} />;
      default:
        return (
          <div className="flex h-full items-center justify-center text-gray-400">
            <div className="text-center">
              <span className="material-symbols-outlined text-6xl mb-4">construction</span>
              <h2 className="text-2xl font-bold">Pagina în construcție</h2>
              <p>Funcționalitatea pentru {currentView} va fi disponibilă în curând.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-900 text-white">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />

      <main className="flex-1 overflow-y-auto h-full p-6 relative">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
