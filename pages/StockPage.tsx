
import React, { useState } from 'react';
import { Product } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface StockPageProps {
    deadStock: Product[];
}

// Modal Component
interface LiquidationModalProps {
    product: Product;
    onClose: () => void;
}

const LiquidationModal: React.FC<LiquidationModalProps> = ({ product, onClose }) => {
    const [newPrice, setNewPrice] = useState<number>(product.cost_price * 0.85); // Default to loss
    
    const commissionRate = 0.20;
    const cost = product.cost_price;
    const commissionVal = newPrice * commissionRate;
    const netMarginVal = newPrice - cost - commissionVal;
    const profitPercent = (netMarginVal / newPrice) * 100;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-3xl rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl md:p-8">
                {/* Header */}
                <div className="flex items-start gap-4 mb-8">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-800">
                        <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">{product.name}</h2>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-400">
                            <span className="rounded bg-red-500/20 px-2 py-0.5 text-red-300 border border-red-500/30">Status: {product.status}</span>
                            <span>Stoc: <span className="font-medium text-slate-200">{product.stock_qty} buc</span></span>
                            <span>Cost Total: <span className="font-medium text-slate-200">{(product.stock_qty * product.cost_price).toLocaleString()} RON</span></span>
                        </div>
                    </div>
                </div>

                {/* Simulator */}
                <div className="space-y-6 rounded-lg bg-slate-800/50 p-6 border border-slate-700/50">
                     <h3 className="text-sm font-medium text-center text-slate-400 uppercase tracking-wider pb-4 border-b border-slate-700">Simulator Discount & Preț</h3>
                     
                     <div className="flex flex-col md:flex-row items-center justify-around gap-4 pt-2">
                        <div className="text-center">
                            <div className="relative group">
                                <input 
                                    type="number" 
                                    value={Math.round(newPrice)} 
                                    onChange={(e) => setNewPrice(Number(e.target.value))}
                                    className="w-32 border-0 border-b-2 border-slate-600 bg-transparent pb-1 text-center text-3xl font-bold text-white focus:border-primary-500 focus:outline-none"
                                />
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap border border-slate-600">
                                    Vechi: <s className="text-red-400">{product.retail_price} RON</s>
                                </div>
                            </div>
                            <label className="mt-2 block text-xs text-slate-400">Preț Vânzare Nou (RON)</label>
                        </div>

                        <span className="text-2xl font-light text-slate-600">-</span>

                        <div className="text-center opacity-70">
                            <p className="text-3xl font-semibold text-slate-400">{Math.round(cost)}</p>
                            <label className="mt-2 block text-xs text-slate-500">Cost Achiziție</label>
                        </div>

                        <span className="text-2xl font-light text-slate-600">-</span>

                        <div className="text-center opacity-70">
                             <p className="text-3xl font-semibold text-slate-400">{Math.round(commissionVal)}</p>
                             <label className="mt-2 block text-xs text-slate-500">Comision (20%)</label>
                        </div>

                        <span className="text-2xl font-light text-slate-600">=</span>

                        <div className="text-center">
                            <p className={`flex items-center justify-center gap-1 text-3xl font-bold ${netMarginVal >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                {Math.round(netMarginVal)}
                                {netMarginVal < 0 && <span className="material-symbols-outlined text-2xl">warning</span>}
                            </p>
                            <label className={`mt-2 block text-xs ${netMarginVal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>Marjă Netă Reală</label>
                        </div>
                     </div>
                    
                     <div className="flex justify-center pt-2">
                         <p className="text-sm text-slate-400">
                             Procent de Profit: <span className={`font-bold ${profitPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{profitPercent.toFixed(2)}%</span>
                         </p>
                     </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex items-center justify-between border-t border-slate-700 pt-6">
                    <button onClick={onClose} className="text-sm text-slate-400 hover:text-white">Resetează</button>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white">Anulează</button>
                        <button className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-500 shadow-lg shadow-primary-600/20 transition-all">
                            Aplică Modificări
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const StockPage: React.FC<StockPageProps> = ({ deadStock }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Mock Data for Top 10 Categories
  const topCategories = [
    { rank: 1, cat: 'Electronice', val: '560.085 RON', speed: '2.4', status: 'Rapid', statusColor: 'text-emerald-400', icon: 'devices' },
    { rank: 2, cat: 'Îmbrăcăminte', val: '458.490 RON', speed: '3.1', status: 'Rapid', statusColor: 'text-emerald-400', icon: 'apparel' },
    { rank: 3, cat: 'Uz Casnic', val: '382.000 RON', speed: '0.5', status: 'Lent', statusColor: 'text-red-400', icon: 'chair' },
    { rank: 4, cat: 'Sportive', val: '303.645 RON', speed: '1.2', status: 'Mediu', statusColor: 'text-amber-400', icon: 'fitness_center' },
    { rank: 5, cat: 'Auto', val: '250.120 RON', speed: '1.8', status: 'Mediu', statusColor: 'text-amber-400', icon: 'directions_car' },
    { rank: 6, cat: 'Jucării', val: '210.500 RON', speed: '4.2', status: 'Rapid', statusColor: 'text-emerald-400', icon: 'toys' },
    { rank: 7, cat: 'Grădină', val: '180.300 RON', speed: '0.8', status: 'Lent', statusColor: 'text-red-400', icon: 'yard' },
    { rank: 8, cat: 'Cosmetice', val: '150.800 RON', speed: '3.5', status: 'Rapid', statusColor: 'text-emerald-400', icon: 'spa' },
    { rank: 9, cat: 'Birotică', val: '120.400 RON', speed: '1.5', status: 'Mediu', statusColor: 'text-amber-400', icon: 'print' },
    { rank: 10, cat: 'Pet Shop', val: '98.200 RON', speed: '2.1', status: 'Mediu', statusColor: 'text-amber-400', icon: 'pets' },
  ];

  // Mock Data for SKUs Sold vs Posted (Last 12 Months)
  const skuTrendData = [
    { month: 'Ian', sold: 450, posted: 520 },
    { month: 'Feb', sold: 480, posted: 540 },
    { month: 'Mar', sold: 520, posted: 600 },
    { month: 'Apr', sold: 510, posted: 620 },
    { month: 'Mai', sold: 590, posted: 650 },
    { month: 'Iun', sold: 610, posted: 700 },
    { month: 'Iul', sold: 650, posted: 720 },
    { month: 'Aug', sold: 720, posted: 800 },
    { month: 'Sep', sold: 680, posted: 820 },
    { month: 'Oct', sold: 750, posted: 850 },
    { month: 'Noi', sold: 820, posted: 900 },
    { month: 'Dec', sold: 950, posted: 1000 },
  ];

  const visibleCategories = showAllCategories ? topCategories : topCategories.slice(0, 5);

  return (
    <div className="mx-auto max-w-[1600px] pb-12 w-full px-2">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white tracking-tight">Analiză Stoc & Lichidare</h1>
        <p className="text-slate-400 mt-2 text-lg">Monitorizare inventar, strategii de lichidare și performanță pe categorii (ultimele 12 luni).</p>
      </div>

      <div className="flex flex-col gap-8">
        
        {/* ROW 1: Dead Stock Table (Full Width) */}
        <div className="w-full rounded-2xl border border-slate-700 bg-slate-800 overflow-hidden shadow-2xl">
            <div className="px-8 py-4 border-b border-slate-700 bg-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-red-500">inventory_2</span>
                    <h2 className="text-lg font-bold text-white uppercase tracking-widest">Listă Lichidare Stoc</h2>
                </div>
                <div className="flex items-center gap-4 bg-slate-900/50 px-4 py-1.5 rounded-full border border-slate-700">
                    <span className="text-xs text-slate-500 font-bold italic uppercase">Filtrat: Stagnant &gt; 30 zile</span>
                </div>
            </div>
            <div className="w-full overflow-x-auto">
                <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-slate-900 z-20 border-b border-slate-700">
                            <tr className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                                <th className="px-8 py-4">Produs / SKU</th>
                                <th className="px-8 py-4">Status Rotație</th>
                                <th className="px-8 py-4">Stoc Disponibil</th>
                                <th className="px-8 py-4">Bani Blocați (Cost)</th>
                                <th className="px-8 py-4">Valoare Estimată (Potential)</th>
                                <th className="px-8 py-4 text-right">Acțiuni Strategice</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {deadStock.map((product) => (
                                <tr key={product.sku} className="hover:bg-slate-700/40 transition-all group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-700 border border-slate-600 shadow-inner">
                                                <img src={product.image_url} alt="" className="h-full w-full object-cover" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-base font-black text-white group-hover:text-primary-400 transition-colors">{product.name}</span>
                                                <span className="text-xs text-slate-500 font-mono tracking-tighter">{product.sku}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-tight ${
                                            product.status.includes('Lent') 
                                                ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                                                : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                        }`}>
                                            <div className={`h-1.5 w-1.5 rounded-full ${product.status.includes('Lent') ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                                            {product.status.split(' ')[0]}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-base font-bold text-slate-300">{product.stock_qty} <span className="text-xs text-slate-500 font-normal">buc</span></td>
                                    <td className="px-8 py-5 text-base font-black text-white">{product.cost_price.toLocaleString('ro-RO')} <span className="text-xs text-slate-500 font-normal">RON</span></td>
                                    <td className="px-8 py-5 text-base font-black text-emerald-400">{product.retail_price.toLocaleString('ro-RO')} <span className="text-xs text-emerald-600 font-normal">RON</span></td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                            <button 
                                                onClick={() => setSelectedProduct(product)}
                                                className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2 text-xs font-black text-white hover:bg-primary-500 shadow-xl shadow-primary-600/30 transition-all hover:scale-105 active:scale-95"
                                            >
                                                <span className="material-symbols-outlined text-sm">percent</span>
                                                LICHIDEAZĂ
                                            </button>
                                            <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all hover:border-red-500/50">
                                                <span className="material-symbols-outlined text-xl">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* ROW 2: Top Categories (Full Width Grid) */}
        <div className="w-full rounded-2xl border border-slate-700 bg-slate-800 p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-10">
                <div className="flex flex-col gap-1">
                    <h3 className="font-black text-white text-2xl tracking-tight uppercase">Top 10 Categorii Performante</h3>
                    <p className="text-sm text-slate-500">Ierarhia categoriilor după volum de vânzări și viteza de rotație (Media 12 luni).</p>
                </div>
                <button 
                    onClick={() => setShowAllCategories(!showAllCategories)}
                    className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-700 px-6 py-3 text-xs font-black text-slate-300 hover:text-primary-400 hover:border-primary-500/50 transition-all group"
                >
                    <span className="material-symbols-outlined text-lg transition-transform group-hover:scale-125">{showAllCategories ? 'keyboard_arrow_up' : 'expand_more'}</span>
                    {showAllCategories ? 'RESTRÂNGE LISTA' : 'VEZI TOATE CELE 10 CATEGORII'}
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {visibleCategories.map((item, i) => (
                    <div key={i} className="bg-slate-900/60 rounded-[2rem] p-8 border border-slate-700 hover:border-primary-500/50 transition-all group relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                        <div className="absolute -right-4 -top-4 text-7xl font-black text-slate-800/40 group-hover:text-primary-500/10 transition-all pointer-events-none italic">#{item.rank}</div>
                        
                        <div>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="rounded-2xl bg-primary-600/10 p-3 text-primary-400 border border-primary-500/20 group-hover:bg-primary-600 group-hover:text-white transition-all shadow-lg">
                                    <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                                </div>
                                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${item.statusColor} bg-slate-900 shadow-sm`}>{item.status}</span>
                            </div>
                            
                            <h4 className="text-slate-500 text-xs font-black uppercase tracking-[0.2em] mb-2">{item.cat}</h4>
                            <p className="text-white text-3xl font-black tracking-tighter group-hover:text-primary-400 transition-colors">{item.val}</p>
                        </div>
                        
                        <div className="flex items-center justify-between border-t border-slate-700/50 pt-6 mt-6">
                             <div className="flex flex-col">
                                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Rapiditate</span>
                                <span className="text-sm font-black text-white">{item.speed} <span className="text-[10px] text-slate-500 font-normal">prod/zi</span></span>
                             </div>
                             <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-600 group-hover:text-primary-500 group-hover:bg-primary-500/10 transition-all shadow-inner">
                                <span className="material-symbols-outlined text-xl">trending_up</span>
                             </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* ROW 3: SKU-uri Vandute VS Postate Chart (Full Width) */}
        <div className="w-full rounded-2xl border border-slate-700 bg-slate-800 p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-10">
                <div className="flex flex-col gap-1">
                    <h3 className="font-black text-white text-2xl tracking-tight uppercase">Evoluție Inventar: Vândute vs Postate</h3>
                    <p className="text-sm text-slate-500">Analiza eficienței listărilor și a absorbției stocului în piață.</p>
                </div>
                <div className="flex gap-8 bg-slate-900/50 px-6 py-3 rounded-2xl border border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></div>
                        <span className="text-xs font-black text-slate-300 uppercase tracking-widest">SKU Vândute</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-primary-500 shadow-lg shadow-primary-500/50"></div>
                        <span className="text-xs font-black text-slate-300 uppercase tracking-widest">SKU Postate</span>
                    </div>
                </div>
            </div>
            
            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={skuTrendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorSold" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorPosted" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                        <XAxis 
                            dataKey="month" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#64748b', fontSize: 12, fontWeight: 'bold'}} 
                            dy={15} 
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#64748b', fontSize: 12, fontWeight: 'bold'}} 
                            dx={-10}
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: '13px', borderRadius: '12px', fontWeight: 'bold', border: '1px solid #475569', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ padding: '2px 0' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="posted" 
                            name="SKU Postate" 
                            stroke="#3b82f6" 
                            strokeWidth={4} 
                            fillOpacity={1} 
                            fill="url(#colorPosted)" 
                        />
                        <Area 
                            type="monotone" 
                            dataKey="sold" 
                            name="SKU Vândute" 
                            stroke="#10b981" 
                            strokeWidth={4} 
                            fillOpacity={1} 
                            fill="url(#colorSold)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>

      {/* Render Modal */}
      {selectedProduct && (
        <LiquidationModal 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
};

export default StockPage;
