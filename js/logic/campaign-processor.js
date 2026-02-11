import { store } from '../store.js';

export const processEmagFile = async (file) => {
    console.log("Procesare eMAG pornită pentru:", file.name);

    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // Încercăm să găsim sheet-ul "Oferte" sau luăm primul sheet
                const sheetName = workbook.SheetNames.find(n => n.includes("Oferte")) || workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                
                // Convertim foaia de lucru în JSON (array de array-uri)
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

                // --- MAPARE COLOANE (A=0, B=1, E=4, etc.) ---
                const COL = {
                    SKU: 4,           // E - Part Number (Cheia de legătură)
                    PRET_ACTUAL: 7,   // H - Current Price (folosit la calcul procent comision)
                    STOC_ACTUAL: 9,   // J - Stoc Actual
                    COMISION_VAL: 10, // K - Valoare Comision Actual (RON)
                    
                    // Coloane de OUTPUT (unde scriem)
                    PRET_TARGET: 12,  // M - Preț Campanie
                    STOC_TARGET: 13,  // N - Stoc Campanie
                    PROFIT: 20,       // U - Profitabilitate (Calculat)

                    // Coloane de INPUT (de unde citim reguli)
                    PRET_MAX: 14,     // O - Preț Maxim
                    INPUT_PRET: 16    // Q - Input manual sau prag
                };

                // Identificăm rândul de start (unde încep datele efective)
                let startRow = 0;
                for(let i=0; i<jsonData.length; i++) {
                    // Căutăm header-ul care conține "part_number" sau "Cod produs" pe coloana E
                    if(String(jsonData[i][COL.SKU]).includes("part_number") || String(jsonData[i][COL.SKU]).includes("Cod produs")) {
                        startRow = i + 1;
                        break;
                    }
                }

                // --- ITERARE RÂNDURI ---
                for (let i = startRow; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    
                    // Ignorăm rândurile fără SKU valid
                    if (!row[COL.SKU]) continue;

                    const sku = String(row[COL.SKU]).trim();
                    const stocJ = parseFloat(row[COL.STOC_ACTUAL]) || 0;
                    
                    // --- REGULA 1: Stoc (N = J) ---
                    // Copiem valoarea stocului actual în coloana de campanie
                    row[COL.STOC_TARGET] = stocJ;

                    // --- REGULA 2: Preț (M) ---
                    // Dacă Q are valoare -> M = Q
                    // Dacă Q e gol -> M = O (Preț Maxim)
                    const valoareQ = parseFloat(row[COL.INPUT_PRET]);
                    const valoareO = parseFloat(row[COL.PRET_MAX]);
                    
                    let pretCampanieM = 0;
                    if (!isNaN(valoareQ) && valoareQ > 0) {
                        pretCampanieM = valoareQ;
                    } else {
                        pretCampanieM = valoareO || 0;
                    }
                    row[COL.PRET_TARGET] = pretCampanieM;

                    // --- REGULA 3: Profitabilitate (U) ---
                    // Formula: Preț Campanie (M) - Cost Achiziție (COGS) - Comision Redus
                    
                    // A. Obținem COGS din Store
                    const cogs = store.getProductCost(sku);
                    
                    // B. Calculăm Comisionul Redus (presupunem reducere 30% la comision în campanie)
                    // Avem nevoie de procentul de comision al categoriei. Îl deducem din datele actuale: K / H
                    const pretActualH = parseFloat(row[COL.PRET_ACTUAL]) || 0;
                    const comisionActualK = parseFloat(row[COL.COMISION_VAL]) || 0;
                    
                    let comisionRedusRON = 0;
                    if (pretActualH > 0 && pretCampanieM > 0) {
                        const procentComision = comisionActualK / pretActualH; // Ex: 0.18 (18%)
                        // Comisionul nou aplicat la prețul redus
                        const comisionNouStandard = pretCampanieM * procentComision;
                        // Aplicăm discountul de campanie la comision (factor 0.7 = 30% reducere)
                        comisionRedusRON = comisionNouStandard * 0.7;
                    }

                    // C. Calculăm Profitul
                    if (pretCampanieM > 0 && cogs > 0) {
                        const profit = pretCampanieM - cogs - comisionRedusRON;
                        row[COL.PROFIT] = parseFloat(profit.toFixed(2)); // Rotunjire la 2 zecimale
                    } else if (cogs === 0) {
                        // Marcăm că nu am găsit costul
                        row[COL.PROFIT] = "COGS Lipsă";
                    } else {
                        row[COL.PROFIT] = 0;
                    }
                }

                // Reconstruim fișierul Excel
                const newWorksheet = XLSX.utils.aoa_to_sheet(jsonData);
                workbook.Sheets[sheetName] = newWorksheet;

                // Generăm fișierul pentru download
                const outputFilename = "PROCESAT_" + file.name;
                XLSX.writeFile(workbook, outputFilename);
                
                resolve("Procesare finalizată cu succes!");

            } catch (error) {
                console.error("Eroare critică la procesare:", error);
                reject(error);
            }
        };

        reader.readAsArrayBuffer(file);
    });
};

export const processTrendyolFile = async (file) => {
    console.log("Trendyol încă neimplementat");
    return new Promise(resolve => setTimeout(resolve, 500));
};
