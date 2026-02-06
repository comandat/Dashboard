import { store } from '../store.js';

export const renderFinancial = (container, state) => {
    const summary = state.financialSummary;
    const selectedPeriod = state.financialPeriod;
    const rawMonthlyData = state.monthlyData || [];
    const chartData = rawMonthlyData.slice(-12);
    const currentMonthStr = new Date().toISOString().slice(0, 7);
    const expenses = state.expenses.filter(ex => {
        if(selectedPeriod === 'current_month') return ex.date.startsWith(currentMonthStr);
        return true; 
    });

    const categories = chartData.map(d => d.month);
    
    const series = [
        { name: 'Profit Net', data: chartData.map(d => d.profit) },
        { name: 'COGS', data: chartData.map(d => d.cogs) },
        { name: 'Comisioane', data: chartData.map(d => d.comisioane) },
        { name: 'Transport', data: chartData.map(d => d.transport) },
        { name: 'Infrastructură', data: chartData.map(d => d.infrastructura) },
        { name: 'Operațional', data: chartData.map(d => d.operational) },
        { name: 'Taxe', data: chartData.map(d => d.taxe) },
        { name: 'Altele', data: chartData.map(d => d.altele) }
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
                        class="period-btn rounded-xl px-6 py-3 text-xs font-black transition-all duration-300 ${selectedPeriod === p.id
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

            <div class="lg:col-span-1 rounded-[1.5rem] border border-slate-700 bg-slate-900 p-6 flex flex-col shadow-inner">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Cheltuieli Recente</h3>
                    <button id="btn-add-expense-fin" class="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white hover:bg-primary-500 shadow-lg hover:scale-110 active:scale-95 transition-all">
                        <span class="material-symbols-outlined text-sm">add</span>
                    </button>
                </div>

                <div class="flex flex-col">
                    <div class="max-h-[240px] overflow-y-auto space-y-2 custom-scrollbar pr-1">
                        ${expenses.length === 0 ? `
                            <div class="flex flex-col items-center justify-center h-32 text-slate-700 gap-2 opacity-50">
                                <span class="material-symbols-outlined text-4xl">folder_off</span>
                                <span class="text-[10px] font-black uppercase tracking-widest">Lipsă date</span>
                            </div>
                        ` : expenses.map((expense) => `
                            <div class="group flex cursor-pointer items-center justify-between rounded-xl p-3 hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700 shadow-sm">
                                <div class="flex items-center gap-3">
                                    <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-500 group-hover:bg-primary-600 group-hover:text-white transition-all border border-slate-700 shadow-inner">
                                        <span class="material-symbols-outlined text-lg">
                                            ${expense.category.includes('TRANSPORT') ? 'local_shipping' :
                                              expense.category.includes('TAXE') ? 'account_balance' :
                                              expense.category.includes('SALARII') ? 'badge' : 
                                              expense.category.includes('OPERATIONAL') ? 'business_center' : 'receipt_long'}
                                        </span>
                                    </div>
                                    <div class="overflow-hidden w-24">
                                        <p class="text-xs font-black text-white truncate group-hover:text-primary-400 transition-colors">${expense.vendor}</p>
                                        <p class="text-[9px] font-black text-slate-500 uppercase mt-0.5 truncate">${expense.category}</p>
                                    </div>
                                </div>
                                <div class="text-right shrink-0">
                                    <p class="text-xs font-black text-white tracking-tight">${expense.amount.toLocaleString('ro-RO')} <span class="text-[9px] text-slate-600">RON</span></p>
                                    <p class="text-[9px] text-slate-600 font-bold uppercase mt-0.5 tracking-tighter">${expense.date}</p>
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
            <p class="text-base text-slate-500 mb-12">Vizualizare Profit, COGS și distribuția costurilor operaționale.</p>
            <div class="h-[500px] w-full px-2" id="financial-chart"></div>
      </div>
    </div>
    `;

    container.innerHTML = html;

    container.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const period = e.currentTarget.getAttribute('data-period');
            store.setFinancialPeriod(period);
        });
    });

    document.getElementById('btn-add-expense-fin').addEventListener('click', () => {
        store.setView('add-expense');
    });

    const options = {
        series: series,
        chart: {
            type: 'bar',
            height: '100%',
            stacked: true,
            stackType: 'normal',
            toolbar: { show: false },
            fontFamily: 'Inter, sans-serif'
        },
        colors: ['#34d399', '#fbbf24', '#f87171', '#60a5fa', '#a78bfa', '#2dd4bf', '#f472b6', '#94a3b8'],
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '50%',
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
            padding: { bottom: 20 },
            yaxis: { lines: { show: true } }
        },
        tooltip: {
            theme: 'dark',
            shared: true,
            intersect: false,
            x: {
                show: true,
                format: 'MMMM yyyy'
            },
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
