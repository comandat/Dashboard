import { store } from './store.js';
import { renderSidebar } from './components/sidebar.js';
import { renderDashboard } from './views/dashboard.js';
import { renderFinancial } from './views/financial.js';
import { renderStock } from './views/stock.js';
import { renderOperational } from './views/operational.js';
import { renderAddExpense } from './views/add-expense.js';
import { loginUser } from './api.js'; // <--- Importăm funcția nouă
import { renderCampaigns } from './views/campaigns.js';

const app = document.getElementById('app');

// ... (Funcția render rămâne la fel) ...
const render = () => {
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

    const sidebar = renderSidebar(state.currentView);
    const main = document.createElement('main');
    main.className = "flex-1 overflow-y-auto h-full p-6 relative animate-fade-in";

    app.appendChild(sidebar);
    app.appendChild(main);

    switch (state.currentView) {
        case 'dashboard': renderDashboard(main, state); break;
        case 'financial': renderFinancial(main, state); break;
        case 'stock': renderStock(main, state); break;
        case 'operational': renderOperational(main, state); break;
        case 'add-expense': renderAddExpense(main, state); break;
        default: main.innerHTML = `<div class="flex h-full items-center justify-center text-gray-400">Pagina în construcție</div>`;
    }
};

// --- LOGICA DE AUTENTIFICARE ---
const initAuth = async () => {
    const overlay = document.getElementById('login-overlay');
    const form = document.getElementById('login-form');
    const input = document.getElementById('access-code');
    const errorMsg = document.getElementById('login-error');
    const btn = document.getElementById('login-btn');
    const spinner = document.getElementById('login-spinner');

    // 1. Verificăm dacă utilizatorul e deja logat (sesiune activă)
    const isLogged = sessionStorage.getItem('isLoggedIn') === 'true';

    if (isLogged) {
        overlay.classList.add('hidden');
        store.subscribe(render);
        await store.init();
    } else {
        // 2. Dacă nu, așteptăm submit la form
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const code = input.value.trim();
            
            if (!code) return;

            // UI Loading state
            btn.disabled = true;
            spinner.classList.remove('hidden');
            errorMsg.textContent = '';

            try {
                // Apelăm funcția din api.js care sună la n8n
                const result = await loginUser(code);

                if (result.success) {
                    // SUCCES
                    sessionStorage.setItem('isLoggedIn', 'true');
                    sessionStorage.setItem('currentUser', result.user); // Salvăm userul returnat de SQL
                    
                    // Ascundem overlay cu animație
                    overlay.classList.add('opacity-0');
                    setTimeout(() => overlay.classList.add('hidden'), 300);

                    // Pornim aplicația
                    store.subscribe(render);
                    await store.init();
                } else {
                    // EȘEC (Parolă greșită)
                    errorMsg.textContent = 'COD DE ACCES INCORECT';
                    input.value = '';
                    input.focus();
                }
            } catch (err) {
                errorMsg.textContent = 'EROARE DE CONEXIUNE';
            } finally {
                btn.disabled = false;
                spinner.classList.add('hidden');
            }
        });
    }
};

// Pornim Auth Flow în loc de init direct
initAuth();

