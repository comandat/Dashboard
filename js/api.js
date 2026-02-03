/**
 * API Service
 * Real Data Connection via n8n
 * Gestionare Normalizare Furnizori și Categorii
 */

const DATA_WEBHOOK_URL = 'https://automatizare.comandat.ro/webhook/get-raw-internal-data';
const LOGIN_WEBHOOK_URL = 'https://automatizare.comandat.ro/webhook/637e1f6e-7beb-4295-89bd-4d7022f12d45';
const EXTRACT_WEBHOOK_URL = 'https://automatizare.comandat.ro/webhook/convert-invoice-data';

// --- 1. CONFIGURARE FURNIZORI (NORMALIZARE) ---
// Cheia = Numele EXACT din baza de date
// Valoarea = Lista de cuvinte cheie după care recunoaștem furnizorul pe factură
const VENDOR_DB_MAPPING = {
    "Amazonas Web Trading S.R.L. ": ["AMAZONAS"],
    "I-TOM SOLUTIONS SRL": ["I-TOM", "ITOM"],
    "Bricostore Romania S.A.": ["BRICOSTORE", "BRICO DEPOT", "BRICO"],
    "DEDEMAN SRL": ["DEDEMAN"],
    "SMARTIT GLOBAL SRL": ["SMARTIT"],
    "MECANO VALMAR SRL": ["MECANO"],
    " Rogri Impex SRL": ["ROGRI"], // Spațiul din față păstrat conform DB
    "DANTE INTERNATIONAL SA": ["DANTE", "EMAG"],
    "BRAND DESIGN TEAM SRL": ["BRAND DESIGN"],
    "SEZELIA COM SRL": ["SEZELIA"],
    "S.P.N. ENACHE MARINA CECILIA SI ASOCIATII": ["ENACHE MARINA", "NOTAR", "CABINET INDIVIDUAL"],
    "D & C CONTA SRL": ["D & C", "D&C", "CONTA"],
    "WEEX GLOBAL S.R.L.": ["WEEX"],
    "ALLEATI ACCOUNTING S.R.L.": ["ALLEATI"],
    "CUASAR IMPEX SRL": ["CUASAR"],
    "DIRECTIA GENERALA REGIONALA A FINANTELOR PUBLICE BUCURESTI": ["FINANTELOR PUBLICE", "TREZORERIA", "ANAF", "BUGETUL DE STAT"],
    "S.C. ITAROM SPA SRL": ["ITAROM"],
    "CERTSIGN SA": ["CERTSIGN"],
    "DELIVERY SOLUTIONS S.A.": ["DELIVERY SOLUTIONS", "SAMEDAY"],
    "LIDL Discount S.R.L.": ["LIDL"],
    "Austral Trade SRL": ["AUSTRAL"],
    "SC FAN COURIER EXPRESS SRL ": ["FAN COURIER", "FAN CURIER"],
    "ALTEX ROMANIA SRL": ["ALTEX", "MEDIA GALAXY"],
    "BITFACTOR SRL": ["BITFACTOR"],
    "FLUENT DISTRIBUTION SRL": ["FLUENT"],
    "S.C. BIRO-MEDIA TRADING SRL": ["BIRO-MEDIA", "BIRO MEDIA"],
    "KONTAS ROMANIA SRL": ["KONTAS"],
    "BIROU  NOTARIAL  CIOPLEA M. ALEXANDRU-VALENTIN": ["CIOPLEA"],
    "Dynamic Parcel Distribution SA": ["DYNAMIC PARCEL", "DPD"],
    "TRENDYOL B.V.": ["TRENDYOL"]
};

// --- 2. CONFIGURARE CATEGORII ---
// Mapăm cuvinte cheie din numele oficial al furnizorului către categorii
const CATEGORY_MAP = {
    "OPERATIONAL": [
        "ITAROM", "CERTSIGN", "I-TOM", "D & C", "WEEX", "KONTAS", 
        "ROGRI", "BIRO-MEDIA", "AMAZONAS", "FLUENT", "CUASAR", "DEDEMAN", 
        "BRICOSTORE", "MECANO", "AUSTRAL", "NOTAR", "CIOPLEA", "ALLEATI", "LIDL", "ALTEX"
    ],
    "TAXE": [
        "FINANTELOR PUBLICE", "ANAF", "TREZORERIA"
    ],
    "COMISIOANE": [
        "DANTE", "TRENDYOL", "BITFACTOR", "BRAND DESIGN", "EMAG"
    ],
    "TRANSPORT": [
        "SEZELIA", "DELIVERY SOLUTIONS", "FAN COURIER", "DYNAMIC PARCEL", "SAMEDAY", "DPD"
    ],
    "INFRASTRUCTURA": [
        "SMARTIT", "GOOGLE", "RAILWAY", "LEMON SQUEEZY"
    ]
};

// --- FUNCTII AJUTATOARE INTERNE ---

const normalizeVendor = (rawName) => {
    if (!rawName) return "";
    const upperRaw = rawName.toUpperCase();

    // 1. Căutăm în lista de mapări oficiale
    for (const [officialName, keywords] of Object.entries(VENDOR_DB_MAPPING)) {
        if (keywords.some(k => upperRaw.includes(k))) {
            return officialName; // Returnăm numele exact din baza de date
        }
    }
    
    // 2. Dacă e un furnizor nou (necunoscut), îl returnăm curățat sumar
    return rawName.trim();
};

const detectCategory = (vendorName) => {
    if (!vendorName) return "ALTELE";
    const cleanName = vendorName.toUpperCase();

    for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
        for (const k of keywords) {
            if (cleanName.includes(k)) {
                return category;
            }
        }
    }
    return "ALTELE";
};

// --- API EXPORTS ---

export const getDashboardData = async (period = 'current_month') => {
    try {
        const currentUser = sessionStorage.getItem('currentUser');
        const response = await fetch(DATA_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ period: period, user: currentUser })
        });

        if (!response.ok) throw new Error(`Eroare server n8n: ${response.statusText}`);
        const json = await response.json();
        // n8n returnează uneori array, alteori obiect, tratăm ambele cazuri
        const data = Array.isArray(json) ? json[0] : json;

        return {
            financialSummary: data.financialSummary || { net_profit: 0, revenue: 0, expenses_total: 0, margin_percent: 0, expense_coverage_percent: 0, break_even_target: 0 },
            monthlyData: data.monthlyData || [],
            expenses: data.recentExpenses || [], 
            deadStock: data.deadStock || [],
            operationalOrders: data.operationalOrders || [],
            topCategories: data.topCategories || [] 
        };
    } catch (error) {
        console.error("Eroare la preluarea datelor:", error);
        // Returnăm structură goală pentru a nu bloca UI-ul
        return { financialSummary: null, monthlyData: [], expenses: [], deadStock: [], operationalOrders: [], topCategories: [] };
    }
};

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

        // 1. Procesare Valori Numerice
        // "factura_total" vine din n8n (Total de plată) -> Mapăm la "amount"
        const total = Number(result.factura_total) || 0;
        let tva = Number(result.factura_tva) || 0;

        // 2. Fallback TVA: Dacă n8n nu găsește TVA, dar avem total, estimăm 21% din Total
        if (tva === 0 && total > 0) {
            tva = parseFloat((total * 0.21).toFixed(2));
        }

        // 3. Normalizare Furnizor (Mapare la DB)
        const rawVendor = result.furnizor || '';
        const cleanVendor = normalizeVendor(rawVendor);

        // 4. Detectare Categorie pe baza numelui normalizat
        const category = detectCategory(cleanVendor);

        return {
            vendor: cleanVendor,
            invoice_id: result.source_doc || '',
            amount: total,          
            currency: result.factura_moneda || 'RON',
            tva: tva,
            date: result.date || new Date().toISOString().split('T')[0],
            category: category
        };

    } catch (error) {
        console.error("[n8n] Eroare la extracție:", error);
        throw error;
    }
};

export const addExpense = async (expense) => {
    // TODO: Aici va fi endpoint-ul de INSERT în baza de date
    // Momentan doar simulăm succesul
    console.log("Se trimite la baza de date:", expense);
    return new Promise((resolve) => {
        setTimeout(() => resolve(true), 500);
    })
};
