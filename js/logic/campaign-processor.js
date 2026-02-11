import { store } from '../store.js';

// Constante pentru indecșii coloanelor (A=0, E=4 etc.)
const COL = {
    SKU: 4, PRICE_CUR: 7, STOC: 9, COMM: 10,       // Input Data
    TARGET_PRICE: 12, TARGET_STOC: 13, MAX_PRICE: 14, INPUT_PRICE: 16, // Input/Output
    PROFIT: 20                                     // Output Calculat
};

// Funcție pură pentru calculul profitului
const calculateProfit = (price, cogs, commVal, currentPrice) => {
    if (!price || !cogs) return cogs === 0 ? "COGS Lipsă" : 0;
    
    const commRate = currentPrice > 0 ? (commVal / currentPrice) : 0;
    const estimatedComm = price * commRate * 0.7; // Reducere 30% la comision
    return parseFloat((price - cogs - estimatedComm).toFixed(2));
};

// Procesarea unui singur rând (Functional: Input -> Output, fără side effects)
const processRow = (row) => {
    const sku = String(row[COL.SKU] || "").trim();
    if (!sku) return row; // Returnăm rândul neatins dacă nu are SKU

    // 1. Extragere valori (cu fallback la 0)
    const [stoc, maxPrice, inputPrice] = [row[COL.STOC], row[COL.MAX_PRICE], row[COL.INPUT_PRICE]].map(v => parseFloat(v) || 0);
    const [currPrice, commVal] = [row[COL.PRICE_CUR], row[COL.COMM]].map(v => parseFloat(v) || 0);
    
    // 2. Aplicare Reguli
    const finalPrice = inputPrice > 0 ? inputPrice : maxPrice;
    const cogs = store.getProductCost(sku);
    const profit = calculateProfit(finalPrice, cogs, commVal, currPrice);

    // 3. Construire rând nou (Imutabil)
    const newRow = [...row];
    newRow[COL.TARGET_STOC] = stoc;        // Regula N = J
    newRow[COL.TARGET_PRICE] = finalPrice; // Regula M = Q sau O
    newRow[COL.PROFIT] = profit;           // Regula U = Profit
    
    return newRow;
};

// Funcție helper pentru descărcare (Browser safe)
const downloadExcel = (workbook, fileName) => {
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    Object.assign(a, { href: url, download: fileName });
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => { URL.revokeObjectURL(url); document.body.removeChild(a); }, 100);
};

export const processEmagFile = async (file) => {
    console.log(`Procesare funcțională: ${file.name}`);

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
                const sheetName = workbook.SheetNames.find(n => n.includes("Oferte")) || workbook.SheetNames[0];
                const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: "" });

                // Găsim indexul header-ului și separăm datele
                const headerIdx = rawData.findIndex(row => String(row[COL.SKU]).includes("part_number") || String(row[COL.SKU]).includes("Cod produs"));
                const startIdx = headerIdx + 1;

                // PIPELINE: Slice -> Map -> Concat
                // Păstrăm header-ul intact și procesăm doar corpul
                const processedData = [
                    ...rawData.slice(0, startIdx),
                    ...rawData.slice(startIdx).map(processRow)
                ];

                // Export
                const newSheet = XLSX.utils.aoa_to_sheet(processedData);
                workbook.Sheets[sheetName] = newSheet;
                downloadExcel(workbook, `PROCESAT_${file.name.replace('.csv', '.xlsx')}`);
                
                resolve("Succes!");
            } catch (err) {
                console.error(err);
                reject(err);
            }
        };
        reader.readAsArrayBuffer(file);
    });
};

export const processTrendyolFile = async () => new Promise(r => setTimeout(r, 500));
