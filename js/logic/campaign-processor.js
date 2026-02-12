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

// Procesarea unui singur rând
const processRow = (row) => {
    const sku = String(row[COL.SKU] || "").trim();
    if (!sku) return row; 

    // 1. Extragere valori
    const [stoc, maxPrice, inputPrice] = [row[COL.STOC], row[COL.MAX_PRICE], row[COL.INPUT_PRICE]].map(v => parseFloat(v) || 0);
    const [currPrice, commVal] = [row[COL.PRICE_CUR], row[COL.COMM]].map(v => parseFloat(v) || 0);
    
    // 2. Aplicare Reguli
    const finalPrice = inputPrice > 0 ? inputPrice : maxPrice;
    const cogs = store.getProductCost(sku);
    const profit = calculateProfit(finalPrice, cogs, commVal, currPrice);

    // 3. Construire rând nou
    const newRow = [...row];
    newRow[COL.TARGET_STOC] = stoc;        
    newRow[COL.TARGET_PRICE] = finalPrice; 
    newRow[COL.PROFIT] = profit;           
    
    return newRow;
};

// Helper descărcare
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
    console.log(`Procesare cu filtrare stoc: ${file.name}`);

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
                const sheetName = workbook.SheetNames.find(n => n.includes("Oferte")) || workbook.SheetNames[0];
                const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: "" });

                const headerIdx = rawData.findIndex(row => String(row[COL.SKU]).includes("part_number") || String(row[COL.SKU]).includes("Cod produs"));
                const startIdx = headerIdx + 1;

                // --- LOGICA DE FILTRARE ---
                // Păstrăm headerul + DOAR rândurile cu stoc > 0 procesate
                const processedRows = rawData.slice(startIdx)
                    .filter(row => (parseFloat(row[COL.STOC]) || 0) > 0) // Elimină dacă stocul e 0
                    .map(processRow);

                const processedData = [
                    ...rawData.slice(0, startIdx),
                    ...processedRows
                ];
                // -------------------------

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
