
import React, { useState, useRef, useEffect } from 'react';
import { ExpenseCategory, Expense } from '../types';
import { addExpense, extractExpenseFromDocument } from '../services/api';

interface AddExpensePageProps {
    onBack: () => void;
}

interface DraftExpense extends Partial<Expense> {
    tempId: string;
    isProcessing: boolean;
    fileName: string;
    isManual?: boolean;
    file?: File;
    error?: string;
}

const AddExpensePage: React.FC<AddExpensePageProps> = ({ onBack }) => {
    const [drafts, setDrafts] = useState<DraftExpense[]>([]);
    const [isSavingAll, setIsSavingAll] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<{ url: string, type: string, name: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl.url);
        };
    }, [previewUrl]);

    const handleFileUpload = async (files: FileList | null) => {
        if (!files) return;

        const newEntries: DraftExpense[] = Array.from(files).map(file => ({
            tempId: Math.random().toString(36).substr(2, 9),
            fileName: file.name,
            isProcessing: true,
            vendor: '',
            amount: 0,
            date: new Date().toISOString().split('T')[0],
            category: 'Logistica',
            file: file
        }));

        setDrafts(prev => [...newEntries, ...prev]);

        // Procesăm fiecare fișier individual prin n8n
        for (const entry of newEntries) {
            try {
                const extracted = await extractExpenseFromDocument(entry.file!);
                
                setDrafts(current => 
                    current.map(d => d.tempId === entry.tempId ? { 
                        ...d, 
                        ...extracted, 
                        isProcessing: false 
                    } : d)
                );
            } catch (err) {
                setDrafts(current => 
                    current.map(d => d.tempId === entry.tempId ? { 
                        ...d, 
                        isProcessing: false, 
                        error: 'Eroare la conexiunea cu n8n' 
                    } : d)
                );
            }
        }
    };

    const handleAddManualEntry = () => {
        const manualDraft: DraftExpense = {
            tempId: Math.random().toString(36).substr(2, 9),
            fileName: 'Introducere Manuală',
            isProcessing: false,
            isManual: true,
            vendor: '',
            amount: 0,
            date: new Date().toISOString().split('T')[0],
            category: 'Salarii'
        };
        setDrafts(prev => [manualDraft, ...prev]);
    };

    const handleOpenPreview = (draft: DraftExpense) => {
        if (!draft.file) return;
        const url = URL.createObjectURL(draft.file);
        setPreviewUrl({
            url: url,
            type: draft.file.type,
            name: draft.fileName
        });
    };

    const handleClosePreview = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl.url);
        setPreviewUrl(null);
    };

    const handleUpdateDraft = (tempId: string, field: keyof DraftExpense, value: any) => {
        setDrafts(current => current.map(d => d.tempId === tempId ? { ...d, [field]: value } : d));
    };

    const handleRemoveDraft = (tempId: string) => {
        setDrafts(current => current.filter(d => d.tempId !== tempId));
    };

    const handleSaveExpense = async (draft: DraftExpense) => {
        if (!draft.vendor || !draft.amount) return;
        
        const success = await addExpense({
            vendor: draft.vendor,
            amount: draft.amount,
            date: draft.date || '',
            category: draft.category || 'Logistica',
            invoice_id: draft.invoice_id
        });

        if (success) {
            handleRemoveDraft(draft.tempId);
        }
    };

    const handleSaveAll = async () => {
        setIsSavingAll(true);
        const validDrafts = drafts.filter(d => !d.isProcessing && d.vendor && d.amount);
        
        for (const draft of validDrafts) {
            await addExpense({
                vendor: draft.vendor || '',
                amount: draft.amount || 0,
                date: draft.date || '',
                category: draft.category || 'Logistica',
                invoice_id: draft.invoice_id
            });
        }
        
        setIsSavingAll(false);
        onBack();
    };

    return (
        <div className="mx-auto max-w-[1600px] w-full px-4 pb-20">
            <header className="mb-10 flex flex-wrap items-center justify-between gap-6">
                <div className="flex flex-col gap-2">
                    <button 
                        onClick={onBack} 
                        className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors uppercase text-xs font-black tracking-[0.2em] mb-4"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Înapoi la Dashboard
                    </button>
                    <h1 className="text-4xl font-black text-white tracking-tight uppercase">Gestiune Cheltuieli</h1>
                    <p className="text-slate-400 text-lg">Încărcare documente pentru extracție AI (n8n + Gemini).</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleAddManualEntry}
                        className="flex h-14 items-center gap-3 rounded-2xl border-2 border-slate-700 bg-slate-800 px-8 text-base font-black text-slate-300 hover:text-white hover:border-slate-500 transition-all"
                    >
                        <span className="material-symbols-outlined text-2xl">edit_note</span>
                        ADĂUGARE MANUALĂ
                    </button>
                    
                    {drafts.length > 0 && (
                        <button 
                            onClick={handleSaveAll}
                            disabled={isSavingAll || drafts.some(d => d.isProcessing)}
                            className="flex h-14 items-center gap-3 rounded-2xl bg-primary-600 px-8 text-base font-black text-white hover:bg-primary-500 transition-all shadow-2xl shadow-primary-600/30 disabled:opacity-30 disabled:grayscale"
                        >
                            <span className="material-symbols-outlined text-2xl">{isSavingAll ? 'progress_activity' : 'done_all'}</span>
                            {isSavingAll ? 'SE SALVEAZĂ...' : 'SALVEAZĂ TOT'}
                        </button>
                    )}
                </div>
            </header>

            <section 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    handleFileUpload(e.dataTransfer.files);
                }}
                className="group relative mb-12 flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-[2.5rem] border-4 border-dashed border-slate-700 bg-slate-800/20 transition-all hover:border-primary-500 hover:bg-slate-800/40"
            >
                <input 
                    type="file" 
                    multiple 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={(e) => handleFileUpload(e.target.files)}
                />
                <div className="flex flex-row items-center gap-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 group-hover:bg-primary-600 transition-all shadow-inner group-hover:shadow-primary-500/50">
                        <span className="material-symbols-outlined text-3xl text-slate-500 group-hover:text-white">cloud_upload</span>
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Extracție Inteligentă n8n</h3>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Trage factura PDF aici pentru analiză Gemini</p>
                    </div>
                </div>
                
                <div className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-slate-900/60 border border-slate-700 rounded-full">
                     <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50"></div>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">n8n Live: Gata</span>
                </div>
            </section>

            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-8 mb-2">
                    <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em]">Validare Date Extrase</h2>
                </div>

                {drafts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-700 gap-6 grayscale opacity-20 border-2 border-dashed border-slate-800 rounded-[3rem]">
                        <span className="material-symbols-outlined text-9xl">post_add</span>
                        <p className="text-2xl font-black uppercase tracking-widest">Încarcă o factură pentru a începe</p>
                    </div>
                ) : (
                    drafts.map((draft) => (
                        <div 
                            key={draft.tempId} 
                            className={`rounded-[2.5rem] border transition-all p-8 flex flex-col lg:flex-row gap-8 items-start lg:items-center relative overflow-hidden bg-slate-800 shadow-xl ${
                                draft.isProcessing ? 'border-amber-500/30' : draft.error ? 'border-red-500/50' : 'border-slate-700'
                            } ${draft.isManual ? 'bg-slate-800/80 border-slate-600' : 'hover:border-primary-500/50'}`}
                        >
                            <div className={`absolute left-0 top-0 bottom-0 w-2.5 ${draft.isProcessing ? 'bg-amber-500' : draft.error ? 'bg-red-500' : draft.isManual ? 'bg-slate-500' : 'bg-primary-500'}`}></div>

                            <div 
                                className={`w-full lg:w-1/4 ${!draft.isManual ? 'cursor-pointer group/item' : ''}`}
                                onClick={() => !draft.isManual && handleOpenPreview(draft)}
                            >
                                <div className="flex items-center gap-4 mb-3">
                                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-inner border transition-all relative ${
                                        draft.isManual ? 'bg-slate-700 text-slate-400 border-slate-600' : 'bg-slate-900 text-primary-400 border-slate-700 group-hover/item:border-primary-500 group-hover/item:bg-primary-600 group-hover/item:text-white'
                                    }`}>
                                        <span className={`material-symbols-outlined text-3xl ${draft.isProcessing ? 'animate-spin' : ''}`}>
                                            {draft.isProcessing ? 'progress_activity' : draft.isManual ? 'edit_square' : 'description'}
                                        </span>
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate max-w-[200px]">{draft.fileName}</p>
                                        <h3 className={`text-lg font-black text-white truncate uppercase tracking-tight transition-colors ${!draft.isManual ? 'group-hover/item:text-primary-400' : ''}`}>
                                            {draft.isProcessing ? 'Gemini Analizează...' : draft.error ? 'Eroare Webhook' : draft.isManual ? 'Intrare Manuală' : 'Date Extrase'}
                                        </h3>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`h-2 w-2 rounded-full ${draft.isProcessing ? 'bg-amber-500 animate-pulse' : draft.error ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">
                                        {draft.isProcessing ? 'Așteptare răspuns n8n' : draft.error ? draft.error : 'Click pentru document'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Furnizor</label>
                                    <input 
                                        disabled={draft.isProcessing}
                                        value={draft.vendor} 
                                        placeholder="..."
                                        onChange={(e) => handleUpdateDraft(draft.tempId, 'vendor', e.target.value)}
                                        className="rounded-2xl bg-slate-900 border border-slate-700 px-5 py-4 text-sm font-bold text-white focus:border-primary-500 focus:outline-none transition-all shadow-inner"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Sumă (RON)</label>
                                    <input 
                                        disabled={draft.isProcessing}
                                        type="number"
                                        value={draft.amount || ''} 
                                        placeholder="0.00"
                                        onChange={(e) => handleUpdateDraft(draft.tempId, 'amount', Number(e.target.value))}
                                        className="rounded-2xl bg-slate-900 border border-slate-700 px-5 py-4 text-sm font-bold text-white focus:border-primary-500 focus:outline-none transition-all shadow-inner"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Data Facturii</label>
                                    <input 
                                        disabled={draft.isProcessing}
                                        type="date"
                                        value={draft.date} 
                                        onChange={(e) => handleUpdateDraft(draft.tempId, 'date', e.target.value)}
                                        className="rounded-2xl bg-slate-900 border border-slate-700 px-5 py-4 text-sm font-bold text-white focus:border-primary-500 focus:outline-none transition-all shadow-inner"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Serie/Nr</label>
                                    <input 
                                        disabled={draft.isProcessing}
                                        value={draft.invoice_id || ''} 
                                        placeholder="Ex: FGO-001"
                                        onChange={(e) => handleUpdateDraft(draft.tempId, 'invoice_id', e.target.value)}
                                        className="rounded-2xl bg-slate-900 border border-slate-700 px-5 py-4 text-sm font-bold text-white focus:border-primary-500 focus:outline-none transition-all shadow-inner"
                                    />
                                </div>
                            </div>

                            <div className="w-full lg:w-auto flex items-center gap-3">
                                <button 
                                    onClick={() => handleSaveExpense(draft)}
                                    disabled={draft.isProcessing || !draft.vendor || !draft.amount}
                                    className="flex-1 lg:flex-none flex h-14 items-center justify-center gap-3 rounded-2xl bg-emerald-600 px-8 text-xs font-black text-white hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-30 disabled:grayscale"
                                >
                                    <span className="material-symbols-outlined text-lg">check_circle</span>
                                    VERIFICAT
                                </button>
                                <button 
                                    onClick={() => handleRemoveDraft(draft.tempId)}
                                    className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-700 text-slate-500 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/50 transition-all"
                                >
                                    <span className="material-symbols-outlined">delete</span>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {previewUrl && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
                    onClick={handleClosePreview}
                >
                    <div 
                        className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900 rounded-[2.5rem] border border-slate-700 shadow-2xl overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-700 bg-slate-800/50">
                            <div className="flex items-center gap-4">
                                <h3 className="text-lg font-black text-white uppercase tracking-tight">{previewUrl.name}</h3>
                            </div>
                            <button onClick={handleClosePreview} className="text-slate-400 hover:text-white">Închide</button>
                        </div>
                        <div className="flex-1 overflow-auto bg-slate-950 p-8">
                            {previewUrl.type.includes('pdf') ? (
                                <iframe src={previewUrl.url} className="w-full h-full min-h-[70vh] rounded-xl" title="PDF Preview" />
                            ) : (
                                <img src={previewUrl.url} alt="Preview" className="max-w-full h-auto mx-auto rounded-xl" />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddExpensePage;
