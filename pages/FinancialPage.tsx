
import React from 'react';
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { Expense, FinancialSummary, MonthlyData, TimePeriod } from '../types';
import { View } from '../App';

interface FinancialPageProps {
    setCurrentView: (view: View) => void;
    summary: FinancialSummary;
    expenses: Expense[];
    monthlyData: MonthlyData[];
    selectedPeriod: TimePeriod;
    onPeriodChange: (period: TimePeriod) => void;
}

const FinancialPage: React.FC<FinancialPageProps> = ({ 
    setCurrentView, 
    summary, 
    expenses, 
    monthlyData, 
    selectedPeriod,
    onPeriodChange
}) => {
  return (
    <div className="mx-auto max-w-[1600px] w-full px-2">
      {/* Header */}
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-black tracking-tight text-white uppercase">Prezentare Financiară</h1>
          <p className="text-slate-400 text-lg">Analiza veniturilor și gestiunea detaliată a cheltuielilor operaționale.</p>
        </div>
      </header>

      {/* KPI & Expenses SECTION (Filtered) */}
      <div className="mb-10 rounded-[2rem] border border-slate-700 bg-slate-800/50 p-4 shadow-2xl overflow-hidden backdrop-blur-sm">
        {/* Filter Control Header */}
        <div className="flex flex-wrap items-center justify-between gap-6 p-6 border-b border-slate-700/50 bg-slate-800/80 rounded-t-[1.5rem]">
            <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600/10 text-primary-500 border border-primary-500/20 shadow-inner">
                    <span className="material-symbols-outlined text-3xl">calendar_today</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Sincronizare Perioadă</span>
                    <span className="text-xl font-black text-white">Scorecards & Cheltuieli</span>
                </div>
            </div>
            <div className="flex gap-3 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-700 shadow-inner">
                {[
                    { id: 'current_month', label: 'Luna Curentă' },
                    { id: 'last_month', label: 'Luna Trecută' },
                    { id: 'last_quarter', label: 'Trimestrul Trecut' }
                ].map((p) => (
                    <button 
                        key={p.id}
                        onClick={() => onPeriodChange(p.id as TimePeriod)}
                        className={`rounded-xl px-6 py-3 text-xs font-black transition-all duration-300 ${
                            selectedPeriod === p.id 
                                ? 'bg-primary-600 text-white shadow-xl shadow-primary-600/40 transform scale-105' 
                                : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                    >
                        {p.label.toUpperCase()}
                    </button>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 p-6">
            {/* Scorecards - Left 3/4 */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 content-start">
                 {[
                    { label: 'Venit Total', value: `${summary.revenue.toLocaleString('ro-RO')} RON`, change: '+5.2%', color: 'text-emerald-400', icon: 'payments' },
                    { label: 'Profit Net', value: `${summary.net_profit.toLocaleString('ro-RO')} RON`, change: '+8.1%', color: 'text-emerald-400', icon: 'trending_up' },
                    { label: 'Cheltuieli Totale', value: `${summary.expenses_total.toLocaleString('ro-RO')} RON`, sub: 'Fixe: 25k | Var: 15k', color: 'text-slate-400', icon: 'outbound' },
                    { label: 'Marja Netă %', value: `${summary.margin_percent}%`, change: '+2.9%', color: 'text-emerald-400', icon: 'percent' },
                ].map((card, idx) => (
                    <div key={idx} className="flex items-center gap-6 rounded-[1.5rem] border border-slate-700 bg-slate-800 p-8 hover:border-primary-500/50 hover:bg-slate-700/30 transition-all group shadow-sm">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-slate-500 group-hover:bg-primary-600 group-hover:text-white transition-all border border-slate-700 shadow-inner group-hover:shadow-primary-500/50">
                            <span className="material-symbols-outlined text-3xl">{card.icon}</span>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">{card.label}</p>
                            <p className="text-3xl font-black text-white tracking-tighter group-hover:text-primary-400 transition-colors">{card.value}</p>
                            <div className="flex items-center gap-2 mt-2">
                                {card.change && <span className={`text-[11px] font-black px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 ${card.color}`}>{card.change} <span className="text-slate-600 font-bold ml-1">↑</span></span>}
                                {card.sub && <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">{card.sub}</p>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Expenses List - Right 1/4 */}
            <div className="lg:col-span-1 rounded-[1.5rem] border border-slate-700 bg-slate-900 p-6 flex flex-col h-[600px] lg:h-auto shadow-inner">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Cheltuieli</h3>
                    <button 
                        onClick={() => setCurrentView('add-expense')}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white hover:bg-primary-500 shadow-xl shadow-primary-600/30 transition-all hover:scale-110 active:scale-95"
                    >
                        <span className="material-symbols-outlined">add</span>
                    </button>
                </div>

                <div className="mb-6 relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-xl group-focus-within:text-primary-500 transition-colors">search</span>
                    <input 
                        type="text" 
                        placeholder="CAUTĂ FURNIZOR..." 
                        className="w-full rounded-xl bg-slate-800 border border-slate-700 pl-12 pr-4 py-3 text-xs font-bold text-white placeholder-slate-600 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                    />
                </div>

                <div className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                        {expenses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-700 gap-4 opacity-50">
                                <span className="material-symbols-outlined text-6xl">folder_off</span>
                                <span className="text-xs font-black uppercase tracking-widest">Nicio înregistrare găsită</span>
                            </div>
                        ) : (
                            expenses.map((expense) => (
                                <div key={expense.id} className="group flex cursor-pointer items-center justify-between rounded-xl p-4 hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-800 text-slate-500 group-hover:bg-primary-600 group-hover:text-white transition-all border border-slate-700 shadow-inner">
                                            <span className="material-symbols-outlined text-2xl">
                                                {expense.category === 'Logistica' ? 'local_shipping' : 
                                                 expense.category === 'Taxe' ? 'account_balance' :
                                                 expense.category === 'Salarii' ? 'badge' : 'receipt_long'}
                                            </span>
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-black text-white truncate group-hover:text-primary-400 transition-colors">{expense.vendor}</p>
                                            <p className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2 mt-1">
                                                 {expense.category} <span className="text-slate-700">•</span> <span className={`px-2 py-0.5 rounded-full ${expense.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>{expense.status}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-black text-white tracking-tight">{expense.amount.toLocaleString('ro-RO')} <span className="text-[10px] text-slate-600 font-bold ml-0.5">RON</span></p>
                                        <p className="text-[10px] text-slate-600 font-bold uppercase mt-1 tracking-tighter">{expense.date}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* CHART SECTION (Full Width) */}
      <div className="rounded-[2.5rem] border border-slate-700 bg-slate-800 p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-10 right-10 px-4 py-2 bg-slate-900/60 border border-slate-700 rounded-full flex items-center gap-3 shadow-lg">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50"></div>
                 <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">LIVE DATA STREAM</span>
            </div>
            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Dinamica Componentelor Venitului</h3>
            <p className="text-base text-slate-500 mb-12">Vizualizare structurală a distribuției financiare pe ultimele luni.</p>
            
            <div className="flex flex-wrap gap-10 mb-12 bg-slate-900/40 p-6 rounded-3xl border border-slate-700/50 shadow-inner">
                {[
                    { label: 'Profit Net', color: 'bg-emerald-400' },
                    { label: 'COGS', color: 'bg-amber-400' },
                    { label: 'Logistică', color: 'bg-blue-400' },
                    { label: 'Taxe', color: 'bg-purple-400' },
                    { label: 'Fixe', color: 'bg-pink-400' }
                ].map(item => (
                    <div key={item.label} className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${item.color} shadow-lg shadow-${item.color.split('-')[1]}-500/30`}></div>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                    </div>
                ))}
            </div>

            <div className="h-[450px] w-full px-2">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} stackOffset="expand" barSize={55}>
                         <Tooltip 
                            cursor={{fill: '#334155', opacity: 0.1}}
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '16px', padding: '16px', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)' }}
                            itemStyle={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', padding: '4px 0' }}
                            formatter={(value: number) => [`${value.toLocaleString('ro-RO')} RON`, '']}
                        />
                        <XAxis 
                            dataKey="month" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#64748b', fontSize: 13, fontWeight: '900'}} 
                            dy={15} 
                        />
                        <Bar dataKey="profit" stackId="a" fill="#34d399" radius={[0, 0, 8, 8]} />
                        <Bar dataKey="cogs" stackId="a" fill="#fbbf24" />
                        <Bar dataKey="logistics" stackId="a" fill="#60a5fa" />
                        <Bar dataKey="platform_fees" stackId="a" fill="#a78bfa" />
                        <Bar dataKey="fixed_ops" stackId="a" fill="#f472b6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
  );
};

export default FinancialPage;
