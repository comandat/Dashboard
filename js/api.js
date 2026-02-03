/**
 * API Service
 * Real Data Connection via n8n
 */

const DATA_WEBHOOK_URL = 'https://automatizare.comandat.ro/webhook/get-raw-internal-data';
const LOGIN_WEBHOOK_URL = 'https://automatizare.comandat.ro/webhook/637e1f6e-7beb-4295-89bd-4d7022f12d45';
const EXTRACT_WEBHOOK_URL = 'https://automatizare.comandat.ro/webhook/convert-invoice-data';

export const getDashboardData = async (period = 'current_month') => {
    try {
        const currentUser = sessionStorage.getItem('currentUser');
        
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

        const json = await response.json();
        
        // FIX: n8n returnează un Array, noi avem nevoie de primul obiect din el
        const data = Array.isArray(json) ? json[0] : json;

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

// ... (Restul funcțiilor: loginUser, extractExpenseFromDocument, addExpense rămân neschimbate) ...
export const loginUser = async (accessCode) => {
    try {
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

export const extractExpenseFromDocument = async (file) => {
    const formData = new FormData();
    formData.append('data', file); 
    
    try {
        const response = await fetch(EXTRACT_WEBHOOK_URL, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) throw new Error(`Eroare n8n: ${response.statusText}`);
        
        const result = await response.json();

        // LOGICA DE PRELUCRARE DATE PENTRU DASHBOARD
        const total = Number(result.factura_total) || 0;
        let tva = Number(result.factura_tva) || 0;

        // Dacă TVA e 0, recomandăm 21% din Total (conform cerinței)
        // Notă: De obicei TVA e inclus, deci calculul ar fi Total - (Total / 1.19), 
        // dar am pus direct 21% din total conform cererii tale.
        if (tva === 0 && total > 0) {
            tva = parseFloat((total * 0.21).toFixed(2));
        }

        const vendor = result.furnizor || '';
        const detectedCategory = detectCategory(vendor);

        return {
            vendor: vendor,
            invoice_id: result.source_doc || '',
            amount: total,          // Mapare factura_total -> dashboard amount
            currency: result.factura_moneda || 'RON',
            tva: tva,
            date: result.date || new Date().toISOString().split('T')[0],
            category: detectedCategory // Categoria detectată automat
        };

    } catch (error) {
        console.error("[n8n] Eroare la extracție:", error);
        throw error;
    }
};

export const addExpense = async (expense) => {
    // Aici vei modifica ulterior pentru a trimite în PostgreSQL
    console.log("Saving expense:", expense);
    return new Promise((resolve) => {
        setTimeout(() => resolve(true), 500);
    })
};

const CATEGORY_MAP = {
    "OPERATIONAL": [
        "ITAROM", "CERTSIGN", "I-TOM SOLUTIONS", "D & C CONTA", 
        "WEEX GLOBAL", "KONTAS", "ROGRI", "BIRO-MEDIA", 
        "AMAZONAS", "FLUENT", "CUASAR", "DEDEMAN"
    ],
    "TAXE": [
        "BUGETUL DE STAT", "DIRECTIA GENERALA", "FINANTELOR PUBLICE", "ANAF", "TREZORERIA"
    ],
    "COMISIOANE": [
        "DANTE INTERNATIONAL", "TRENDYOL", "BITFACTOR", 
        "BRAND DESIGN", "EMAG"
    ],
    "TRANSPORT": [
        "SEZELIA", "DELIVERY SOLUTIONS", "FAN COURIER", "DYNAMIC PARCEL", "SAMEDAY"
    ],
    "INFRASTRUCTURA": [
        "SMARTIT GLOBAL", "GOOGLE", "RAILWAY", "LEMON SQUEEZY", "BROWSE AL"
    ]
};

// Funcție ajutătoare pentru detectarea categoriei
const detectCategory = (vendorName) => {
    if (!vendorName) return "ALTELE";
    const cleanName = vendorName.toUpperCase();

    for (const [category, suppliers] of Object.entries(CATEGORY_MAP)) {
        for (const s of suppliers) {
            if (cleanName.includes(s)) {
                return category;
            }
        }
    }
    return "ALTELE";
};
