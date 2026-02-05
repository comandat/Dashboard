/**
 * API Service
 * Real Data Connection via n8n
 * Gestionare Normalizare Furnizori și Categorii
 */

const DATA_WEBHOOK_URL = 'https://automatizare.comandat.ro/webhook/get-raw-internal-data';
const LOGIN_WEBHOOK_URL = 'https://automatizare.comandat.ro/webhook/637e1f6e-7beb-4295-89bd-4d7022f12d45';
const EXTRACT_WEBHOOK_URL = 'https://automatizare.comandat.ro/webhook/convert-invoice-data';
// URL NOU: Webhook care primește lista, verifică duplicatele SQL și inserează doar ce e nou
const BATCH_SYNC_URL = 'https://automatizare.comandat.ro/webhook/batch-insert-expenses'; 

// --- 1. CONFIGURARE FURNIZORI (NORMALIZARE) ---
const VENDOR_DB_MAPPING = {
    "Amazonas Web Trading S.R.L. ": ["AMAZONAS"],
    "I-TOM SOLUTIONS SRL": ["I-TOM", "ITOM"],
    "Bricostore Romania S.A.": ["BRICOSTORE", "BRICO DEPOT", "BRICO"],
    "DEDEMAN SRL": ["DEDEMAN"],
    "SMARTIT GLOBAL SRL": ["SMARTIT"],
    "MECANO VALMAR SRL": ["MECANO"],
    "Rogri Impex SRL": ["ROGRI"], 
    "DANTE INTERNATIONAL SA": ["DANTE"], // Modificat: S-a scos "EMAG" de aici
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

// --- FUNCTII AJUTATOARE ---

const normalizeVendor = (rawName) => {
    if (!rawName) return "";
    const upperRaw = rawName.toUpperCase();

    // --- 1. REGULI PRIORITARE (CUSTOM LOGIC) ---

    // REGULA 1: eMAG Ungaria
    // Se verifică dacă conține "EMAG" SI ("KFT" SAU "MAGYAR")
    if (upperRaw.includes("EMAG") && (upperRaw.includes("KFT") || upperRaw.includes("MAGYAR"))) {
        return "eMAG Magyarország Kft.";
    }

    // REGULA 2: eMAG Bulgaria
    // Se verifică dacă conține ("EMAG" SI "OOD") SAU match exact (case-insensitive)
    if ((upperRaw.includes("EMAG") && upperRaw.includes("OOD")) || upperRaw === "EMAG INTERNATIONAL OOD") {
        return "eMag International OOD";
    }

    // --- 2. REGULI STANDARD DIN MAPARE ---
    for (const [officialName, keywords] of Object.entries(VENDOR_DB_MAPPING)) {
        if (keywords.some(k => upperRaw.includes(k))) {
            return officialName; 
        }
    }
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
        const data = Array.isArray(json) ? json[0] : json;

        return {
            financialSummary: data.financialSummary || { net_profit: 0, revenue: 0, expenses_total: 0, margin_percent: 0, expense_coverage_percent: 0, break_even_target: 0 },
            monthlyData: data.monthlyData || [],
            expenses: data.recentExpenses || [], 
            
            // --- NOILE DATA POINTS ---
            inventoryHealth: data.inventoryHealth || null,       // KPI-urile generale (Status, % Dead Stock)
            deadStockActionList: data.deadStockActionList || [], // Lista prioritizată Pas 1 / Pas 2
            
            operationalOrders: data.operationalOrders || [],
            topCategories: data.topCategories || [] 
        };
    } catch (error) {
        console.error("Eroare la preluarea datelor:", error);
        return { financialSummary: null, monthlyData: [], expenses: [], inventoryHealth: null, deadStockActionList: [], operationalOrders: [], topCategories: [] };
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
        const response = await fetch(EXTRACT_WEBHOOK_URL, { method: 'POST', body: formData });
        if (!response.ok) throw new Error(`Eroare n8n: ${response.statusText}`);
        const result = await response.json();

        const dateStr = result.date || new Date().toISOString().split('T')[0];
        const total = Number(result.factura_total) || 0;
        let tva = 0;

        // MODIFICARE: Calculăm TVA automat mereu, suprascriind valoarea de la AI
        // Regula: < 1 Aug 2025 => 19%, >= 1 Aug 2025 => 21%
        if (total > 0) {
            const rate = dateStr < '2025-08-01' ? 0.19 : 0.21;
            tva = parseFloat((total * rate).toFixed(2));
        }

        const rawVendor = result.furnizor || '';
        const cleanVendor = normalizeVendor(rawVendor);
        const category = detectCategory(cleanVendor);

        return {
            vendor: cleanVendor,
            invoice_id: result.source_doc || '',
            amount: total,          
            currency: result.factura_moneda || 'RON',
            tva: tva,
            date: dateStr,
            category: category
        };

    } catch (error) {
        console.error("[n8n] Eroare la extracție:", error);
        throw error;
    }
};

// --- FUNCTIE NOUA: Sincronizare Batch ---
export const syncExpenses = async (expensesList) => {
    try {
        const response = await fetch(BATCH_SYNC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                expenses: expensesList,
                user: sessionStorage.getItem('currentUser')
            })
        });

        if (!response.ok) throw new Error('Eroare conexiune server');
        
        // Returneaza: { results: [ { tempId: '...', status: 'saved' | 'duplicate', message: '...' } ] }
        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Eroare la sincronizare:", error);
        return { error: true };
    }
};

export const addExpense = async (expense) => {
    console.warn("Use syncExpenses instead.");
    return true;
};

