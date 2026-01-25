/**
 * Stock View
 */
import { store } from '../store.js';

export const renderStock = (container, state) => {
    const deadStock = state.deadStock;
    let showAllCategories = false;

    // Mock Data (Static from App code)
    const topCategories = [
        { rank: 1, cat: 'Electronice', val: '560.085 RON', speed: '2.4', status: 'Rapid', statusColor: 'text-emerald-400', icon: 'devices' },
        { rank: 2, cat: 'Îmbrăcăminte', val: '458.490 RON', speed: '3.1', status: 'Rapid', statusColor: 'text-emerald-400', icon: 'apparel' },
        { rank: 3, cat: 'Uz Casnic', val: '382.000 RON', speed: '0.5', status: 'Lent', statusColor: 'text-red-400', icon: 'chair' },
        { rank: 4, cat: 'Sportive', val: '303.645 RON', speed: '1.2', status: 'Mediu', statusColor: 'text-amber-400', icon: 'fitness_center' },
        { rank: 5, cat: 'Auto', val: '250.120 RON', speed: '1.8', status: 'Mediu', statusColor: 'text-amber-400', icon: 'directions_car' },
        { rank: 6, cat: 'Jucării', val: '210.500 RON', speed: '4.2', status: 'Rapid', statusColor: 'text-emerald-400', icon: 'toys' },
        { rank: 7, cat: 'Grădină', val: '180.300 RON', speed: '0.8', status: 'Lent', statusColor: 'text-red-400', icon: 'yard' },
        { rank: 8, cat: 'Cosmetice', val: '150.800 RON', speed: '3.5', status: 'Rapid', statusColor: 'text-emerald-400', icon: 'spa' },
        { rank: 9, cat: 'Birotică', val: '120.400 RON', speed: '1.5', status: 'Mediu', statusColor: 'text-amber-400', icon: 'print' },
        { rank: 10, cat: 'Pet Shop', val: '98.200 RON', speed: '2.1', status: 'Mediu', statusColor: 'text-amber-400', icon: 'pets' },
    ];

    // Chart Data
    const skuTrendMonths = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Noi', 'Dec'];
    const skuTrendSold = [450, 480, 520, 510, 590, 610, 650, 720, 680, 750, 820, 950];
    const skuTrendPosted = [520, 540, 600, 620, 650, 700, 720, 800, 820, 850, 900, 1000];

    const getHTML = (fullCats) => {
        const visibleCategories = fullCats ? topCategories : topCategories.slice(0, 5);
        return `
        <div class="mx-auto max-w-[1600px] pb-12 w-full px-2">
            <div class="mb-8">
                <h1 class="text-4xl font-black text-white tracking-tight">Analiză Stoc & Lichidare</h1>
                <p class="text-slate-400 mt-2 text-lg">Monitorizare inventar, strategii de lichidare și performanță pe categorii (ultimele 12 luni).</p>
            </div>

            <div class="flex flex-col gap-8">
                <!-- ROW 1: Dead Stock Table -->
                <div class="w-full rounded-2xl border border-slate-700 bg-slate-800 overflow-hidden shadow-2xl">
                    <div class="px-8 py-4 border-b border-slate-700 bg-slate-800/80 flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-red-500">inventory_2</span>
                            <h2 class="text-lg font-bold text-white uppercase tracking-widest">Listă Lichidare Stoc</h2>
                        </div>
                        <div class="flex items-center gap-4 bg-slate-900/50 px-4 py-1.5 rounded-full border border-slate-700">
                            <span class="text-xs text-slate-500 font-bold italic uppercase">Filtrat: Stagnant &gt; 30 zile</span>
                        </div>
                    </div>
                    <div class="w-full overflow-x-auto">
                        <div class="max-h-[450px] overflow-y-auto custom-scrollbar">
                            <table class="w-full text-left">
                                <thead class="sticky top-0 bg-slate-900 z-20 border-b border-slate-700">
                                    <tr class="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                                        <th class="px-8 py-4">Produs / SKU</th>
                                        <th class="px-8 py-4">Status Rotație</th>
                                        <th class="px-8 py-4">Stoc Disponibil</th>
                                        <th class="px-8 py-4">Bani Blocați (Cost)</th>
                                        <th class="px-8 py-4">Valoare Estimată (Potential)</th>
                                        <th class="px-8 py-4 text-right">Acțiuni Strategice</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-700/50">
                                    ${deadStock.map((product, index) => `
                                        <tr class="hover:bg-slate-700/40 transition-all group">
                                            <td class="px-8 py-5">
                                                <div class="flex items-center gap-4">
                                                    <div class="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-700 border border-slate-600 shadow-inner">
                                                        <img src="${product.image_url}" alt="" class="h-full w-full object-cover" />
                                                    </div>
                                                    <div class="flex flex-col">
                                                        <span class="text-base font-black text-white group-hover:text-primary-400 transition-colors">${product.name}</span>
                                                        <span class="text-xs text-slate-500 font-mono tracking-tighter">${product.sku}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="px-8 py-5">
                                                <span class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-tight ${product.status.includes('Lent')
                ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
            }">
                                                    <div class="h-1.5 w-1.5 rounded-full ${product.status.includes('Lent') ? 'bg-red-500' : 'bg-amber-500'}"></div>
                                                    ${product.status.split(' ')[0]}
                                                </span>
                                            </td>
                                            <td class="px-8 py-5 text-base font-bold text-slate-300">${product.stock_qty} <span class="text-xs text-slate-500 font-normal">buc</span></td>
                                            <td class="px-8 py-5 text-base font-black text-white">${product.cost_price.toLocaleString('ro-RO')} <span class="text-xs text-slate-500 font-normal">RON</span></td>
                                            <td class="px-8 py-5 text-base font-black text-emerald-400">${product.retail_price.toLocaleString('ro-RO')} <span class="text-xs text-emerald-600 font-normal">RON</span></td>
                                            <td class="px-8 py-5 text-right">
                                                <div class="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                    <button 
                                                        class="btn-liquidate flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2 text-xs font-black text-white hover:bg-primary-500 shadow-xl shadow-primary-600/30 transition-all hover:scale-105 active:scale-95"
                                                        data-idx="${index}"
                                                    >
                                                        <span class="material-symbols-outlined text-sm">percent</span>
                                                        LICHIDEAZĂ
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- ROW 2: Top Categories -->
                <div class="w-full rounded-2xl border border-slate-700 bg-slate-800 p-8 shadow-2xl">
                    <div class="flex items-center justify-between mb-10">
                        <div class="flex flex-col gap-1">
                            <h3 class="font-black text-white text-2xl tracking-tight uppercase">Top 10 Categorii Performante</h3>
                            <p class="text-sm text-slate-500">Ierarhia categoriilor după volum de vânzări și viteza de rotație (Media 12 luni).</p>
                        </div>
                        <button id="btn-toggle-cats"
                            class="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-700 px-6 py-3 text-xs font-black text-slate-300 hover:text-primary-400 hover:border-primary-500/50 transition-all group"
                        >
                            <span class="material-symbols-outlined text-lg transition-transform group-hover:scale-125">${visibleCategories.length > 5 ? 'keyboard_arrow_up' : 'expand_more'}</span>
                            ${visibleCategories.length > 5 ? 'RESTRÂNGE LISTA' : 'VEZI TOATE CELE 10 CATEGORII'}
                        </button>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        ${visibleCategories.map(item => `
                            <div class="bg-slate-900/60 rounded-[2rem] p-8 border border-slate-700 hover:border-primary-500/50 transition-all group relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                                <div class="absolute -right-4 -top-4 text-7xl font-black text-slate-800/40 group-hover:text-primary-500/10 transition-all pointer-events-none italic">#${item.rank}</div>
                                
                                <div>
                                    <div class="flex items-center gap-4 mb-8">
                                        <div class="rounded-2xl bg-primary-600/10 p-3 text-primary-400 border border-primary-500/20 group-hover:bg-primary-600 group-hover:text-white transition-all shadow-lg">
                                            <span class="material-symbols-outlined text-2xl">${item.icon}</span>
                                        </div>
                                        <span class="text-[10px] font-black uppercase px-3 py-1 rounded-full border ${item.statusColor} bg-slate-900 shadow-sm">${item.status}</span>
                                    </div>
                                    
                                    <h4 class="text-slate-500 text-xs font-black uppercase tracking-[0.2em] mb-2">${item.cat}</h4>
                                    <p class="text-white text-3xl font-black tracking-tighter group-hover:text-primary-400 transition-colors">${item.val}</p>
                                </div>
                                
                                <div class="flex items-center justify-between border-t border-slate-700/50 pt-6 mt-6">
                                     <div class="flex flex-col">
                                        <span class="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Rapiditate</span>
                                        <span class="text-sm font-black text-white">${item.speed} <span class="text-[10px] text-slate-500 font-normal">prod/zi</span></span>
                                     </div>
                                     <div class="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-600 group-hover:text-primary-500 group-hover:text-primary-500/10 transition-all shadow-inner">
                                        <span class="material-symbols-outlined text-xl">trending_up</span>
                                     </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- ROW 3: Chart -->
                <div class="w-full rounded-2xl border border-slate-700 bg-slate-800 p-8 shadow-2xl">
                    <div class="flex items-center justify-between mb-10">
                        <div class="flex flex-col gap-1">
                            <h3 class="font-black text-white text-2xl tracking-tight uppercase">Evoluție Inventar: Vândute vs Postate</h3>
                            <p class="text-sm text-slate-500">Analiza eficienței listărilor și a absorbției stocului în piață.</p>
                        </div>
                        <div class="flex gap-8 bg-slate-900/50 px-6 py-3 rounded-2xl border border-slate-700">
                            <div class="flex items-center gap-3">
                                <div class="h-3 w-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></div>
                                <span class="text-xs font-black text-slate-300 uppercase tracking-widest">SKU Vândute</span>
                            </div>
                            <div class="flex items-center gap-3">
                                <div class="h-3 w-3 rounded-full bg-primary-500 shadow-lg shadow-primary-500/50"></div>
                                <span class="text-xs font-black text-slate-300 uppercase tracking-widest">SKU Postate</span>
                            </div>
                        </div>
                    </div>
                    
                    <div id="stock-chart" class="h-[400px] w-full"></div>
                </div>
            </div>
            
            <!-- Modal Container (Hidden by default) -->
            <div id="modal-container" class="fixed inset-0 z-50 hidden flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in"></div>
        </div>
        `;
    };

    const mount = (withCategories = false) => {
        container.innerHTML = getHTML(withCategories);

        // Listeners
        const toggleBtn = document.getElementById('btn-toggle-cats');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                mount(!withCategories);
            });
        }

        container.querySelectorAll('.btn-liquidate').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.currentTarget.getAttribute('data-idx');
                const product = deadStock[idx];
                openModal(product);
            });
        });

        // Initialize Chart
        const options = {
            series: [{
                name: 'SKU Postate',
                data: skuTrendPosted
            }, {
                name: 'SKU Vândute',
                data: skuTrendSold
            }],
            chart: {
                type: 'area',
                height: 400,
                toolbar: { show: false },
                fontFamily: 'Inter, sans-serif'
            },
            colors: ['#3b82f6', '#10b981'],
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.4,
                    opacityTo: 0.05,
                    stops: [0, 90, 100]
                }
            },
            dataLabels: { enabled: false },
            stroke: { width: 4, curve: 'smooth' },
            xaxis: {
                categories: skuTrendMonths,
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
            },
            tooltip: {
                theme: 'dark',
            },
            legend: { show: false }
        };

        const chart = new ApexCharts(document.querySelector("#stock-chart"), options);
        chart.render();
    }

    mount(showAllCategories);

    // Modal Logic
    const openModal = (product) => {
        const modalContainer = document.getElementById('modal-container');
        modalContainer.classList.remove('hidden');

        let newPrice = product.cost_price * 0.85;

        const updateSimulation = () => {
            const commissionRate = 0.20;
            const cost = product.cost_price;
            const commissionVal = newPrice * commissionRate;
            const netMarginVal = newPrice - cost - commissionVal;
            const profitPercent = (netMarginVal / newPrice) * 100;

            document.getElementById('sim-commission').innerText = Math.round(commissionVal);
            const netEl = document.getElementById('sim-net');
            netEl.innerHTML = `${Math.round(netMarginVal)} ${netMarginVal < 0 ? '<span class="material-symbols-outlined text-2xl">warning</span>' : ''}`;
            netEl.className = `flex items-center justify-center gap-1 text-3xl font-bold ${netMarginVal >= 0 ? 'text-emerald-500' : 'text-red-500'}`;

            const percentEl = document.getElementById('sim-percent');
            percentEl.innerText = profitPercent.toFixed(2) + '%';
            percentEl.className = `font-bold ${profitPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`;
        }

        modalContainer.innerHTML = `
            <div class="w-full max-w-3xl rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl md:p-8" onclick="event.stopPropagation()">
                <!-- Header -->
                <div class="flex items-start gap-4 mb-8">
                    <div class="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-800">
                        <img src="${product.image_url}" alt="${product.name}" class="h-full w-full object-cover" />
                    </div>
                    <div>
                        <h2 class="text-xl font-bold text-white">${product.name}</h2>
                        <div class="mt-1 flex flex-wrap gap-2 text-xs text-slate-400">
                            <span class="rounded bg-red-500/20 px-2 py-0.5 text-red-300 border border-red-500/30">Status: ${product.status}</span>
                            <span>Stoc: <span class="font-medium text-slate-200">${product.stock_qty} buc</span></span>
                            <span>Cost Total: <span class="font-medium text-slate-200">${(product.stock_qty * product.cost_price).toLocaleString()} RON</span></span>
                        </div>
                    </div>
                </div>

                <!-- Simulator -->
                <div class="space-y-6 rounded-lg bg-slate-800/50 p-6 border border-slate-700/50">
                     <h3 class="text-sm font-medium text-center text-slate-400 uppercase tracking-wider pb-4 border-b border-slate-700">Simulator Discount & Preț</h3>
                     
                     <div class="flex flex-col md:flex-row items-center justify-around gap-4 pt-2">
                        <div class="text-center">
                            <div class="relative group">
                                <input 
                                    type="number" 
                                    id="input-price"
                                    value="${Math.round(newPrice)}" 
                                    class="w-32 border-0 border-b-2 border-slate-600 bg-transparent pb-1 text-center text-3xl font-bold text-white focus:border-primary-500 focus:outline-none"
                                />
                                <div class="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap border border-slate-600">
                                    Vechi: <s class="text-red-400">${product.retail_price} RON</s>
                                </div>
                            </div>
                            <label class="mt-2 block text-xs text-slate-400">Preț Vânzare Nou (RON)</label>
                        </div>

                        <span class="text-2xl font-light text-slate-600">-</span>

                        <div class="text-center opacity-70">
                            <p class="text-3xl font-semibold text-slate-400">${Math.round(product.cost_price)}</p>
                            <label class="mt-2 block text-xs text-slate-500">Cost Achiziție</label>
                        </div>

                        <span class="text-2xl font-light text-slate-600">-</span>

                        <div class="text-center opacity-70">
                             <p class="text-3xl font-semibold text-slate-400" id="sim-commission">0</p>
                             <label class="mt-2 block text-xs text-slate-500">Comision (20%)</label>
                        </div>

                        <span class="text-2xl font-light text-slate-600">=</span>

                        <div class="text-center">
                            <p id="sim-net" class="flex items-center justify-center gap-1 text-3xl font-bold text-red-500">
                                0
                            </p>
                            <label class="mt-2 block text-xs text-emerald-400">Marjă Netă Reală</label>
                        </div>
                     </div>
                    
                     <div class="flex justify-center pt-2">
                         <p class="text-sm text-slate-400">
                             Procent de Profit: <span id="sim-percent" class="font-bold text-red-400">0%</span>
                         </p>
                     </div>
                </div>

                <!-- Actions -->
                <div class="mt-8 flex items-center justify-between border-t border-slate-700 pt-6">
                    <button id="btn-reset" class="text-sm text-slate-400 hover:text-white">Resetează</button>
                    <div class="flex gap-4">
                        <button id="btn-close" class="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white">Anulează</button>
                        <button class="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-500 shadow-lg shadow-primary-600/20 transition-all">
                            Aplică Modificări
                        </button>
                    </div>
                </div>
            </div>
        `;

        updateSimulation();

        // Modal Listeners
        const inputPrice = document.getElementById('input-price');
        inputPrice.addEventListener('input', (e) => {
            newPrice = Number(e.target.value);
            updateSimulation();
        });

        document.getElementById('btn-close').onclick = () => {
            modalContainer.classList.add('hidden');
        };

        document.getElementById('btn-reset').onclick = () => {
            newPrice = product.cost_price * 0.85;
            inputPrice.value = Math.round(newPrice);
            updateSimulation();
        }
    };
};
