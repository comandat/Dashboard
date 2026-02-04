/**
 * Financial View
 */
import { store } from '../store.js';

export const renderFinancial = (container, state) => {
    const summary = state.financialSummary;
    const expenses = state.expenses;
    const monthlyData = state.monthlyData;
    const selectedPeriod = state.financialPeriod;

    // Chart Data Preparation - NOILE CATEGORII
    const categories = monthlyData.map(d => d.month);
    
    const series = [
        { name: 'Profit Net', data: monthlyData.map(d => d.profit) },
        { name: 'COGS', data: monthlyData.map(d => d.cogs) },
        { name: 'Comisioane', data: monthlyData.map(d => d.comisioane) },
        { name: 'Transport', data: monthlyData.map(d => d.transport) },
        { name: 'Infrastructură', data: monthlyData.map(d => d.infrastructura) },
        { name: 'Operațional', data: monthlyData.map(d => d.operational) }, // <--- SERIE NOUĂ
        { name: 'Taxe', data: monthlyData.map(d => d.taxe) },
        { name: 'Altele', data: monthlyData.map(d => d.altele) }
    ];

    const html = `
    <div class="mx-auto max-w-[1600px] w-full px-2">
      <header class="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-col gap-1">
          <h1 class="text-4xl font-black tracking-tight text-white uppercase">Prezentare Financiară</h1>
          <p class="text-slate-400 text-lg">Analiza veniturilor și structura detaliată a costurilor.</p>
        </div>
      </header>

      <div class="mb-10 rounded-[2rem] border border-slate-700 bg-slate-800/50 p-4 shadow-2xl overflow-hidden backdrop-blur-sm">
        <div class="flex flex-wrap items-center justify-between gap-6 p-6 border-b border-slate-700/50 bg-slate-800/80 rounded-t-[1.5rem]">
            <div class="flex items-center gap-4">
                <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600/10 text-primary-500 border border-primary-500/20 shadow-inner">
                    <span class="material-symbols-outlined text-3xl">calendar_today</span>
                </div>
                <div class="flex flex-col">
                    <span class="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Sincronizare Perioadă</span>
                    <span class="text-xl font-black text-white">Scorecards & Cheltuieli</span>
                </div>
            </div>
            <div class="flex gap-3 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-700 shadow-inner">
                ${[
            { id: 'current_month', label: 'Luna Curentă' },
            { id: 'last_month', label: 'Luna Trecută' },
            { id: 'last_quarter', label: 'Trimestrul Trecut' }
        ].map(p => `
                    <button 
                        data-period="${p.id}"
                        class="rounded-xl px-6 py-3 text-xs font-black transition-all duration-300 ${selectedPeriod === p.id
                ? 'bg-primary-600 text-white shadow-xl shadow-primary-600/40 transform scale-105'
                : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'
            }"
                    >
                        ${p.label.toUpperCase()}
                    </button>
                `).join('')}
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8 p-6">
            <div class="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 content-start">
                 ${[
            { label: 'Venit Total', value: `${summary.revenue.toLocaleString('ro-RO')} RON`, change: null, color: 'text-emerald-400', icon: 'payments' },
            { label: 'Profit Net', value: `${summary.net_profit.toLocaleString('ro-RO')} RON`, change: null, color: summary.net_profit >= 0 ? 'text-emerald-400' : 'text-red-400', icon: 'trending_up' },
            { label: 'Cheltuieli Totale', value: `${summary.expenses_total.toLocaleString('ro-RO')} RON`, sub: null, color: 'text-slate-400', icon: 'outbound' },
            { label: 'Marja Netă %', value: `${summary.margin_percent}%`, change: null, color: summary.margin_percent >= 0 ? 'text-emerald-400' : 'text-red-400', icon: 'percent' },
        ].map((card) => `
                    <div class="flex items-center gap-6 rounded-[1.5rem] border border-slate-700 bg-slate-800 p-8 hover:border-primary-500/50 hover:bg-slate-700/30 transition-all group shadow-sm">
                        <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-slate-500 group-hover:bg-primary-600 group-hover:text-white transition-all border border-slate-700 shadow-inner group-hover:shadow-primary-500/50">
                            <span class="material-symbols-outlined text-3xl">${card.icon}</span>
                        </div>
                        <div class="flex flex-col">
                            <p class="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">${card.label}</p>
                            <p class="text-3xl font-black text-white tracking-tighter group-hover:text-primary-400 transition-colors">${card.value}</p>
                            <div class="flex items-center gap-2 mt-2">
                                ${card.change ? `<span class="text-[11px] font-black px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 ${card.color}">${card.change} <span class="text-slate-600 font-bold ml-1">↑</span></span>` : ''}
                                ${card.sub ? `<p class="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">${card.sub}</p>` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="lg:col-span-1 rounded-[1.5rem] border border-slate-700 bg-slate-900 p-6 flex flex-col h-[600px] lg:h-auto shadow-inner">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Cheltuieli Recente</h3>
                    <button id="btn-add-expense-fin"
                        class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white hover:bg-primary-500 shadow-xl shadow-primary-600/30 transition-all hover:scale-110 active:scale-95"
                    >
                        <span class="material-symbols-outlined">add</span>
                    </button>
                </div>

                <div class="mb-6 relative group">
                    <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-xl group-focus-within:text-primary-500 transition-colors">search</span>
                    <input 
                        type="text" 
                        placeholder="CAUTĂ FURNIZOR..." 
                        class="w-full rounded-xl bg-slate-800 border border-slate-700 pl-12 pr-4 py-3 text-xs font-bold text-white placeholder-slate-600 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                    />
                </div>

                <div class="flex flex-col flex-1 overflow-hidden">
                    <div class="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                        ${expenses.length === 0 ? `
                            <div class="flex flex-col items-center justify-center h-full text-slate-700 gap-4 opacity-50">
                                <span class="material-symbols-outlined text-6xl">folder_off</span>
                                <span class="text-xs font-black uppercase tracking-widest">Nicio înregistrare găsită</span>
                            </div>
                        ` : expenses.map((expense) => `
                            <div class="group flex cursor-pointer items-center justify-between rounded-xl p-4 hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700 shadow-sm">
                                <div class="flex items-center gap-4">
                                    <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-800 text-slate-500 group-hover:bg-primary-600 group-hover:text-white transition-all border border-slate-700 shadow-inner">
                                        <span class="material-symbols-outlined text-2xl">
                                            ${expense.category.includes('TRANSPORT') ? 'local_shipping' :
                                              expense.category.includes('TAXE') ? 'account_balance' :
                                              expense.category.includes('SALARII') ? 'badge' : 
                                              expense.category.includes('OPERATIONAL') ? 'business_center' :
                                              expense.category.includes('COMISIOANE') ? 'percent' : 'receipt_long'}
                                        </span>
                                    </div>
                                    <div class="overflow-hidden">
                                        <p class="text-sm font-black text-white truncate group-hover:text-primary-400 transition-colors">${expense.vendor}</p>
                                        <p class="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2 mt-1">
                                             ${expense.category}
                                        </p>
                                    </div>
                                </div>
                                <div class="text-right shrink-0">
                                    <p class="text-sm font-black text-white tracking-tight">${expense.amount.toLocaleString('ro-RO')} <span class="text-[10px] text-slate-600 font-bold ml-0.5">RON</span></p>
                                    <p class="text-[10px] text-slate-600 font-bold uppercase mt-1 tracking-tighter">${expense.date}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div class="rounded-[2.5rem] border border-slate-700 bg-slate-800 p-10 shadow-2xl relative overflow-hidden">
            <h3 class="text-2xl font-black text-white mb-2 uppercase tracking-tight">Dinamica Componentelor Venitului</h3>
            <p class="text-base text-slate-500 mb-12">Vizualizare Profit, COGS și distribuția costurilor operaționale (Transport, Comisioane, Taxe).</p>
            
            <div class="h-[450px] w-full px-2" id="financial-chart"></div>
      </div>
    </div>
    `;

    container.innerHTML = html;

    // Listeners
    container.querySelectorAll('button[data-period]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const period = e.currentTarget.getAttribute('data-period');
            store.setFinancialPeriod(period);
        });
    });

    document.getElementById('btn-add-expense-fin').addEventListener('click', () => {
        store.setView('add-expense');
    });

    // Chart Init
    const options = {
        series: series,
        chart: {
            type: 'bar',
            height: '100%',
            stacked: true,
            stackType: 'normal', // Normal stack to see actual values
            toolbar: { show: false },
            fontFamily: 'Inter, sans-serif'
        },
        // Culori distincte pentru fiecare categorie
        colors: [
            '#34d399', // Profit Net (Verde)
            '#fbbf24', // COGS (Galben)
            '#f87171', // Comisioane (Rosu deschis)
            '#60a5fa', // Transport (Albastru)
            '#a78bfa', // Infrastructura (Mov)
            '#2dd4bf', // Operational (Teal / Cyan) -> NEW
            '#f472b6', // Taxe (Roz)
            '#94a3b8'  // Altele (Gri)
        ],
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '60%',
                borderRadius: 4
            },
        },
        dataLabels: { enabled: false },
        stroke: { width: 0 },
        xaxis: {
            categories: categories,
            labels: {
                style: { colors: '#64748b', fontSize: '12px', fontWeight: 700 }
            },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: { 
            show: true,
            labels: {
                style: { colors: '#64748b', fontSize: '11px', fontWeight: 600 },
                formatter: (val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val.toFixed(0)
            }
        },
        grid: {
            borderColor: '#334155',
            strokeDashArray: 4,
            yaxis: { lines: { show: true } }
        },
        tooltip: {
            theme: 'dark',
            y: {
                formatter: function (val) {
                    return val.toLocaleString('ro-RO') + " RON"
                }
            }
        },
        legend: {
            position: 'top',
            horizontalAlign: 'left',
            fontWeight: 700,
            labels: { colors: '#94a3b8' }
        }
    };

    const chart = new ApexCharts(document.querySelector("#financial-chart"), options);
    chart.render();
};
