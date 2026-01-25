import { store } from './store.js';
import { renderSidebar } from './components/sidebar.js';
import { renderDashboard } from './views/dashboard.js';
import { renderFinancial } from './views/financial.js';
import { renderStock } from './views/stock.js';
import { renderOperational } from './views/operational.js';
import { renderAddExpense } from './views/add-expense.js';

const app = document.getElementById('app');

const render = () => {
    // Clear Container
    app.innerHTML = '';

    const state = store.state;

    if (state.loading && !state.financialSummary) {
        app.innerHTML = `
            <div class="flex h-full w-full items-center justify-center text-slate-400">
                <div class="flex flex-col items-center gap-2">
                    <span class="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
                    <p>Se încarcă datele...</p>
                </div>
            </div>
        `;
        return;
    }

    // Render Logic based on Layout
    // We need a layout structure: Sidebar + Main Content which contains the View

    // Create Layout
    const sidebar = renderSidebar(state.currentView);
    const main = document.createElement('main');
    main.className = "flex-1 overflow-y-auto h-full p-6 relative animate-fade-in";

    // Append Layout
    app.appendChild(sidebar);
    app.appendChild(main);

    // Render Specific View into Main
    switch (state.currentView) {
        case 'dashboard':
            renderDashboard(main, state);
            break;
        case 'financial':
            renderFinancial(main, state);
            break;
        case 'stock':
            renderStock(main, state);
            break;
        case 'operational':
            renderOperational(main, state);
            break;
        case 'add-expense':
            renderAddExpense(main, state);
            break;
        default:
            main.innerHTML = `
                <div class="flex h-full items-center justify-center text-gray-400">
                    <div class="text-center">
                        <span class="material-symbols-outlined text-6xl mb-4">construction</span>
                        <h2 className="text-2xl font-bold">Pagina în construcție</h2>
                        <p>Funcționalitatea pentru ${state.currentView} va fi disponibilă în curând.</p>
                    </div>
                </div>
            `;
    }
};

// Initialize App
const init = async () => {
    store.subscribe(render);
    await store.init();
};

init();
