
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FinancialSummary, MonthlyData } from '../types';
import { View } from '../App';

interface DashboardProps {
    setCurrentView: (view: View) => void;
    summary: FinancialSummary;
    chartData: MonthlyData[];
    operationalCount: number;
}

const DashboardPage: React.FC<DashboardProps> = ({ setCurrentView, summary, chartData, operationalCount }) => {
  
  return (
    <div className="mx-auto max-w-[1600px] w-full px-2">
      {/* Header */}
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-4xl font-black text-white tracking-tight uppercase">Operational Center</h1>
            <p className="text-slate-400 text-lg font-medium italic">O privire de ansamblu asupra stării afacerii și priorităților critice.</p>
          </div>
          <div className="hidden md:flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-sm shadow-xl">
            <span className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Lună Curentă:</span>
            <span className="font-black text-white text-base">NOIEMBRIE 2025</span>
            <span className="material-symbols-outlined cursor-pointer text-slate-400 hover:text-white transition-colors">expand_more</span>
          </div>
        </div>
        <button 
          onClick={() => setCurrentView('add-expense')}
          className="flex h-14 items-center gap-3 rounded-2xl bg-primary-600 px-8 text-base font-black text-white hover:bg-primary-500 transition-all shadow-2xl shadow-primary-600/30 hover:scale-105 active:scale-95"
        >
          <span className="material-symbols-outlined text-2xl">add_circle</span>
          <span>ADĂUGARE CHELTUIALĂ</span>
        </button>
      </header>

      {/* Alert Section - Red Warning */}
      {operationalCount > 0 && (
        <section className="mb-10">
            <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-red-500/30 bg-red-500/10 p-8 md:flex-row md:items-center backdrop-blur-md shadow-2xl shadow-red-500/10">
            <div className="flex items-center gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/20 shadow-inner">
                    <span className="material-symbols-outlined text-4xl text-red-500 animate-pulse">priority_high</span>
                </div>
                <div className="flex flex-col">
                <p className="text-xl font-black text-white uppercase tracking-tight">URGENT: {operationalCount} Comenzi neprocesate (&gt; 24h)</p>
                <p className="text-base text-red-300 font-bold mt-1 uppercase tracking-widest opacity-80">Risc major de penalizare marketplace - Acționează imediat</p>
                </div>
            </div>
            <button 
                onClick={() => setCurrentView('operational')}
                className="shrink-0 rounded-2xl bg-red-500 px-8 py-4 text-sm font-black text-white hover:bg-red-600 transition-all shadow-xl shadow-red-500/40 hover:scale-105"
            >
                GESTIONEAZĂ COMERZILE
            </button>
            </div>
        </section>
      )}

      {/* KPI Cards */}
      <section className="mb-10 grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Net Profit Card */}
        <div className="flex flex-col justify-between gap-6 rounded-[2rem] border border-slate-700 bg-slate-800 p-10 shadow-2xl hover:border-emerald-500/50 transition-all group overflow-hidden relative">
          <div className="absolute -right-10 -bottom-10 h-40 w-40 bg-emerald-500/5 rounded-full group-hover:bg-emerald-500/10 transition-all"></div>
          <div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Profit Net (Luna curentă)</p>
            <p className="text-6xl font-black text-white tracking-tighter group-hover:text-emerald-400 transition-colors">
                {summary.net_profit.toLocaleString('ro-RO')} <span className="text-2xl font-black text-slate-600">RON</span>
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <p className="text-sm font-black text-emerald-400 uppercase tracking-widest">Marjă Netă: {summary.margin_percent}%</p>
                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">+5.4% vs LUNA TRECUTĂ</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-900 shadow-inner">
              <div className="h-full rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 transition-all duration-1000" style={{ width: `${summary.margin_percent * 3}%` }}></div>
            </div>
          </div>
        </div>

        {/* Break-even Tracker */}
        <div className="flex flex-col justify-between gap-6 rounded-[2rem] border border-slate-700 bg-slate-800 p-10 shadow-2xl hover:border-primary-500/50 transition-all group overflow-hidden relative">
            <div className="absolute -right-10 -bottom-10 h-40 w-40 bg-primary-500/5 rounded-full group-hover:bg-primary-500/10 transition-all"></div>
            <div>
                <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Break-even Tracker (Acoperire Cheltuieli)</p>
                <div className="flex items-baseline gap-4">
                    <p className="text-6xl font-black text-white tracking-tighter group-hover:text-primary-400 transition-colors">{summary.expense_coverage_percent}%</p>
                    <p className="text-base text-slate-600 font-bold uppercase tracking-widest mb-2">DIN {summary.break_even_target.toLocaleString('ro-RO')} <span className="text-sm">RON</span></p>
                </div>
            </div>
          <div className="w-full rounded-full bg-slate-900 h-4 shadow-inner">
            <div className="h-full rounded-full bg-primary-500 shadow-lg shadow-primary-500/50 transition-all duration-1000" style={{ width: `${summary.expense_coverage_percent}%` }}></div>
          </div>
        </div>
      </section>

      {/* Charts & Operational Blockers */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Revenue vs Expenses Chart */}
        <div className="rounded-[2rem] border border-slate-700 bg-slate-800 p-10 lg:col-span-3 shadow-2xl">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Trend Venituri vs. Cheltuieli</h3>
            <div className="flex gap-6">
                 <div className="flex items-center gap-2">
                    <div className="h-2 w-4 rounded-full bg-primary-500 shadow-lg shadow-primary-500/50"></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Venituri</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="h-2 w-4 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cheltuieli</span>
                 </div>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={12}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 13, fontWeight: '900' }} 
                    dy={15}
                />
                <YAxis 
                    hide 
                />
                <Tooltip 
                    cursor={{ fill: '#334155', opacity: 0.1 }}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #475569', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)' }}
                    itemStyle={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}
                    formatter={(value: number) => [`${value.toLocaleString()} RON`, '']}
                />
                <Bar dataKey="revenue" name="Venituri" radius={[8, 8, 0, 0]} maxBarSize={50}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#3b82f6' : '#3b82f6cc'} className="hover:opacity-80 transition-opacity" />
                    ))}
                </Bar>
                <Bar dataKey="expenses" name="Cheltuieli" radius={[8, 8, 0, 0]} maxBarSize={50}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#ef4444' : '#ef4444cc'} className="hover:opacity-80 transition-opacity" />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operational Blockers List */}
        <div className="rounded-[2rem] border border-slate-700 bg-slate-800 p-10 lg:col-span-2 shadow-2xl overflow-hidden flex flex-col">
          <div className="flex items-center gap-3 mb-10">
            <span className="material-symbols-outlined text-amber-500">grid_view</span>
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Blocaje Operaționale</h3>
          </div>
          <div className="space-y-6 flex-1">
            {[
                { icon: 'inventory', color: 'bg-yellow-500', label: 'La Verificare Stoc', count: 5, alert: 'Normal' },
                { icon: 'local_shipping', color: 'bg-orange-500', label: 'Ne-expediate (> 24h)', count: 8, alert: 'Critic' },
                { icon: 'assignment_return', color: 'bg-blue-500', label: 'Retururi în așteptare', count: 3, alert: 'Urmărire' }
            ].map((block, idx) => (
                <div key={idx} className="group flex items-center justify-between rounded-2xl bg-slate-900/50 p-6 transition-all hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600 shadow-sm">
                    <div className="flex items-center gap-5">
                        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${block.color}/20 ${block.color.replace('bg-', 'text-')} shadow-inner group-hover:scale-110 transition-transform`}>
                            <span className="material-symbols-outlined text-3xl">{block.icon}</span>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-base font-black text-white uppercase tracking-tight">{block.label}</p>
                            <p className={`text-[10px] font-black uppercase tracking-widest ${block.alert === 'Critic' ? 'text-red-500' : 'text-slate-500'}`}>{block.alert} • ACȚIUNE NECESARĂ</p>
                        </div>
                    </div>
                    <p className="text-4xl font-black text-white tracking-tighter group-hover:text-primary-400 transition-colors">{block.count}</p>
                </div>
            ))}
          </div>
          <button className="mt-8 w-full rounded-2xl border border-slate-700 bg-slate-900/50 py-4 text-xs font-black text-slate-500 hover:text-white hover:bg-slate-700 transition-all uppercase tracking-[0.2em]">
            Exportă Raport Zilnic
          </button>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
