/**
 * Add Expense View
 * Gestionare încărcare facturi, validare și trimitere Batch către n8n
 */
import { store } from '../store.js';
import { extractExpenseFromDocument, syncExpenses } from '../api.js';

export const renderAddExpense = (container, state) => {
    let drafts = [];
    let isSavingAll = false;
    let previewUrl = null;

    const CATEGORIES = ["COMISIOANE", "TRANSPORT", "INFRASTRUCTURA", "TAXE", "SALARII", "OPERATIONAL", "ALTELE"];

    const getHTML = () => {
        return `
        <div class="mx-auto max-w-[1800px] w-full px-4 pb-20">
            <header class="mb-10 flex flex-wrap items-center justify-between gap-6">
                <div class="flex flex-col gap-2">
                    <button id="btn-back" class="flex items-center gap-2 text-slate-500 hover:text-white transition-colors uppercase text-xs font-black tracking-[0.2em] mb-4">
                        <span class="material-symbols-outlined text-sm">arrow_back</span>
                        Înapoi la Dashboard
                    </button>
                    <h1 class="text-4xl font-black text-white tracking-tight uppercase">Gestiune Cheltuieli</h1>
                    <p class="text-slate-400 text-lg">Încărcare și validare facturi pentru contabilitate.</p>
                </div>

                <div class="flex items-center gap-4">
                    <button id="btn-manual" class="flex h-14 items-center gap-3 rounded-2xl border-2 border-slate-700 bg-slate-800 px-8 text-base font-black text-slate-300 hover:text-white hover:border-slate-500 transition-all">
                        <span class="material-symbols-outlined text-2xl">edit_note</span>
                        ADĂUGARE MANUALĂ
                    </button>

                    <button id="btn-save-all" class="hidden flex h-14 items-center gap-3 rounded-2xl bg-emerald-600 px-8 text-base font-black text-white hover:bg-emerald-500 transition-all shadow-2xl shadow-emerald-600/30 disabled:opacity-50 disabled:grayscale">
                        <span class="material-symbols-outlined text-2xl" id="icon-save-all">cloud_upload</span>
                        <span id="text-save-all">ÎNCARCĂ TOATE CHELTUIELILE</span>
                    </button>
                </div>
            </header>

            <section id="drop-zone" class="group relative mb-12 flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-[2.5rem] border-4 border-dashed border-slate-700 bg-slate-800/20 transition-all hover:border-primary-500 hover:bg-slate-800/40">
                <input type="file" multiple id="file-input" class="hidden" />
                <div class="flex flex-row items-center gap-6 pointer-events-none">
                    <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 group-hover:bg-primary-600 transition-all shadow-inner group-hover:shadow-primary-500/50">
                        <span class="material-symbols-outlined text-3xl text-slate-500 group-hover:text-white">cloud_upload</span>
                    </div>
                    <div>
                        <h3 class="text-lg font-black text-white uppercase tracking-tight">Extracție Inteligentă</h3>
                        <p class="text-slate-500 font-bold uppercase tracking-widest text-xs">Trage facturile aici (PDF/IMG)</p>
                    </div>
                </div>
            </section>

            <div class="flex flex-col gap-4">
                <div id="empty-state" class="flex flex-col items-center justify-center py-12 text-slate-700 gap-4 grayscale opacity-30 border-2 border-dashed border-slate-800 rounded-[3rem]">
                    <span class="material-symbols-outlined text-6xl">source_notes</span>
                    <p class="text-xl font-black uppercase tracking-widest">Așteptare documente...</p>
                </div>
                
                <div id="table-header" class="hidden xl:grid grid-cols-[250px_1fr_40px] gap-6 px-8 mb-2">
                    <div></div>
                    <div class="grid grid-cols-7 gap-3">
                         <span class="text-[9px] font-black text-slate-500 uppercase px-2">Furnizor</span>
                         <span class="text-[9px] font-black text-slate-500 uppercase px-2">Serie/Nr</span>
                         <span class="text-[9px] font-black text-slate-500 uppercase px-2">Suma (Net)</span>
                         <span class="text-[9px] font-black text-slate-500 uppercase px-2">Moneda</span>
                         <span class="text-[9px] font-black text-slate-500 uppercase px-2">TVA</span>
                         <span class="text-[9px] font-black text-slate-500 uppercase px-2">Data Facturii</span>
                         <span class="text-[9px] font-black text-slate-500 uppercase px-2">Categoria Platii</span>
                    </div>
                </div>

                <div id="drafts-list" class="flex flex-col gap-3"></div>
            </div>

            <div id="preview-modal" class="fixed inset-0 z-[100] hidden flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
                <div class="relative w-full max-w-5xl max-h-[90vh] bg-slate-900 rounded-[2.5rem] border border-slate-700 shadow-2xl overflow-hidden flex flex-col">
                    <div class="flex items-center justify-between px-8 py-6 border-b border-slate-700 bg-slate-800/50">
                        <h3 id="preview-title" class="text-lg font-black text-white uppercase tracking-tight">Previzualizare</h3>
                        <button id="preview-close" class="text-slate-400 hover:text-white">Închide</button>
                    </div>
                    <div id="preview-content" class="flex-1 overflow-auto bg-slate-950 p-8"></div>
                </div>
            </div>
        </div>
        `;
    };

    const renderDrafts = () => {
        const list = document.getElementById('drafts-list');
        const emptyState = document.getElementById('empty-state');
        const header = document.getElementById('table-header');
        const saveAllBtn = document.getElementById('btn-save-all');

        if (drafts.length === 0) {
            list.innerHTML = '';
            emptyState.style.display = 'flex';
            if(header) header.style.display = 'none';
            saveAllBtn.classList.add('hidden');
            return;
        }

        emptyState.style.display = 'none';
        if(header) header.style.display = 'grid'; 
        saveAllBtn.classList.remove('hidden');

        // Loading State for Button
        if (isSavingAll) {
            document.getElementById('text-save-all').innerText = 'SE VERIFICĂ & SALVEAZĂ...';
            document.getElementById('icon-save-all').innerText = 'hourglass_top';
            document.getElementById('icon-save-all').classList.add('animate-spin');
            saveAllBtn.setAttribute('disabled', 'true');
        } else {
            const anyProcessing = drafts.some(d => d.isProcessing);
            document.getElementById('text-save-all').innerText = 'ÎNCARCĂ TOATE CHELTUIELILE';
            document.getElementById('icon-save-all').innerText = 'cloud_upload';
            document.getElementById('icon-save-all').classList.remove('animate-spin');
            
            if (anyProcessing) saveAllBtn.setAttribute('disabled', 'true');
            else saveAllBtn.removeAttribute('disabled');
        }

        list.innerHTML = drafts.map(draft => `
            <div class="rounded-3xl border transition-all p-4 flex flex-col xl:flex-row gap-6 items-start xl:items-center relative shadow-lg 
                ${draft.isProcessing ? 'opacity-70 border-slate-700' : 
                  draft.error ? 'border-red-500 bg-red-500/5' : 'border-slate-700 bg-slate-800 hover:border-slate-600'}">
                
                <div class="flex items-center gap-4 w-full xl:w-[250px] shrink-0 border-b xl:border-b-0 border-slate-700/50 pb-4 xl:pb-0">
                     <div class="btn-preview cursor-pointer h-12 w-12 flex items-center justify-center rounded-xl ${draft.isProcessing ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-700 text-slate-300 hover:bg-primary-600 hover:text-white'} transition-colors shadow-inner" data-id="${draft.tempId}">
                        <span class="material-symbols-outlined text-xl">${draft.isProcessing ? 'sync' : 'visibility'}</span>
                     </div>
                     <div class="overflow-hidden">
                        <p class="text-xs font-black text-white uppercase truncate" title="${draft.fileName}">${draft.fileName}</p>
                        ${draft.error 
                            ? `<p class="text-[10px] font-bold text-red-500 uppercase tracking-widest animate-pulse flex items-center gap-1"><span class="material-symbols-outlined text-xs">warning</span> DUPLICAT</p>`
                            : `<p class="text-[10px] font-bold ${draft.isProcessing ? 'text-amber-500' : 'text-emerald-500'} uppercase tracking-widest">
                                ${draft.isProcessing ? 'Se extrage...' : 'Pregătit'}
                               </p>`
                        }
                     </div>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 w-full">
                    
                    <div class="col-span-2 lg:col-span-1">
                        <label class="xl:hidden text-[9px] font-black text-slate-500 uppercase px-2 mb-1 block">Furnizor</label>
                        <input value="${draft.vendor || ''}" ${draft.isProcessing ? 'disabled' : ''} data-id="${draft.tempId}" data-field="vendor"
                            class="draft-input w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-3 text-xs font-bold text-white focus:border-primary-500 outline-none shadow-inner placeholder-slate-600" placeholder="Nume Furnizor" />
                    </div>

                    <div class="col-span-2 lg:col-span-1">
                        <label class="xl:hidden text-[9px] font-black text-slate-500 uppercase px-2 mb-1 block">Serie/Nr</label>
                        <input value="${draft.invoice_id || ''}" ${draft.isProcessing ? 'disabled' : ''} data-id="${draft.tempId}" data-field="invoice_id"
                            class="draft-input w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-3 text-xs font-bold text-white focus:border-primary-500 outline-none shadow-inner" placeholder="Fara Serie" />
                    </div>

                    <div class="col-span-1">
                        <label class="xl:hidden text-[9px] font-black text-slate-500 uppercase px-2 mb-1 block">Suma</label>
                        <input type="number" step="0.01" value="${draft.amount || ''}" ${draft.isProcessing ? 'disabled' : ''} data-id="${draft.tempId}" data-field="amount"
                            class="draft-input w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-3 text-xs font-bold text-white focus:border-primary-500 outline-none shadow-inner" placeholder="0.00" />
                    </div>

                    <div class="col-span-1">
                        <label class="xl:hidden text-[9px] font-black text-slate-500 uppercase px-2 mb-1 block">Moneda</label>
                        <input type="text" value="${draft.currency || 'RON'}" ${draft.isProcessing ? 'disabled' : ''} data-id="${draft.tempId}" data-field="currency"
                            class="draft-input w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-3 text-xs font-bold text-white focus:border-primary-500 outline-none uppercase text-center shadow-inner" />
                    </div>

                    <div class="col-span-1">
                        <label class="xl:hidden text-[9px] font-black text-slate-500 uppercase px-2 mb-1 block">TVA</label>
                        <input type="number" step="0.01" value="${draft.tva || 0}" ${draft.isProcessing ? 'disabled' : ''} data-id="${draft.tempId}" data-field="tva"
                            class="draft-input w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-3 text-xs font-bold text-amber-400 focus:border-primary-500 outline-none shadow-inner" />
                    </div>

                    <div class="col-span-2 lg:col-span-1">
                        <label class="xl:hidden text-[9px] font-black text-slate-500 uppercase px-2 mb-1 block">Data Facturii</label>
                        <input type="date" value="${draft.date || ''}" ${draft.isProcessing ? 'disabled' : ''} data-id="${draft.tempId}" data-field="date"
                            class="draft-input w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-3 text-xs font-bold text-white focus:border-primary-500 outline-none shadow-inner" />
                    </div>

                    <div class="col-span-2 lg:col-span-1">
                        <label class="xl:hidden text-[9px] font-black text-slate-500 uppercase px-2 mb-1 block">Categoria Platii</label>
                        <div class="relative">
                            <select data-id="${draft.tempId}" data-field="category" ${draft.isProcessing ? 'disabled' : ''}
                                class="draft-input w-full appearance-none bg-slate-900 border border-slate-700 rounded-xl px-3 py-3 text-xs font-bold text-white focus:border-primary-500 outline-none shadow-inner cursor-pointer">
                                ${CATEGORIES.map(cat => `<option value="${cat}" ${draft.category === cat ? 'selected' : ''}>${cat}</option>`).join('')}
                            </select>
                            <span class="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-sm text-slate-500 pointer-events-none">expand_more</span>
                        </div>
                    </div>
                </div>

                <button data-id="${draft.tempId}" class="btn-delete flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 text-slate-500 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/50 transition-all ml-2">
                    <span class="material-symbols-outlined text-lg">delete</span>
                </button>
                
                ${draft.error ? `<div class="absolute inset-0 bg-red-500/5 pointer-events-none rounded-3xl border border-red-500/20"></div>` : ''}
            </div>
        `).join('');

        // Funcție helper pentru determinarea cotei TVA
        const getVatRate = (dateString) => {
            if (!dateString) return 0.21; // Default
            return dateString < '2025-08-01' ? 0.19 : 0.21;
        };

        // Event Listeners for Inputs
        document.querySelectorAll('.draft-input').forEach(input => {
            input.oninput = (e) => {
                const id = e.target.getAttribute('data-id');
                const field = e.target.getAttribute('data-field');
                let val = e.target.value;
                if(e.target.type === 'number') val = parseFloat(val);
                
                const draft = drafts.find(d => d.tempId === id);
                if (draft) {
                    draft[field] = val;

                    // Resetare eroare la modificare
                    if (draft.error) {
                        draft.error = false;
                        renderDrafts(); 
                        return;
                    }

                    // CAZ 1: Se modifică SUMA -> Recalculăm TVA conform datei curente
                    if (field === 'amount' && !isNaN(val)) {
                        const rate = getVatRate(draft.date);
                        const newTva = parseFloat((val * rate).toFixed(2));
                        
                        draft.tva = newTva;
                        
                        // Actualizăm vizual input-ul de TVA
                        const tvaInput = document.querySelector(`.draft-input[data-id="${id}"][data-field="tva"]`);
                        if (tvaInput) tvaInput.value = newTva;
                    }

                    // CAZ 2: Se modifică DATA -> Recalculăm TVA pentru suma existentă
                    if (field === 'date') {
                        const amount = parseFloat(draft.amount) || 0;
                        if (amount > 0) {
                            const rate = getVatRate(val);
                            const newTva = parseFloat((amount * rate).toFixed(2));
                            
                            draft.tva = newTva;

                            // Actualizăm vizual input-ul de TVA
                            const tvaInput = document.querySelector(`.draft-input[data-id="${id}"][data-field="tva"]`);
                            if (tvaInput) tvaInput.value = newTva;
                        }
                    }
                }
            };
        });

        list.onclick = async (e) => {
            const deleteBtn = e.target.closest('.btn-delete');
            if (deleteBtn) {
                const id = deleteBtn.getAttribute('data-id');
                drafts = drafts.filter(d => d.tempId !== id);
                renderDrafts();
                return;
            }
            const previewBtn = e.target.closest('.btn-preview');
            if (previewBtn) {
                const id = previewBtn.getAttribute('data-id');
                const draft = drafts.find(d => d.tempId === id);
                if (draft && !draft.isManual && draft.file) openPreview(draft);
                return;
            }
        };
    };

    const openPreview = (draft) => {
        const url = URL.createObjectURL(draft.file);
        previewUrl = { url, type: draft.file.type, name: draft.fileName };
        const modal = document.getElementById('preview-modal');
        const content = document.getElementById('preview-content');
        document.getElementById('preview-title').innerText = draft.fileName;
        content.innerHTML = draft.file.type.includes('pdf')
            ? `<iframe src="${url}" class="w-full h-full min-h-[70vh] rounded-xl" title="PDF Preview"></iframe>`
            : `<img src="${url}" alt="Preview" class="max-w-full h-auto mx-auto rounded-xl" />`;
        modal.classList.remove('hidden');
    }

    const handleFiles = async (files) => {
        const newDrafts = Array.from(files).map(file => ({
            tempId: Math.random().toString(36).substr(2, 9),
            fileName: file.name,
            isProcessing: true,
            file: file,
            vendor: '', invoice_id: '', amount: 0, tva: 0, currency: 'RON', 
            date: new Date().toISOString().split('T')[0], category: 'ALTELE'
        }));
        drafts = [...newDrafts, ...drafts];
        renderDrafts();

        for (const draft of newDrafts) {
            try {
                const result = await extractExpenseFromDocument(draft.file);
                const target = drafts.find(d => d.tempId === draft.tempId);
                if (target) {
                    Object.assign(target, result); 
                    target.isProcessing = false;
                    renderDrafts();
                }
            } catch (err) {
                const target = drafts.find(d => d.tempId === draft.tempId);
                if (target) {
                    target.isProcessing = false;
                    target.vendor = 'Eroare Extracție';
                    renderDrafts();
                }
            }
        }
    };

    container.innerHTML = getHTML();
    renderDrafts();

    document.getElementById('btn-back').onclick = () => store.setView('dashboard');
    document.getElementById('btn-manual').onclick = () => {
        drafts = [{
            tempId: Math.random().toString(36).substr(2, 9),
            fileName: 'MANUAL',
            isProcessing: false,
            isManual: true,
            vendor: '', invoice_id: '', amount: 0, tva: 0, currency: 'RON',
            date: new Date().toISOString().split('T')[0], category: 'ALTELE'
        }, ...drafts];
        renderDrafts();
    };

    document.getElementById('btn-save-all').onclick = async () => {
        isSavingAll = true;
        renderDrafts();

        const validDrafts = drafts.filter(d => !d.isProcessing && d.vendor && d.amount && !d.error);
        
        if (validDrafts.length === 0) {
            isSavingAll = false;
            renderDrafts();
            return;
        }

        const payload = validDrafts.map(draft => {
            const totalVal = (parseFloat(draft.amount) + parseFloat(draft.tva)).toFixed(2);
            return {
                tempId: draft.tempId,
                // MODIFICARE: Adăugăm prefixul MANUAL-INTERNAL- pentru a proteja la ștergerea automată
                source_doc: 'MANUAL-INTERNAL-' + (draft.invoice_id || ''), 
                furnizor: draft.vendor,
                factura_valoare: Number(draft.amount),
                factura_tva: Number(draft.tva),
                factura_total: Number(totalVal),
                factura_moneda: draft.currency,
                date: draft.date,
                category: draft.category
            };
        });

        const response = await syncExpenses(payload);

        if (response.error) {
            alert("Eroare de comunicare cu serverul.");
            isSavingAll = false;
            renderDrafts();
            return;
        }

        const savedIds = [];
        let duplicateCount = 0;

        if (response.results && Array.isArray(response.results)) {
            response.results.forEach(res => {
                const draft = drafts.find(d => d.tempId === res.tempId);
                if (!draft) return;

                if (res.status === 'saved') {
                    savedIds.push(res.tempId);
                } else if (res.status === 'duplicate') {
                    draft.error = true; 
                    duplicateCount++;
                }
            });
        }

        drafts = drafts.filter(d => !savedIds.includes(d.tempId));
        
        isSavingAll = false;
        renderDrafts();

        if (duplicateCount > 0) {
            console.log("Duplicate detectate");
        } else if (drafts.length === 0) {
            store.setView('financial');
        }
    };

    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    dropZone.onclick = () => fileInput.click();
    fileInput.onchange = (e) => handleFiles(e.target.files);
    dropZone.ondragover = (e) => { e.preventDefault(); };
    dropZone.ondrop = (e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); };
    document.getElementById('preview-close').onclick = () => {
        document.getElementById('preview-modal').classList.add('hidden');
        if (previewUrl) URL.revokeObjectURL(previewUrl.url);
        previewUrl = null;
    };
};
