/**
 * API Service
 * Real Data Connection via n8n
 */

// Webhook URLs
const DATA_WEBHOOK_URL = 'https://automatizare.comandat.ro/webhook/get-raw-internal-data';
const LOGIN_WEBHOOK_URL = 'https://automatizare.comandat.ro/webhook/637e1f6e-7beb-4295-89bd-4d7022f12d45';
const EXTRACT_WEBHOOK_URL = 'https://automatizare.comandat.ro/webhook/convert-invoice-data';

/**
 * Aduce TOATE datele pentru dashboard într-un singur apel.
 * Trimitem perioada și userul curent pentru filtrare în n8n.
 */
export const getDashboardData = async (period = 'current_month') => {
    try {
        const currentUser = sessionStorage.getItem('currentUser');
        
        // Trimitem un POST către n8n cu parametrii necesari (perioada selectată + user)
        const response = await fetch(DATA_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                period: period,
                user: currentUser
            })
        });

        if (!response.ok) {
            throw new Error(`Eroare server n8n: ${response.statusText}`);
        }

        const data = await response.json();

        // Mapăm răspunsul n8n la structura aplicației.
        // Asigură-te că n8n returnează JSON-ul cu cheile de mai jos (financialSummary, monthlyData, etc.)
        return {
            financialSummary: data.financialSummary || {
                net_profit: 0,
                revenue: 0,
                expenses_total: 0,
                margin_percent: 0,
                expense_coverage_percent: 0,
                break_even_target: 0
            },
            monthlyData: data.monthlyData || [],
            expenses: data.recentExpenses || [], 
            deadStock: data.deadStock || [],
            operationalOrders: data.operationalOrders || [],
            topCategories: data.topCategories || [] 
        };

    } catch (error) {
        console.error("Eroare la preluarea datelor:", error);
        // Returnăm structuri goale pentru a nu bloca interfața în caz de eroare
        return {
            financialSummary: null, 
            monthlyData: [], 
            expenses: [], 
            deadStock: [], 
            operationalOrders: [],
            topCategories: []
        };
    }
};

/**
 * LOGIN
 */
export const loginUser = async (accessCode) => {
    try {
        // Trimitem 'text/plain' dacă nodul n8n webhook este setat să citească RAW Body
        // Sau 'application/json' dacă ai configurat JSON
        const response = await fetch(LOGIN_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' }, 
            body: JSON.stringify({ code: accessCode })
        });

        if (!response.ok) throw new Error('Eroare conexiune server');

        const data = await response.json();
        
        if (data.status === 'success') {
            return { success: true, user: data.user };
        } else {
            return { success: false };
        }

    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
};

/**
 * EXTRACT EXPENSE (OCR via n8n)
 */
export const extractExpenseFromDocument = async (file) => {
    const formData = new FormData();
    formData.append('data', file); 

    try {
        console.log(`[n8n] Trimitere ${file.name} către ${EXTRACT_WEBHOOK_URL}...`);

        const response = await fetch(EXTRACT_WEBHOOK_URL, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) throw new Error(`Eroare n8n: ${response.statusText}`);

        const result = await response.json();

        return {
            vendor: result.furnizor || '',
            amount: result.factura_total || result.factura_valoare || 0,
            date: result.date || new Date().toISOString().split('T')[0],
            invoice_id: result.source_doc || '',
            category: 'Logistica'
        };

    } catch (error) {
        console.error("[n8n] Eroare la extracție:", error);
        throw error;
    }
};

/**
 * SAVE EXPENSE
 * Momentan doar simulează salvarea. Poți conecta un alt webhook aici.
 */
export const addExpense = async (expense) => {
    return new Promise((resolve) => {
        console.log("[n8n] (Simulare Salvare) Cheltuială:", expense);
        // Aici poți adăuga un fetch către un webhook 'insert-expense'
        setTimeout(() => resolve(true), 500);
    })
};
