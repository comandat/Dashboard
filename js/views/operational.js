/**
 * Operational View
 */
import { store } from '../store.js';

export const renderOperational = (container, state) => {
    const orders = state.operationalOrders;

    // Initial state: first order expanded (mock)
    let expandedOrderId = orders.length > 0 ? orders[0].id : null;

    const getHTML = () => {
        return `
        <div class="mx-auto max-w-7xl">
        <header class="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
            <h1 class="text-3xl font-black tracking-tight text-white">Rezolvare Blocaje</h1>
            <p class="mt-2 text-slate-400">Rezolvați blocajele operaționale zilnice și gestionați sarcinile urgente.</p>
            </div>
            <div class="flex items-center gap-2 text-sm text-slate-500">
            <span class="material-symbols-outlined text-base">update</span>
            <span>Ultima actualizare: chiar acum</span>
            <button class="ml-2 rounded p-2 hover:bg-slate-800 hover:text-white transition-colors">
                <span class="material-symbols-outlined">refresh</span>
            </button>
            </div>
        </header>

        <div class="flex flex-col rounded-xl bg-slate-800 shadow-sm border border-slate-700 overflow-hidden">
            <div class="px-6 py-5 border-b border-slate-700">
            <h2 class="text-xl font-bold text-white">Comenzi Urgente</h2>
            <p class="mt-1 text-sm text-slate-400">Comenzi blocate în status 'Primită' de mai mult de 24 de ore.</p>
            </div>

            <div class="overflow-x-auto">
            <table class="w-full text-left">
                <thead>
                <tr class="border-b border-slate-700 bg-slate-800/50">
                    <th class="w-1/4 px-6 py-4 text-sm font-semibold text-slate-400">ID Comandă</th>
                    <th class="w-1/4 px-6 py-4 text-sm font-semibold text-slate-400">Client</th>
                    <th class="w-1/4 px-6 py-4 text-sm font-semibold text-slate-400">Alertă</th>
                    <th class="w-1/4 px-6 py-4 text-sm font-semibold text-slate-400">Timp în Status</th>
                </tr>
                </thead>
                <tbody class="divide-y divide-slate-700" id="orders-body">
                    <!-- Rendered via loop below -->
                </tbody>
            </table>
            </div>
        </div>
        </div>
        `;
    };

    const renderRows = () => {
        const tbody = document.getElementById('orders-body');
        if (!tbody) return;

        tbody.innerHTML = orders.map(order => {
            const isExpanded = expandedOrderId === order.id;
            return `
                <tr 
                   data-id="${order.id}"
                   class="cursor-pointer transition-colors hover:bg-slate-700/30 ${isExpanded ? 'bg-slate-700/20' : ''}"
                >
                    <td class="px-6 py-4 text-sm font-medium text-white">${order.id}</td>
                    <td class="px-6 py-4 text-sm text-slate-300">${order.client_name}</td>
                    <td class="px-6 py-4">
                        <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${order.alert.includes('48h')
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-amber-500/20 text-amber-400'
                }">
                            ${order.alert}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-slate-300 flex items-center justify-between">
                        ${order.time_in_status} ore
                        <span class="material-symbols-outlined text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}">expand_more</span>
                    </td>
                </tr>
                
                ${isExpanded ? `
                    <tr class="bg-slate-900/30">
                        <td colSpan="4" class="p-0">
                            <div class="p-6">
                                <div class="rounded-lg border border-slate-700 bg-slate-800 p-4">
                                    <h4 class="mb-3 text-xs font-bold uppercase text-slate-500 tracking-wider">Produse în comandă</h4>
                                    <table class="w-full text-left">
                                        <thead>
                                            <tr class="border-b border-slate-700 text-xs text-slate-500">
                                                <th class="pb-2 font-medium w-16">Imagine</th>
                                                <th class="pb-2 font-medium">SKU</th>
                                                <th class="pb-2 font-medium">Nume Produs</th>
                                                <th class="pb-2 font-medium text-right">Cantitate</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-slate-700/50">
                                            ${order.items.map(item => `
                                                <tr>
                                                    <td class="py-3">
                                                        <img src="${item.image_url}" alt="${item.name}" class="h-10 w-10 rounded object-cover bg-slate-700" />
                                                    </td>
                                                    <td class="py-3 text-sm text-slate-300">${item.sku}</td>
                                                    <td class="py-3 text-sm text-slate-300">${item.name}</td>
                                                    <td class="py-3 text-sm text-slate-300 text-right">${item.quantity}</td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                    <div class="mt-4 flex justify-end gap-3">
                                        <button class="rounded-md border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700">Contactează Client</button>
                                        <button class="rounded-md bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-500">Forțează Expediere</button>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                ` : ''}
            `;
        }).join('');

        // Re-attach listeners
        tbody.querySelectorAll('tr[data-id]').forEach(row => {
            row.addEventListener('click', (e) => {
                // Prevent collapsing if clicking inside the expanded details (which is a different tr, but safety first)
                if (e.target.closest('.rounded-lg')) return;

                const id = row.getAttribute('data-id');
                expandedOrderId = (expandedOrderId === id) ? null : id;
                renderRows();
            });
        });
    };

    container.innerHTML = getHTML();
    renderRows();
};
