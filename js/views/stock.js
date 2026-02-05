/**
 * Stock View - Dead Stock Analysis & Action Plan
 */
import { store } from '../store.js';

export const renderStock = (container, state) => {
    // Preluăm noile date din state
    const health = state.inventoryHealth || { 
        status: 'N/A', 
        message: 'Nu există date.', 
        dead_stock_percentage: 0, 
        total_inventory_value_ron: 0, 
        dead_stock_value_90plus_ron: 0 
    };
    
    const actionList = state.deadStockActionList || [];

    // Funcție pentru culoarea statusului
    const getStatusColor = (status) => {
        if (status === 'CRITIC') return 'text-red-500 bg-red-500/10 border-red-500/20';
        if (status === 'WARNING') return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    };

    const getHTML = () => {
        return `
        <div class="mx-auto max-w-[1600px] pb-12 w-full px-2">
            <div class="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div class="lg:col-span-2">
                    <h1 class="text-4xl font-black text-white tracking-tight uppercase">Stoc & Lichidare</h1>
                    <p class="text-slate-400 mt-2 text-lg">Analiză FIFO a vechimii stocului și impactul asupra Cash-Flow-ului.</p>
                    
                    <div class="mt-8 rounded-2xl border p-6 flex items-start gap-4 ${getStatusColor(health.status)}">
                        <span class="material-symbols-outlined text-4xl animate-pulse">
                            ${health.status === 'CRITIC' ? 'gpp_bad' : health.status === 'WARNING' ? 'warning' : 'check_circle'}
                        </span>
                        <div>
                            <h2 class="text-xl font-black uppercase tracking-widest mb-1">Status Cash-Flow: ${health.status}</h2>
                            <p class="text-base font-bold opacity-90">${health.message}</p>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 gap-4">
                    <div class="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-xl relative overflow-hidden group">
                        <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span class="material-symbols-outlined text-6xl text-slate-400">inventory</span>
                        </div>
                        <p class="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Valoare Totală Stoc (FIFO)</p>
                        <p class="text-3xl font-black text-white tracking-tight">
                            ${health.total_inventory_value_ron.toLocaleString('ro-RO')} <span class="text-sm text-slate-500 font-bold">RON</span>
                        </p>
                    </div>

                    <div class="rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-xl relative overflow-hidden group">
                         <div class="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span class="material-symbols-outlined text-6xl text-red-500">money_off</span>
                        </div>
                        <p class="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Bani Blocați (> 90 Zile)</p>
                        <p class="text-3xl font-black text-white tracking-tight">
                            ${health.dead_stock_value_90plus_ron.toLocaleString('ro-RO')} <span class="text-sm text-slate-500 font-bold">RON</span>
                        </p>
                        <div class="mt-2 h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                            <div class="h-full ${health.dead_stock_percentage > 20 ? 'bg-red-500' : 'bg-emerald-500'}" style="width: ${Math.min(health.dead_stock_percentage, 100)}%"></div>
                        </div>
                        <p class="text-[10px] text-right mt-1 font-bold ${health.dead_stock_percentage > 20 ? 'text-red-400' : 'text-emerald-400'}">
                            ${health.dead_stock_percentage}% din total (Target < 20%)
                        </p>
                    </div>
                </div>
            </div>

            <div class="flex flex-col gap-8">
                <div class="w-full rounded-[2.5rem] border border-slate-700 bg-slate-800 overflow-hidden shadow-2xl">
                    <div class="px-8 py-6 border-b border-slate-700 bg-slate-800/80 flex flex-wrap items-center justify-between gap-4">
                        <div class="flex items-center gap-3">
                            <div class="h-10 w-10 flex items-center justify-center rounded-xl bg-primary-600/20 text-primary-500">
                                <span class="material-symbols-outlined">priority_high</span>
                            </div>
                            <div>
                                <h2 class="text-xl font-black text-white uppercase tracking-tight">Plan de Acțiune Prioritizat</h2>
                                <p class="text-xs text-slate-500 font-bold uppercase tracking-widest">Sortat după: Bani Blocați x Timp în Stoc</p>
                            </div>
                        </div>
                        <div class="flex gap-2">
                             <span class="px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase">PAS 2: Lichidare (>90 zile)</span>
                             <span class="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase">PAS 1: Optimizare (>45 zile)</span>
                        </div>
                    </div>

                    <div class="w-full overflow-x-auto">
                        <div class="max-h-[600px] overflow-y-auto custom-scrollbar">
                            <table class="w-full text-left border-collapse">
                                <thead class="sticky top-0 bg-slate-900 z-20 shadow-md">
                                    <tr class="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">
                                        <th class="px-8 py-5 border-b border-slate-700">Produs / SKU</th>
                                        <th class="px-8 py-5 border-b border-slate-700">Acțiune Necesară</th>
                                        <th class="px-8 py-5 border-b border-slate-700 text-center">Vechime Lot (Zile)</th>
                                        <th class="px-8 py-5 border-b border-slate-700 text-right">Bani Blocați</th>
                                        <th class="px-8 py-5 border-b border-slate-700 text-center">Scor Prioritate</th>
                                        <th class="px-8 py-5 border-b border-slate-700"></th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-700/50">
                                    ${actionList.length === 0 ? `
                                        <tr><td colspan="6" class="px-8 py-12 text-center text-slate-500 italic text-lg">Felicitări! Nu există produse stagnante (> 45 zile).</td></tr>
                                    ` : actionList.map((item, index) => {
                                        // Determinam stilul in functie de Pas
                                        const isPas2 = item.action_step === 'PAS 2';
                                        const badgeColor = isPas2 ? 'bg-red-500 text-white shadow-red-500/30' : 'bg-amber-500 text-white shadow-amber-500/30';
                                        const borderColor = isPas2 ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-amber-500';

                                        return `
                                        <tr class="hover:bg-slate-700/30 transition-all group ${borderColor} bg-slate-800/20">
                                            <td class="px-8 py-5">
                                                <div class="flex flex-col">
                                                    <span class="text-sm font-black text-white group-hover:text-primary-400 transition-colors line-clamp-2" title="${item.product_name}">
                                                        ${item.product_name}
                                                    </span>
                                                    <span class="text-[10px] text-slate-500 font-mono mt-1 tracking-wider bg-slate-900 px-2 py-0.5 rounded w-fit">
                                                        ${item.sku}
                                                    </span>
                                                    <span class="text-[10px] text-slate-400 mt-1">
                                                        Stoc Total: <b class="text-white">${item.total_quantity}</b> buc
                                                    </span>
                                                </div>
                                            </td>
                                            <td class="px-8 py-5">
                                                <div class="flex flex-col items-start gap-1">
                                                    <span class="px-3 py-1 rounded-md text-[10px] font-black uppercase shadow-lg ${badgeColor}">
                                                        ${item.action_step}
                                                    </span>
                                                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                                        ${item.action_details}
                                                    </span>
                                                </div>
                                            </td>
                                            <td class="px-8 py-5 text-center">
                                                <div class="inline-flex flex-col items-center justify-center h-12 w-12 rounded-full border-2 ${isPas2 ? 'border-red-500 text-red-500' : 'border-amber-500 text-amber-500'} bg-slate-900 font-black text-sm shadow-inner">
                                                    ${item.days_in_stock}
                                                </div>
                                            </td>
                                            <td class="px-8 py-5 text-right">
                                                <p class="text-lg font-black text-white tracking-tight">
                                                    ${item.blocked_value.toLocaleString('ro-RO')} <span class="text-xs text-slate-500">RON</span>
                                                </p>
                                            </td>
                                            <td class="px-8 py-5 text-center">
                                                <span class="text-xs font-mono font-bold text-slate-600 group-hover:text-slate-400 transition-colors">
                                                    ${item.priority_score.toLocaleString()} pts
                                                </span>
                                            </td>
                                            <td class="px-8 py-5 text-right">
                                                <button 
                                                    class="btn-simulate opacity-0 group-hover:opacity-100 transition-all rounded-xl bg-slate-700 border border-slate-600 px-4 py-2 text-xs font-bold text-white hover:bg-primary-600 hover:border-primary-500 shadow-lg"
                                                    data-idx="${index}"
                                                >
                                                    Simulare Preț
                                                </button>
                                            </td>
                                        </tr>
                                    `}).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            
            <div id="modal-container" class="fixed inset-0 z-50 hidden flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in"></div>
        </div>
        `;
    };

    container.innerHTML = getHTML();

    // --- LOGICA MODALĂ DE SIMULARE ---
    container.querySelectorAll('.btn-simulate').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = e.currentTarget.getAttribute('data-idx');
            const product = actionList[idx];
            openSimulationModal(product);
        });
    });

    const openSimulationModal = (product) => {
        const modalContainer = document.getElementById('modal-container');
        modalContainer.classList.remove('hidden');

        // Calculăm costul unitar mediu pentru simulare
        const unitCost = product.blocked_value / product.total_quantity;
        
        // Dacă e PAS 2 (Lichidare), propunem reducere mare (-25% sub cost sau agresiv)
        // Dacă e PAS 1, propunem o reducere mică
        let suggestedPrice = unitCost * (product.action_step === 'PAS 2' ? 0.9 : 1.1); 

        const updateSimulation = () => {
            const price = parseFloat(document.getElementById('input-price').value) || 0;
            const commissionRate = 0.20; // eMAG/Marketplace approx
            const commissionVal = price * commissionRate;
            const netVal = price - unitCost - commissionVal;
            const profitPercent = price > 0 ? (netVal / price) * 100 : -100;
            
            const totalRecovered = price * product.total_quantity;
            const totalLoss = netVal * product.total_quantity;

            // Update UI
            document.getElementById('sim-commission').innerText = Math.round(commissionVal);
            
            const netEl = document.getElementById('sim-net');
            netEl.innerHTML = `${Math.round(netVal)} RON`;
            netEl.className = `text-3xl font-black ${netVal >= 0 ? 'text-emerald-500' : 'text-red-500'}`;

            const percEl = document.getElementById('sim-percent');
            percEl.innerText = profitPercent.toFixed(1) + '%';
            percEl.className = `font-bold ${profitPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`;

            document.getElementById('sim-total-recovered').innerText = Math.round(totalRecovered).toLocaleString();
            document.getElementById('sim-total-loss').innerText = Math.round(totalLoss).toLocaleString();
        };

        modalContainer.innerHTML = `
            <div class="w-full max-w-2xl rounded-[2rem] border border-slate-700 bg-slate-900 p-8 shadow-2xl relative overflow-hidden" onclick="event.stopPropagation()">
                <div class="text-center mb-8">
                    <div class="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 mb-4">
                        <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">${product.sku}</span>
                    </div>
                    <h2 class="text-2xl font-black text-white leading-tight mb-2">${product.product_name}</h2>
                    <p class="text-sm text-slate-500">
                        Stoc: <b class="text-white">${product.total_quantity} buc</b> | 
                        Cost Unitar: <b class="text-white">${Math.round(unitCost)} RON</b>
                    </p>
                </div>

                <div class="bg-slate-800/50 rounded-3xl p-8 border border-slate-700/50">
                    <div class="flex items-end justify-center gap-2 mb-8">
                        <div class="flex flex-col items-center">
                            <label class="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Preț Vânzare Propus</label>
                            <div class="relative">
                                <input type="number" id="input-price" value="${Math.round(suggestedPrice)}" 
                                    class="w-40 bg-transparent border-b-2 border-primary-500 text-center text-5xl font-black text-white focus:outline-none py-2" />
                                <span class="absolute top-4 -right-8 text-lg font-bold text-slate-600">RON</span>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-3 gap-4 text-center border-t border-slate-700/50 pt-6">
                        <div>
                            <p class="text-xs text-slate-500 uppercase tracking-widest mb-1">Cost Produs</p>
                            <p class="text-xl font-bold text-slate-300">-${Math.round(unitCost)}</p>
                        </div>
                        <div>
                            <p class="text-xs text-slate-500 uppercase tracking-widest mb-1">Comision (~20%)</p>
                            <p class="text-xl font-bold text-slate-300" id="sim-commission">0</p>
                        </div>
                        <div>
                            <p class="text-xs text-slate-500 uppercase tracking-widest mb-1">Rezultat Net / Buc</p>
                            <div id="sim-net">0</div>
                            <div id="sim-percent">0%</div>
                        </div>
                    </div>
                </div>

                <div class="mt-8 grid grid-cols-2 gap-4">
                    <div class="rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-4 text-center">
                        <p class="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Cash Recuperat Total</p>
                        <p class="text-2xl font-black text-emerald-400" id="sim-total-recovered">0</p>
                        <p class="text-[10px] text-emerald-600/60 font-bold">RON (estimat)</p>
                    </div>
                    <div class="rounded-xl bg-slate-800 border border-slate-700 p-4 text-center">
                        <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Impact Profit Total</p>
                        <p class="text-2xl font-black text-slate-300" id="sim-total-loss">0</p>
                        <p class="text-[10px] text-slate-600 font-bold">RON</p>
                    </div>
                </div>

                <div class="mt-8 flex justify-center">
                    <button id="btn-close-modal" class="text-sm font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest">
                        Închide Simulatorul
                    </button>
                </div>
            </div>
        `;

        // Initialize values
        setTimeout(updateSimulation, 0);

        // Listeners
        const input = document.getElementById('input-price');
        input.addEventListener('input', updateSimulation);
        
        document.getElementById('btn-close-modal').onclick = () => {
            modalContainer.classList.add('hidden');
        };
        modalContainer.onclick = (e) => {
            if(e.target === modalContainer) modalContainer.classList.add('hidden');
        };
    };
};
