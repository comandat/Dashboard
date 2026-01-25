/**
 * Add Expense View
 */
import { store } from '../store.js';
import { extractExpenseFromDocument, addExpense } from '../api.js';

export const renderAddExpense = (container, state) => {
    let drafts = [];
    let isSavingAll = false;
    let previewUrl = null;

    const getHTML = () => {
        return `
        <div class="mx-auto max-w-[1600px] w-full px-4 pb-20">
            <header class="mb-10 flex flex-wrap items-center justify-between gap-6">
                <div class="flex flex-col gap-2">
                    <button id="btn-back" 
                        class="flex items-center gap-2 text-slate-500 hover:text-white transition-colors uppercase text-xs font-black tracking-[0.2em] mb-4"
                    >
                        <span class="material-symbols-outlined text-sm">arrow_back</span>
                        Înapoi la Dashboard
                    </button>
                    <h1 class="text-4xl font-black text-white tracking-tight uppercase">Gestiune Cheltuieli</h1>
                    <p class="text-slate-400 text-lg">Încărcare documente pentru extracție AI (n8n + Gemini).</p>
                </div>
                
                <div class="flex items-center gap-4">
                    <button id="btn-manual"
                        class="flex h-14 items-center gap-3 rounded-2xl border-2 border-slate-700 bg-slate-800 px-8 text-base font-black text-slate-300 hover:text-white hover:border-slate-500 transition-all"
                    >
                        <span class="material-symbols-outlined text-2xl">edit_note</span>
                        ADĂUGARE MANUALĂ
                    </button>
                    
                    <button id="btn-save-all"
                        class="hidden flex h-14 items-center gap-3 rounded-2xl bg-primary-600 px-8 text-base font-black text-white hover:bg-primary-500 transition-all shadow-2xl shadow-primary-600/30 disabled:opacity-30 disabled:grayscale"
                    >
                        <span class="material-symbols-outlined text-2xl" id="icon-save-all">done_all</span>
                        <span id="text-save-all">SALVEAZĂ TOT</span>
                    </button>
                </div>
            </header>

            <section id="drop-zone"
                class="group relative mb-12 flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-[2.5rem] border-4 border-dashed border-slate-700 bg-slate-800/20 transition-all hover:border-primary-500 hover:bg-slate-800/40"
            >
                <input type="file" multiple id="file-input" class="hidden" />
                <div class="flex flex-row items-center gap-6 pointer-events-none">
                    <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 group-hover:bg-primary-600 transition-all shadow-inner group-hover:shadow-primary-500/50">
                        <span class="material-symbols-outlined text-3xl text-slate-500 group-hover:text-white">cloud_upload</span>
                    </div>
                    <div>
                        <h3 class="text-xl font-black text-white uppercase tracking-tight">Extracție Inteligentă n8n</h3>
                        <p class="text-slate-500 font-bold uppercase tracking-widest text-xs">Trage factura PDF aici pentru analiză Gemini</p>
                    </div>
                </div>
                
                <div class="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-slate-900/60 border border-slate-700 rounded-full">
                     <div class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50"></div>
                     <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">n8n Live: Gata</span>
                </div>
            </section>

            <div class="flex flex-col gap-4">
                <div class="flex items-center justify-between px-8 mb-2">
                    <h2 class="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">Validare Date Extrase</h2>
                </div>

                <div id="drafts-list" class="flex flex-col gap-4">
                    <!-- Drafts Rendered Here -->
                    <div id="empty-state" class="flex flex-col items-center justify-center py-24 text-slate-700 gap-6 grayscale opacity-20 border-2 border-dashed border-slate-800 rounded-[3rem]">
                        <span class="material-symbols-outlined text-9xl">post_add</span>
                        <p class="text-2xl font-black uppercase tracking-widest">Încarcă o factură pentru a începe</p>
                    </div>
                </div>
            </div>

            <!-- Preview Modal -->
            <div id="preview-modal" class="fixed inset-0 z-[100] hidden flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
                <div class="relative w-full max-w-5xl max-h-[90vh] bg-slate-900 rounded-[2.5rem] border border-slate-700 shadow-2xl overflow-hidden flex flex-col">
                    <div class="flex items-center justify-between px-8 py-6 border-b border-slate-700 bg-slate-800/50">
                        <h3 id="preview-title" class="text-lg font-black text-white uppercase tracking-tight">Preview</h3>
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
        const saveAllBtn = document.getElementById('btn-save-all');

        if (drafts.length === 0) {
            emptyState.style.display = 'flex';
            saveAllBtn.classList.add('hidden');
            return;
        }

        emptyState.style.display = 'none';
        saveAllBtn.classList.remove('hidden');

        // Update Save All Button State
        const hasProcessing = drafts.some(d => d.isProcessing);
        if (isSavingAll) {
            document.getElementById('text-save-all').innerText = 'SE SALVEAZĂ...';
            document.getElementById('icon-save-all').innerText = 'progress_activity';
            document.getElementById('icon-save-all').classList.add('animate-spin');
            saveAllBtn.setAttribute('disabled', 'true');
        } else {
            document.getElementById('text-save-all').innerText = 'SALVEAZĂ TOT';
            document.getElementById('icon-save-all').innerText = 'done_all';
            document.getElementById('icon-save-all').classList.remove('animate-spin');
            if (hasProcessing) {
                saveAllBtn.setAttribute('disabled', 'true');
            } else {
                saveAllBtn.removeAttribute('disabled');
            }
        }

        // Render List
        // Note: In vanilla, naively re-rendering inputs causes loss of focus. 
        // We really should use a diff or only re-render if structure changes.
        // For simplicity in this demo, we re-render entirely. 
        // Use 'input' event to update state immediately so re-renders don't revert data.

        list.innerHTML = drafts.map(draft => `
            <div 
                class="rounded-[2.5rem] border transition-all p-8 flex flex-col lg:flex-row gap-8 items-start lg:items-center relative overflow-hidden bg-slate-800 shadow-xl ${draft.isProcessing ? 'border-amber-500/30' : draft.error ? 'border-red-500/50' : 'border-slate-700'
            } ${draft.isManual ? 'bg-slate-800/80 border-slate-600' : 'hover:border-primary-500/50'}"
            >
                <div class="absolute left-0 top-0 bottom-0 w-2.5 ${draft.isProcessing ? 'bg-amber-500' : draft.error ? 'bg-red-500' : draft.isManual ? 'bg-slate-500' : 'bg-primary-500'}"></div>

                <div class="w-full lg:w-1/4 ${!draft.isManual ? 'cursor-pointer group/item' : ''} btn-preview" data-id="${draft.tempId}">
                    <div class="flex items-center gap-4 mb-3">
                        <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-inner border transition-all relative ${draft.isManual ? 'bg-slate-700 text-slate-400 border-slate-600' : 'bg-slate-900 text-primary-400 border-slate-700 group-hover/item:border-primary-500 group-hover/item:bg-primary-600 group-hover/item:text-white'
            }">
                            <span class="material-symbols-outlined text-3xl ${draft.isProcessing ? 'animate-spin' : ''}">
                                ${draft.isProcessing ? 'progress_activity' : draft.isManual ? 'edit_square' : 'description'}
                            </span>
                        </div>
                        <div class="overflow-hidden">
                            <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate max-w-[200px]">${draft.fileName}</p>
                            <h3 class="text-lg font-black text-white truncate uppercase tracking-tight transition-colors ${!draft.isManual ? 'group-hover/item:text-primary-400' : ''}">
                                ${draft.isProcessing ? 'Gemini Analizează...' : draft.error ? 'Eroare Webhook' : draft.isManual ? 'Intrare Manuală' : 'Date Extrase'}
                            </h3>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="h-2 w-2 rounded-full ${draft.isProcessing ? 'bg-amber-500 animate-pulse' : draft.error ? 'bg-red-500' : 'bg-emerald-500'}"></span>
                        <p class="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">
                            ${draft.isProcessing ? 'Așteptare răspuns n8n' : draft.error ? draft.error : 'Click pentru document'}
                        </p>
                    </div>
                </div>

                <div class="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                    <div class="flex flex-col gap-2">
                        <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Furnizor</label>
                        <input 
                            value="${draft.vendor || ''}" 
                            ${draft.isProcessing ? 'disabled' : ''}
                            data-id="${draft.tempId}" data-field="vendor"
                            class="draft-input rounded-2xl bg-slate-900 border border-slate-700 px-5 py-4 text-sm font-bold text-white focus:border-primary-500 focus:outline-none transition-all shadow-inner"
                        />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Sumă (RON)</label>
                        <input 
                            type="number"
                            value="${draft.amount || ''}" 
                            ${draft.isProcessing ? 'disabled' : ''}
                            data-id="${draft.tempId}" data-field="amount"
                            class="draft-input rounded-2xl bg-slate-900 border border-slate-700 px-5 py-4 text-sm font-bold text-white focus:border-primary-500 focus:outline-none transition-all shadow-inner"
                        />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Data Facturii</label>
                        <input 
                            type="date"
                            value="${draft.date || ''}" 
                            ${draft.isProcessing ? 'disabled' : ''}
                            data-id="${draft.tempId}" data-field="date"
                            class="draft-input rounded-2xl bg-slate-900 border border-slate-700 px-5 py-4 text-sm font-bold text-white focus:border-primary-500 focus:outline-none transition-all shadow-inner"
                        />
                    </div>
                    <div class="flex flex-col gap-2">
                        <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Serie/Nr</label>
                        <input 
                            value="${draft.invoice_id || ''}" 
                            ${draft.isProcessing ? 'disabled' : ''}
                            data-id="${draft.tempId}" data-field="invoice_id"
                            class="draft-input rounded-2xl bg-slate-900 border border-slate-700 px-5 py-4 text-sm font-bold text-white focus:border-primary-500 focus:outline-none transition-all shadow-inner"
                        />
                    </div>
                </div>

                <div class="w-full lg:w-auto flex items-center gap-3">
                    <button 
                        data-id="${draft.tempId}"
                        class="btn-save flex-1 lg:flex-none flex h-14 items-center justify-center gap-3 rounded-2xl bg-emerald-600 px-8 text-xs font-black text-white hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-30 disabled:grayscale"
                        ${draft.isProcessing || !draft.vendor || !draft.amount ? 'disabled' : ''}
                    >
                        <span class="material-symbols-outlined text-lg">check_circle</span>
                        VERIFICAT
                    </button>
                    <button 
                        data-id="${draft.tempId}"
                        class="btn-delete flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-700 text-slate-500 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/50 transition-all"
                    >
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                </div>
            </div>
        `).join('');

        // Attach listeners
        // Inputs
        document.querySelectorAll('.draft-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const id = e.target.getAttribute('data-id');
                const field = e.target.getAttribute('data-field');
                const val = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
                const draft = drafts.find(d => d.tempId === id);
                if (draft) {
                    draft[field] = val;
                    // Don't re-render entire list on keypress to keep focus, just update object
                    // Only re-render if we need to update status buttons (e.g. valid/invalid)
                    // For now, let's update button status manually
                    const btn = document.querySelector(`.btn-save[data-id="${id}"]`);
                    if (draft.vendor && draft.amount && !draft.isProcessing) {
                        btn.removeAttribute('disabled');
                    } else {
                        btn.setAttribute('disabled', 'true');
                    }
                }
            });
        });

        // Save Button
        document.querySelectorAll('.btn-save').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const draft = drafts.find(d => d.tempId === id);
                if (draft) {
                    await addExpense({
                        vendor: draft.vendor,
                        amount: draft.amount,
                        date: draft.date,
                        category: draft.category || 'Logistica',
                        invoice_id: draft.invoice_id
                    });
                    drafts = drafts.filter(d => d.tempId !== id);
                    renderDrafts();
                }
            });
        });

        // Delete Button
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                drafts = drafts.filter(d => d.tempId !== id);
                renderDrafts();
            });
        });

        // Preview
        document.querySelectorAll('.btn-preview').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const draft = drafts.find(d => d.tempId === id);
                if (draft && !draft.isManual && draft.file) {
                    openPreview(draft);
                }
            });
        });
    };

    const openPreview = (draft) => {
        const url = URL.createObjectURL(draft.file);
        previewUrl = { url, type: draft.file.type, name: draft.fileName };
        const modal = document.getElementById('preview-modal');
        const content = document.getElementById('preview-content');
        const title = document.getElementById('preview-title');

        title.innerText = draft.fileName;
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
            vendor: '',
            amount: 0,
            date: new Date().toISOString().split('T')[0],
            category: 'Logistica',
            file: file
        }));

        drafts = [...newDrafts, ...drafts];
        renderDrafts();

        // Process sequentially to be nice to n8n
        for (const draft of newDrafts) {
            try {
                const result = await extractExpenseFromDocument(draft.file);
                // Update draft in array
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
                    target.error = 'Eroare Webhook';
                    renderDrafts();
                }
            }
        }
    };

    container.innerHTML = getHTML();
    renderDrafts();

    // Event Listeners for Page
    document.getElementById('btn-back').onclick = () => store.setView('dashboard');

    document.getElementById('btn-manual').onclick = () => {
        drafts = [{
            tempId: Math.random().toString(36).substr(2, 9),
            fileName: 'Introducere Manuală',
            isProcessing: false,
            isManual: true,
            vendor: '',
            amount: 0,
            date: new Date().toISOString().split('T')[0],
            category: 'Salarii'
        }, ...drafts];
        renderDrafts();
    };

    document.getElementById('btn-save-all').onclick = async () => {
        isSavingAll = true;
        renderDrafts();

        const validDrafts = drafts.filter(d => !d.isProcessing && d.vendor && d.amount);
        for (const draft of validDrafts) {
            await addExpense({
                vendor: draft.vendor,
                amount: draft.amount,
                date: draft.date,
                category: draft.category || 'Logistica',
                invoice_id: draft.invoice_id
            });
        }

        drafts = drafts.filter(d => d.isProcessing || !d.vendor || !d.amount); // Keep unprocessed
        isSavingAll = false;
        renderDrafts();
        if (drafts.length === 0) store.setView('financial');
    };

    // Drag and Drop
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');

    dropZone.onclick = () => fileInput.click();
    fileInput.onchange = (e) => handleFiles(e.target.files);

    dropZone.ondragover = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; };
    dropZone.ondrop = (e) => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
    };

    // Preview Modal Close
    document.getElementById('preview-close').onclick = () => {
        document.getElementById('preview-modal').classList.add('hidden');
        if (previewUrl) URL.revokeObjectURL(previewUrl.url);
        previewUrl = null;
    };
};
