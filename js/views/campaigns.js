/**
 * Campaigns View
 * Interfață duală pentru procesare Excel locală
 */
import { processEmagFile, processTrendyolFile } from '../logic/campaign-processor.js';

export const renderCampaigns = (container, state) => {
    
    // Stare locală pentru UI
    const status = {
        emag: { file: null, processing: false },
        trendyol: { file: null, processing: false }
    };

    const getHTML = () => {
        return `
        <div class="mx-auto max-w-[1600px] w-full px-4 pb-20 mt-6">
            <header class="mb-8">
                <h1 class="text-4xl font-black text-white tracking-tight uppercase">Campanii & Promoții</h1>
                <p class="text-slate-400 text-lg">Generator automat de fișiere de campanie (Procesare Locală).</p>
            </header>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                <div class="rounded-[2.5rem] border border-slate-700 bg-slate-800/50 p-8 shadow-2xl relative overflow-hidden group hover:border-blue-500/50 transition-colors">
                    <div class="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                         <span class="material-symbols-outlined text-[150px] text-blue-500">shopping_bag</span>
                    </div>
                    
                    <div class="flex items-center gap-4 mb-6 relative z-10">
                        <div class="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <span class="material-symbols-outlined text-white text-2xl">bolt</span>
                        </div>
                        <h2 class="text-3xl font-black text-white uppercase tracking-tight">eMAG</h2>
                    </div>

                    <div id="drop-emag" class="border-4 border-dashed border-slate-700 bg-slate-900/50 rounded-3xl h-64 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-slate-900 transition-all relative">
                        <input type="file" id="input-emag" class="hidden" accept=".xlsx, .xls, .csv" />
                        
                        <div id="content-emag-idle" class="flex flex-col items-center gap-3 pointer-events-none transition-opacity">
                            <span class="material-symbols-outlined text-5xl text-slate-500">upload_file</span>
                            <p class="text-slate-400 font-bold uppercase text-xs tracking-widest">Trage fișierul eMAG aici</p>
                        </div>

                        <div id="content-emag-active" class="hidden flex flex-col items-center gap-2 pointer-events-none animate-fade-in">
                            <span class="material-symbols-outlined text-5xl text-blue-500">description</span>
                            <p id="filename-emag" class="text-white font-black text-sm max-w-[200px] truncate"></p>
                            <span class="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Pregătit</span>
                        </div>
                    </div>

                    <button id="btn-process-emag" disabled class="mt-6 w-full py-4 rounded-xl bg-blue-600 text-white font-black uppercase tracking-widest hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined">auto_fix_normal</span>
                        <span>Generează Fișier eMAG</span>
                    </button>
                </div>

                <div class="rounded-[2.5rem] border border-slate-700 bg-slate-800/50 p-8 shadow-2xl relative overflow-hidden group hover:border-orange-500/50 transition-colors">
                    <div class="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                         <span class="material-symbols-outlined text-[150px] text-orange-500">storefront</span>
                    </div>

                    <div class="flex items-center gap-4 mb-6 relative z-10">
                        <div class="h-12 w-12 rounded-xl bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-600/20">
                            <span class="material-symbols-outlined text-white text-2xl">local_offer</span>
                        </div>
                        <h2 class="text-3xl font-black text-white uppercase tracking-tight">Trendyol</h2>
                    </div>

                    <div id="drop-trendyol" class="border-4 border-dashed border-slate-700 bg-slate-900/50 rounded-3xl h-64 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-slate-900 transition-all relative">
                        <input type="file" id="input-trendyol" class="hidden" accept=".xlsx, .xls, .csv" />
                        
                        <div id="content-trendyol-idle" class="flex flex-col items-center gap-3 pointer-events-none transition-opacity">
                            <span class="material-symbols-outlined text-5xl text-slate-500">upload_file</span>
                            <p class="text-slate-400 font-bold uppercase text-xs tracking-widest">Trage fișierul Trendyol aici</p>
                        </div>

                        <div id="content-trendyol-active" class="hidden flex flex-col items-center gap-2 pointer-events-none animate-fade-in">
                            <span class="material-symbols-outlined text-5xl text-orange-500">description</span>
                            <p id="filename-trendyol" class="text-white font-black text-sm max-w-[200px] truncate"></p>
                            <span class="text-[10px] text-orange-400 font-bold uppercase tracking-widest">Pregătit</span>
                        </div>
                    </div>

                    <button id="btn-process-trendyol" disabled class="mt-6 w-full py-4 rounded-xl bg-orange-600 text-white font-black uppercase tracking-widest hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-600/20 transition-all flex items-center justify-center gap-2">
                         <span class="material-symbols-outlined">auto_fix_normal</span>
                         <span>Generează Fișier Trendyol</span>
                    </button>
                </div>

            </div>
            
            <div id="global-status" class="mt-8 text-center text-sm font-bold text-slate-500 hidden uppercase tracking-widest animate-pulse">
                Se procesează datele...
            </div>
        </div>
        `;
    };

    container.innerHTML = getHTML();

    // --- LOGICĂ UI (Drag & Drop + Butoane) ---

    // Helper Generic pentru UI
    const setupZone = (key, dropId, inputId, idleId, activeId, filenameId, btnId, processFn) => {
        const dropZone = document.getElementById(dropId);
        const input = document.getElementById(inputId);
        const btn = document.getElementById(btnId);

        const updateView = () => {
            if (status[key].file) {
                document.getElementById(idleId).classList.add('hidden');
                document.getElementById(activeId).classList.remove('hidden');
                document.getElementById(filenameId).innerText = status[key].file.name;
                btn.removeAttribute('disabled');
            } else {
                document.getElementById(idleId).classList.remove('hidden');
                document.getElementById(activeId).classList.add('hidden');
                btn.setAttribute('disabled', 'true');
            }
        };

        dropZone.onclick = () => input.click();
        
        input.onchange = (e) => {
            if (e.target.files.length) {
                status[key].file = e.target.files[0];
                updateView();
            }
        };

        dropZone.ondragover = (e) => { e.preventDefault(); dropZone.classList.add('bg-slate-800'); };
        dropZone.ondragleave = () => { dropZone.classList.remove('bg-slate-800'); };
        dropZone.ondrop = (e) => {
            e.preventDefault();
            dropZone.classList.remove('bg-slate-800');
            if (e.dataTransfer.files.length) {
                status[key].file = e.dataTransfer.files[0];
                updateView();
            }
        };

        btn.onclick = async () => {
            if (!status[key].file) return;
            
            btn.setAttribute('disabled', 'true');
            btn.innerHTML = `<span class="material-symbols-outlined animate-spin">progress_activity</span> PROCESARE...`;
            
            try {
                await processFn(status[key].file);
                // Reset după succes
                status[key].file = null;
                input.value = ''; // Reset input
                updateView();
                btn.innerHTML = `<span class="material-symbols-outlined">check_circle</span> FINALIZAT`;
                setTimeout(() => {
                    btn.innerHTML = `<span class="material-symbols-outlined">auto_fix_normal</span> Generează Fișier ${key === 'emag' ? 'eMAG' : 'Trendyol'}`;
                }, 2000);
            } catch (err) {
                alert('Eroare la procesare: ' + err.message);
                btn.removeAttribute('disabled');
                btn.innerHTML = `REÎNCEARCĂ`;
            }
        };
    };

    // Inițializare Zone
    setupZone('emag', 'drop-emag', 'input-emag', 'content-emag-idle', 'content-emag-active', 'filename-emag', 'btn-process-emag', processEmagFile);
    setupZone('trendyol', 'drop-trendyol', 'input-trendyol', 'content-trendyol-idle', 'content-trendyol-active', 'filename-trendyol', 'btn-process-trendyol', processTrendyolFile);
};
