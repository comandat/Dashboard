import { store } from '../store.js';
import { confirmLiquidationStep1 } from '../api.js';

export const renderStock = (container, state) => {
    const health = state.inventoryHealth || { 
        status: 'N/A', message: 'Nu există date.', dead_stock_percentage: 0, 
        total_inventory_value_ron: 0, dead_stock_value_90plus_ron: 0 
    };
    
    // --- LOGICA DE SORTARE ---
    // Clonăm lista pentru a nu muta referințele din store
    let actionList = [...(state.deadStockActionList || [])];
    
    actionList.sort((a, b) => {
        // Verificăm dacă au status de lichidare setat (diferit de NULL sau NORMAL)
        const aInProgress = a.liquidation_status && a.liquidation_status !== 'NORMAL';
        const bInProgress = b.liquidation_status && b.liquidation_status !== 'NORMAL';

        // 1. Produsele care NU au început procesul apar primele (Urgent: Start Pas 1)
        if (!aInProgress && bInProgress) return -1;
        if (aInProgress && !bInProgress) return 1;
        
        // 2. Dacă ambele sunt în același stadiu, sortăm după valoarea blocată (descrescător)
        return b.blocked_value - a.blocked_value;
    });

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
                    <p class="text-slate-400 mt-2 text-lg">Analiză FIFO a vechimii stocului și identificare prețuri minime active.</p>
                    
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
                            ${health.dead_stock_percentage}% din total
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
                                <p class="text-xs text-slate-500 font-bold uppercase tracking-widest">
                                    <span class="text-emerald-400">● De Verificat</span> &nbsp;|&nbsp; 
                                    <span class="text-slate-500">● În Monitorizare</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="w-full overflow-x-auto">
                        <div class="max-h-[600px] overflow-y-auto custom-scrollbar">
                            <table class="w-full text-left border-collapse">
                                <thead class="sticky top-0 bg-slate-900 z-20 shadow-md">
                                    <tr class="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">
                                        <th class="px-4 py-5 border-b border-slate-700 text-center w-16">#</th>
                                        <th class="px-8 py-5 border-b border-slate-700">SKU</th>
                                        <th class="px-8 py-5 border-b border-slate-700">Acțiune Lichidare</th>
                                        <th class="px-8 py-5 border-b border-slate-700 text-center">Zile in Stoc</th>
                                        <th class="px-8 py-5 border-b border-slate-700 text-right">Bani Blocați</th>
                                        <th class="px-8 py-5 border-b border-slate-700 text-center">Preț Curent</th>
                                        <th class="px-8 py-5 border-b border-slate-700"></th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-700/50">
                                    ${actionList.length === 0 ? `
                                        <tr><td colspan="7" class="px-8 py-12 text-center text-slate-500 italic text-lg">Stoc curat. Nu există produse stagnante.</td></tr>
                                    ` : actionList.map((item, index) => {
                                        const minPrice = item.min_sale_price || 0;
                                        
                                        // Conditional color for days
                                        let daysColor = 'text-slate-400';
                                        if (item.days_in_stock >= 90) daysColor = 'text-red-500 font-black';
                                        else if (item.days_in_stock >= 45) daysColor = 'text-yellow-500 font-bold';

                                        // --- LOGICA STATUS LICHIDARE ---
                                        const liqStatus = item.liquidation_status || 'NORMAL'; 
                                        let actionContent = '';
                                        
                                        // Calcul zile de la activare Pas 1
                                        // Dacă step1_applied_at vine ca string ISO din backend
                                        const daysSinceStep1 = item.step1_applied_at 
                                            ? Math.floor((new Date() - new Date(item.step1_applied_at)) / (1000 * 60 * 60 * 24)) 
                                            : 0;
                                        
                                        // Timer-ul de 30 de zile
                                        const remainingDays = Math.max(0, 30 - daysSinceStep1);

                                        if (liqStatus === 'NORMAL' || !item.step1_applied_at) {
                                            // CAZ 1: Nu a început procesul -> Buton Start Pas 1
                                            actionContent = `
                                                <button class="btn-step1 group flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-[10px] font-black uppercase text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20" data-idx="${index}">
                                                    <span class="material-symbols-outlined text-base">playlist_add_check</span>
                                                    Start Pas 1
                                                </button>
                                            `;
                                        } else if (liqStatus === 'STEP_1_ACTIVE') {
                                            // CAZ 2: Pas 1 Activ -> Arătăm Timer
                                            const isUrgent = remainingDays <= 5;
                                            actionContent = `
                                                <div class="flex flex-col items-start gap-1 p-2 rounded-lg bg-slate-700/30 border border-slate-600/30">
                                                    <div class="flex items-center gap-2">
                                                        <span class="h-2 w-2 rounded-full ${isUrgent ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}"></span>
                                                        <span class="text-[10px] font-bold text-white uppercase tracking-wide">Pas 1 Activ</span>
                                                    </div>
                                                    <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                                        ${remainingDays > 0 ? `${remainingDays} zile rămase` : `Așteptare Pas 2...`}
                                                    </span>
                                                </div>
                                            `;
                                        } else {
                                            // CAZ 3: Pas 2 (Automatizare) -> Arătăm statusul reducerii
                                            // Mapăm codurile din DB la texte user-friendly
                                            let badgeColor = 'bg-amber-500/20 text-amber-500 border-amber-500/20';
                                            let label = liqStatus.replace('STEP_2_', '');
                                            
                                            if (liqStatus === 'STEP_2_FINAL') {
                                                badgeColor = 'bg-red-500/20 text-red-500 border-red-500/20';
                                                label = 'LICHIDARE TOTALĂ';
                                            } else if (liqStatus.includes('DISCOUNT')) {
                                                label = `REDUCERE AUTOMATĂ ${liqStatus.includes('1') ? '1' : '2'}`;
                                            }

                                            actionContent = `
                                                <div class="flex flex-col items-start gap-1">
                                                    <span class="px-2 py-1 rounded text-[9px] font-black uppercase border ${badgeColor}">
                                                        ${label}
                                                    </span>
                                                    <span class="text-[9px] text-slate-500 font-mono">Ziua ${daysSinceStep1}</span>
                                                </div>
                                            `;
                                        }

                                        // Highlight rând dacă e în progres (opțional)
                                        const rowClass = (liqStatus !== 'NORMAL') ? 'opacity-70 grayscale-[30%]' : '';

                                        return `
                                        <tr class="hover:bg-slate-700/30 transition-all group bg-slate-800/20 ${rowClass}">
                                            <td class="px-4 py-5 text-center">
                                                <span class="text-xs font-black text-slate-500">
                                                    ${index + 1}
                                                </span>
                                            </td>
                                            <td class="px-8 py-5">
                                                <div class="flex flex-col">
                                                    <span class="text-lg font-black text-white group-hover:text-primary-400 transition-colors font-mono tracking-wider">
                                                        ${item.sku}
                                                    </span>
                                                    <span class="text-[10px] text-slate-400 mt-1">Stoc: <b class="text-white">${item.total_quantity}</b> buc</span>
                                                </div>
                                            </td>
                                            <td class="px-8 py-5">
                                                ${actionContent}
                                            </td>
                                            <td class="px-8 py-5 text-center">
                                                <div class="inline-flex items-center justify-center h-10 w-10 rounded-full bg-slate-900 border border-slate-700 ${daysColor}">
                                                    ${item.days_in_stock}
                                                </div>
                                            </td>
                                            <td class="px-8 py-5 text-right">
                                                <p class="text-lg font-black text-white tracking-tight">
                                                    ${item.blocked_value.toLocaleString('ro-RO')} <span class="text-xs text-slate-500">RON</span>
                                                </p>
                                            </td>
                                            <td class="px-8 py-5 text-center">
                                                ${minPrice > 0 
                                                    ? `<span class="text-sm font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">${minPrice.toFixed(2)} RON</span>` 
                                                    : `<span class="text-xs font-bold text-slate-600">N/A</span>`
                                                }
                                            </td>
                                            <td class="px-8 py-5 text-right">
                                                <button class="btn-simulate opacity-0 group-hover:opacity-100 transition-all rounded-xl bg-slate-700 border border-slate-600 px-4 py-2 text-xs font-bold text-white hover:bg-primary-600 hover:border-primary-500 shadow-lg" data-idx="${index}">
                                                    Simulator
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

    // Event Listeners

    container.querySelectorAll('.btn-simulate').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = e.currentTarget.getAttribute('data-idx');
            // Atenție: actionList este sortată, deci indexul corespunde listei sortate
            openSimulationModal(actionList[idx]);
        });
    });

    container.querySelectorAll('.btn-step1').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = e.currentTarget.getAttribute('data-idx');
            openChecklistModal(actionList[idx]);
        });
    });

    // --- MODAL CHECKLIST (PAS 1) ---
    const openChecklistModal = (product) => {
        const modalContainer = document.getElementById('modal-container');
        modalContainer.classList.remove('hidden');

        // CALCULĂM VALORILE ÎNGHEȚATE
        const totalBlocked = parseFloat(product.blocked_value) || 0;
        const totalQty = parseFloat(product.total_quantity) || 1;
        const unitCogs = (totalBlocked / totalQty).toFixed(2);
        const currentPrice = parseFloat(product.min_sale_price || 0).toFixed(2);

        modalContainer.innerHTML = `
            <div class="w-full max-w-lg rounded-[2rem] border border-slate-700 bg-slate-900 p-8 shadow-2xl relative overflow-hidden animate-fade-in" onclick="event.stopPropagation()">
                <div class="mb-6 border-b border-slate-700 pb-4">
                    <div class="inline-flex items-center gap-2 mb-2">
                        <span class="material-symbols-outlined text-amber-500">assignment_turned_in</span>
                        <h2 class="text-xl font-black text-white uppercase tracking-tight">Verificare Pas 1</h2>
                    </div>
                    <p class="text-sm text-slate-400">Pentru SKU: <b class="text-white font-mono">${product.sku}</b></p>
                    
                    <div class="mt-4 flex gap-4 text-xs bg-slate-800/50 border border-slate-700 p-3 rounded-xl">
                        <div>
                            <span class="text-slate-500 uppercase font-bold text-[10px]">COGS Unitar</span>
                            <div class="text-white font-black text-base">${unitCogs} RON</div>
                        </div>
                        <div>
                            <span class="text-slate-500 uppercase font-bold text-[10px]">Preț Start</span>
                            <div class="text-white font-black text-base">${currentPrice} RON</div>
                        </div>
                    </div>
                    <p class="text-[10px] text-slate-500 mt-2 italic">Confirmarea îngheață aceste costuri și activează numărătoarea inversă (30 zile).</p>
                </div>

                <form id="step1-form" class="space-y-3">
                    <label class="flex items-center gap-4 p-4 rounded-xl bg-slate-800 border border-slate-700 cursor-pointer hover:border-primary-500 transition-colors group">
                        <input type="checkbox" name="platforms" class="w-5 h-5 rounded border-slate-600 bg-slate-900 text-primary-600 focus:ring-0 cursor-pointer" required>
                        <span class="text-xs font-bold text-white group-hover:text-primary-400 transition-colors">Produsul este pe toate platformele?</span>
                    </label>
                    
                    <label class="flex items-center gap-4 p-4 rounded-xl bg-slate-800 border border-slate-700 cursor-pointer hover:border-primary-500 transition-colors group">
                        <input type="checkbox" name="title" class="w-5 h-5 rounded border-slate-600 bg-slate-900 text-primary-600 focus:ring-0 cursor-pointer" required>
                        <span class="text-xs font-bold text-white group-hover:text-primary-400 transition-colors">Titlul este optimizat?</span>
                    </label>

                    <label class="flex items-center gap-4 p-4 rounded-xl bg-slate-800 border border-slate-700 cursor-pointer hover:border-primary-500 transition-colors group">
                        <input type="checkbox" name="description" class="w-5 h-5 rounded border-slate-600 bg-slate-900 text-primary-600 focus:ring-0 cursor-pointer" required>
                        <span class="text-xs font-bold text-white group-hover:text-primary-400 transition-colors">Descrierea este completă?</span>
                    </label>

                    <label class="flex items-center gap-4 p-4 rounded-xl bg-slate-800 border border-slate-700 cursor-pointer hover:border-primary-500 transition-colors group">
                        <input type="checkbox" name="specs" class="w-5 h-5 rounded border-slate-600 bg-slate-900 text-primary-600 focus:ring-0 cursor-pointer" required>
                        <span class="text-xs font-bold text-white group-hover:text-primary-400 transition-colors">Caracteristicile sunt completate?</span>
                    </label>

                    <label class="flex items-center gap-4 p-4 rounded-xl bg-slate-800 border border-slate-700 cursor-pointer hover:border-primary-500 transition-colors group">
                        <input type="checkbox" name="price" class="w-5 h-5 rounded border-slate-600 bg-slate-900 text-primary-600 focus:ring-0 cursor-pointer" required>
                        <span class="text-xs font-bold text-white group-hover:text-primary-400 transition-colors">Prețul este corect (vs piață)?</span>
                    </label>

                    <div class="pt-6 flex gap-3">
                        <button type="button" id="btn-cancel-check" class="flex-1 py-3 rounded-xl border border-slate-600 text-slate-400 font-bold uppercase hover:text-white hover:bg-slate-800 transition-all text-xs tracking-wider">Anulează</button>
                        <button type="submit" id="btn-confirm-check" class="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-black uppercase hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:grayscale transition-all text-xs tracking-wider flex items-center justify-center gap-2">
                            <span>Confirmă & Start</span>
                        </button>
                    </div>
                </form>
            </div>
        `;

        const form = document.getElementById('step1-form');
        const submitBtn = document.getElementById('btn-confirm-check');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            submitBtn.setAttribute('disabled', 'true');
            submitBtn.innerHTML = `<span class="material-symbols-outlined animate-spin text-sm">sync</span> Se Procesează...`;
            
            const formData = new FormData(form);
            const checks = {
                platforms: formData.has('platforms'),
                title: formData.has('title'),
                description: formData.has('description'),
                specs: formData.has('specs'),
                price: formData.has('price')
            };

            const payload = {
                checks: checks,
                cogs: Number(unitCogs),
                initial_price: Number(currentPrice)
            };

            try {
                await confirmLiquidationStep1(product.sku, payload);
                modalContainer.classList.add('hidden');
                await store.init();
            } catch (err) {
                console.error(err);
                alert("Eroare la salvare. Verifică conexiunea.");
                submitBtn.removeAttribute('disabled');
                submitBtn.innerHTML = "Confirmă & Start";
            }
        });

        document.getElementById('btn-cancel-check').onclick = () => modalContainer.classList.add('hidden');
        modalContainer.onclick = (e) => { if(e.target === modalContainer) modalContainer.classList.add('hidden'); };
    };

    // --- MODAL SIMULATOR (Standard) ---
    const openSimulationModal = (product) => {
        const modalContainer = document.getElementById('modal-container');
        modalContainer.classList.remove('hidden');

        const unitCost = product.blocked_value / product.total_quantity;
        const currentSellingPrice = product.min_sale_price || 0;
        let initialPrice = currentSellingPrice > 0 ? currentSellingPrice : (unitCost * 1.1);

        const updateSimulation = () => {
            const price = parseFloat(document.getElementById('input-price').value) || 0;
            const quantity = product.total_quantity;
            
            const revenue = price * quantity;
            const commission = revenue * 0.20; 
            const totalCost = unitCost * quantity;
            const profit = revenue - commission - totalCost;

            document.getElementById('sim-revenue').innerText = Math.round(revenue).toLocaleString();
            document.getElementById('sim-commission').innerText = Math.round(commission).toLocaleString();
            
            const profitEl = document.getElementById('sim-profit');
            profitEl.innerHTML = `${Math.round(profit).toLocaleString()} <span class="text-xs">RON</span>`;
            profitEl.className = `text-2xl font-black ${profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`;
        };

        modalContainer.innerHTML = `
            <div class="w-full max-w-2xl rounded-[2rem] border border-slate-700 bg-slate-900 p-8 shadow-2xl relative overflow-hidden" onclick="event.stopPropagation()">
                <div class="text-center mb-8">
                    <div class="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 mb-4">
                        <span class="text-xs font-black uppercase tracking-widest text-slate-400">SIMULATOR PREȚ</span>
                    </div>
                    <h2 class="text-4xl font-black text-white leading-tight mb-2 font-mono tracking-tighter">${product.sku}</h2>
                    <p class="text-sm text-slate-500">Cantitate: <b class="text-white">${product.total_quantity} buc</b> | Cost Total: <b class="text-white">${Math.round(product.blocked_value)} RON</b></p>
                </div>

                <div class="bg-slate-800/50 rounded-3xl p-8 border border-slate-700/50">
                    <div class="flex flex-col items-center mb-8">
                        <label class="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Preț Vânzare Unitar</label>
                        <div class="relative">
                            <input type="number" id="input-price" value="${initialPrice.toFixed(2)}" class="w-40 bg-transparent border-b-2 border-primary-500 text-center text-5xl font-black text-white focus:outline-none py-2" />
                            <span class="absolute top-4 -right-8 text-lg font-bold text-slate-600">RON</span>
                        </div>
                    </div>

                    <div class="grid grid-cols-3 gap-4 text-center border-t border-slate-700/50 pt-6">
                        <div>
                            <p class="text-xs text-slate-500 uppercase tracking-widest mb-1">Venit Total</p>
                            <p class="text-xl font-black text-white" id="sim-revenue">0</p>
                            <span class="text-[10px] text-slate-600 font-bold">RON</span>
                        </div>
                        <div>
                            <p class="text-xs text-slate-500 uppercase tracking-widest mb-1">Comision Plătit</p>
                            <p class="text-xl font-bold text-red-300" id="sim-commission">0</p>
                            <span class="text-[10px] text-slate-600 font-bold">RON (20%)</span>
                        </div>
                        <div>
                            <p class="text-xs text-slate-500 uppercase tracking-widest mb-1">Profit Final</p>
                            <div id="sim-profit">0</div>
                        </div>
                    </div>
                </div>

                <div class="mt-8 flex justify-center">
                    <button id="btn-close-modal" class="text-sm font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest">Închide</button>
                </div>
            </div>
        `;

        setTimeout(updateSimulation, 0);
        document.getElementById('input-price').addEventListener('input', updateSimulation);
        document.getElementById('btn-close-modal').onclick = () => modalContainer.classList.add('hidden');
        modalContainer.onclick = (e) => { if(e.target === modalContainer) modalContainer.classList.add('hidden'); };
    };
};
