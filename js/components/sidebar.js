import { store } from '../store.js';

export const renderSidebar = (currentView) => {
    const aside = document.createElement('aside');
    aside.className = "w-64 bg-slate-900 border-r border-slate-700 h-full flex flex-col pt-6 shrink-0 z-40 relative";

    aside.innerHTML = `
        <div class="px-8 pb-8 flex items-center gap-3">
             <div class="h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 shadow-lg shadow-primary-500/20">
                <span class="material-symbols-outlined text-white text-2xl">grid_view</span>
             </div>
             <div>
                <h1 class="text-xl font-black text-white tracking-tighter uppercase">Comandat</h1>
                <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Dash v2.0</p>
             </div>
        </div>
    `;

    const nav = document.createElement('nav');
    nav.className = "flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar";

    const menuItems = [
        { id: 'dashboard', label: 'Bord Operațional', icon: 'dashboard', badge: null },
        { id: 'financial', label: 'Financiar', icon: 'payments', badge: null },
        { id: 'stock', label: 'Stoc & Lichidare', icon: 'inventory_2', badge: null },
        { id: 'operational', label: 'Rezolvare Blocaje (În construire)', icon: 'rule', badge: null },
        { id: 'reports', label: 'Rapoarte', icon: 'bar_chart', badge: null },
    ];

    menuItems.forEach(item => {
        const isActive = currentView === item.id;
        const button = document.createElement('button');
        button.className = `w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${isActive
                ? 'bg-primary-600 text-white shadow-xl shadow-primary-600/30 translate-x-1'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`;

        button.innerHTML = `
            <div class="flex items-center gap-3 relative z-10">
                <span class="material-symbols-outlined text-xl ${isActive ? 'animate-pulse' : ''}">${item.icon}</span>
                <span class="text-xs font-black uppercase tracking-wide">${item.label}</span>
            </div>
            ${isActive ? '<div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 opacity-30"></div>' : ''}
        `;

        button.onclick = () => store.setView(item.id);
        nav.appendChild(button);
    });

    aside.appendChild(nav);

    const bottomSection = document.createElement('div');
    bottomSection.className = "p-4 border-t border-slate-700 bg-slate-900";
    bottomSection.innerHTML = `
        <button class="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all group">
             <span class="material-symbols-outlined group-hover:rotate-90 transition-transform duration-500">settings</span>
             <span class="text-xs font-black uppercase tracking-wide">Setări</span>
        </button>
        <div class="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700">
             <div class="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">A</div>
             <div class="overflow-hidden">
                <p class="text-xs font-bold text-white truncate">Admin User</p>
                <p class="text-[9px] text-slate-500 uppercase tracking-widest truncate">Administrator</p>
             </div>
        </div>
    `;

    aside.appendChild(bottomSection);
    return aside;
};
