/**
 * Dashboard View
 */
import { store } from '../store.js';

export const renderDashboard = (container, state) => {
    const summary = state.financialSummary;
    const chartData = state.monthlyData;
    const operationalCount = state.operationalOrders.length;

    // Helper to extract arrays for Charts
    const categories = chartData.map(d => d.month);
    const revenueData = chartData.map(d => d.revenue);
    const expensesData = chartData.map(d => d.expenses);

    const html = `
    <div class="mx-auto max-w-[1600px] w-full px-2">
      <!-- Header -->
      <header class="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-6">
          <div class="flex flex-col gap-1">
            <h1 class="text-4xl font-black text-white tracking-tight uppercase">Operational Center</h1>
            <p class="text-slate-400 text-lg font-medium italic">O privire de ansamblu asupra stării afacerii și priorităților critice.</p>
          </div>
          <div class="hidden md:flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-sm shadow-xl">
            <span class="text-slate-500 font-black uppercase tracking-widest text-[10px]">Lună Curentă:</span>
            <span class="font-black text-white text-base">NOIEMBRIE 2025</span>
            <span class="material-symbols-outlined cursor-pointer text-slate-400 hover:text-white transition-colors">expand_more</span>
          </div>
        </div>
        <button id="btn-add-expense"
          class="flex h-14 items-center gap-3 rounded-2xl bg-primary-600 px-8 text-base font-black text-white hover:bg-primary-500 transition-all shadow-2xl shadow-primary-600/30 hover:scale-105 active:scale-95"
        >
          <span class="material-symbols-outlined text-2xl">add_circle</span>
          <span>ADĂUGARE CHELTUIALĂ</span>
        </button>
      </header>

      <!-- Alert Section - Red Warning -->
      ${operationalCount > 0 ? `
        <section class="mb-10">
            <div class="flex flex-col items-start justify-between gap-6 rounded-3xl border border-red-500/30 bg-red-500/10 p-8 md:flex-row md:items-center backdrop-blur-md shadow-2xl shadow-red-500/10">
            <div class="flex items-center gap-6">
                <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/20 shadow-inner">
                    <span class="material-symbols-outlined text-4xl text-red-500 animate-pulse">priority_high</span>
                </div>
                <div class="flex flex-col">
                <p class="text-xl font-black text-white uppercase tracking-tight">URGENT: ${operationalCount} Comenzi neprocesate (&gt; 24h)</p>
                <p class="text-base text-red-300 font-bold mt-1 uppercase tracking-widest opacity-80">Risc major de penalizare marketplace - Acționează imediat</p>
                </div>
            </div>
            <button id="btn-manage-ops"
                class="shrink-0 rounded-2xl bg-red-500 px-8 py-4 text-sm font-black text-white hover:bg-red-600 transition-all shadow-xl shadow-red-500/40 hover:scale-105"
            >
                GESTIONEAZĂ COMENZILE
            </button>
            </div>
        </section>
      ` : ''}

      <!-- KPI Cards -->
      <section class="mb-10 grid grid-cols-1 gap-8 md:grid-cols-2">
        <!-- Net Profit Card -->
        <div class="flex flex-col justify-between gap-6 rounded-[2rem] border border-slate-700 bg-slate-800 p-10 shadow-2xl hover:border-emerald-500/50 transition-all group overflow-hidden relative">
          <div class="absolute -right-10 -bottom-10 h-40 w-40 bg-emerald-500/5 rounded-full group-hover:bg-emerald-500/10 transition-all"></div>
          <div>
            <p class="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Profit Net (Luna curentă)</p>
            <p class="text-6xl font-black text-white tracking-tighter group-hover:text-emerald-400 transition-colors">
                ${summary.net_profit.toLocaleString('ro-RO')} <span class="text-2xl font-black text-slate-600">RON</span>
            </p>
          </div>
          <div class="flex flex-col gap-3">
            <div class="flex items-center justify-between">
                <p class="text-sm font-black text-emerald-400 uppercase tracking-widest">Marjă Netă: ${summary.margin_percent}%</p>
                <span class="text-[10px] text-slate-600 font-bold uppercase tracking-widest">+5.4% vs LUNA TRECUTĂ</span>
            </div>
            <div class="h-3 w-full overflow-hidden rounded-full bg-slate-900 shadow-inner">
              <div class="h-full rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 transition-all duration-1000" style="width: ${summary.margin_percent * 3}%"></div>
            </div>
          </div>
        </div>

        <!-- Break-even Tracker -->
        <div class="flex flex-col justify-between gap-6 rounded-[2rem] border border-slate-700 bg-slate-800 p-10 shadow-2xl hover:border-primary-500/50 transition-all group overflow-hidden relative">
            <div class="absolute -right-10 -bottom-10 h-40 w-40 bg-primary-500/5 rounded-full group-hover:bg-primary-500/10 transition-all"></div>
            <div>
                <p class="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Break-even Tracker (Acoperire Cheltuieli)</p>
                <div class="flex items-baseline gap-4">
                    <p class="text-6xl font-black text-white tracking-tighter group-hover:text-primary-400 transition-colors">${summary.expense_coverage_percent}%</p>
                    <p class="text-base text-slate-600 font-bold uppercase tracking-widest mb-2">DIN ${summary.break_even_target.toLocaleString('ro-RO')} <span class="text-sm">RON</span></p>
                </div>
            </div>
          <div class="w-full rounded-full bg-slate-900 h-4 shadow-inner">
            <div class="h-full rounded-full bg-primary-500 shadow-lg shadow-primary-500/50 transition-all duration-1000" style="width: ${summary.expense_coverage_percent}%"></div>
          </div>
        </div>
      </section>

      <!-- Charts & Operational Blockers -->
      <section class="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <!-- Revenue vs Expenses Chart -->
        <div class="rounded-[2rem] border border-slate-700 bg-slate-800 p-10 lg:col-span-3 shadow-2xl">
          <div class="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Trend Venituri vs. Cheltuieli</h3>
             <!-- Legend managed by chart usually, but here is manual in original, APEX manages it well -->
          </div>
          <div id="dashboard-chart" class="h-80 w-full"></div>
        </div>

        <!-- Operational Blockers List -->
        <div class="rounded-[2rem] border border-slate-700 bg-slate-800 p-10 lg:col-span-2 shadow-2xl overflow-hidden flex flex-col">
          <div class="flex items-center gap-3 mb-10">
            <span class="material-symbols-outlined text-amber-500">grid_view</span>
            <h3 class="text-xl font-black text-white uppercase tracking-tight">Blocaje Operaționale</h3>
          </div>
          <div class="space-y-6 flex-1">
            ${[
            { icon: 'inventory', color: 'bg-yellow-500', label: 'La Verificare Stoc', count: 5, alert: 'Normal' },
            { icon: 'local_shipping', color: 'bg-orange-500', label: 'Ne-expediate (> 24h)', count: 8, alert: 'Critic' },
            { icon: 'assignment_return', color: 'bg-blue-500', label: 'Retururi în așteptare', count: 3, alert: 'Urmărire' }
        ].map((block) => `
                <div class="group flex items-center justify-between rounded-2xl bg-slate-900/50 p-6 transition-all hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600 shadow-sm">
                    <div class="flex items-center gap-5">
                        <div class="flex h-14 w-14 items-center justify-center rounded-2xl ${block.color.replace('bg-', 'bg-opacity-20 ' + block.color.split('-')[0] + '-')} ${block.color.replace('bg-', 'text-')} shadow-inner group-hover:scale-110 transition-transform">
                             <!-- Tailwind dynamic classes workaround: Hardcoding for safety since replacing bg-yellow-500 with text-yellow-500 might fail if safelylisting isnt on. 
                             Better: Use direct style or ensure classes exist. 
                             Simpler approach: -->
                             <span class="material-symbols-outlined text-3xl text-${block.color.split('-')[1]}-500">${block.icon}</span>
                        </div>
                        <div class="flex flex-col">
                            <p class="text-base font-black text-white uppercase tracking-tight">${block.label}</p>
                            <p class="text-[10px] font-black uppercase tracking-widest ${block.alert === 'Critic' ? 'text-red-500' : 'text-slate-500'}">${block.alert} • ACȚIUNE NECESARĂ</p>
                        </div>
                    </div>
                    <p class="text-4xl font-black text-white tracking-tighter group-hover:text-primary-400 transition-colors">${block.count}</p>
                </div>
            `).join('')}
          </div>
          <button class="mt-8 w-full rounded-2xl border border-slate-700 bg-slate-900/50 py-4 text-xs font-black text-slate-500 hover:text-white hover:bg-slate-700 transition-all uppercase tracking-[0.2em]">
            Exportă Raport Zilnic
          </button>
        </div>
      </section>
    </div>
    `;

    container.innerHTML = html;

    // Attach Event Listeners
    document.getElementById('btn-add-expense').addEventListener('click', () => {
        store.setView('add-expense');
    });

    const manageOpsBtn = document.getElementById('btn-manage-ops');
    if (manageOpsBtn) {
        manageOpsBtn.addEventListener('click', () => {
            store.setView('operational');
        });
    }

    // Initialize Chart
    const options = {
        series: [{
            name: 'Venituri',
            data: revenueData
        }, {
            name: 'Cheltuieli',
            data: expensesData
        }],
        chart: {
            type: 'bar',
            height: 320,
            toolbar: { show: false },
            fontFamily: 'Inter, sans-serif'
        },
        colors: ['#3b82f6', '#ef4444'],
        plotOptions: {
            bar: {
                borderRadius: 4,
                horizontal: false,
                columnWidth: '55%',
            },
        },
        dataLabels: { enabled: false },
        stroke: { show: true, width: 2, colors: ['transparent'] },
        xaxis: {
            categories: categories,
            labels: {
                style: { colors: '#64748b', fontSize: '12px', fontWeight: 700 }
            },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: { show: false },
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
            horizontalAlign: 'right',
            fontWeight: 700,
            labels: { colors: '#94a3b8' }
        }
    };

    const chart = new ApexCharts(document.querySelector("#dashboard-chart"), options);
    chart.render();
};
