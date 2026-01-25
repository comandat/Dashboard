
import React, { useState } from 'react';
import { Order } from '../types';

interface OperationalPageProps {
    orders: Order[];
}

const OperationalPage: React.FC<OperationalPageProps> = ({ orders }) => {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>('OD7865'); // Default expanded for demo

  const toggleExpand = (id: string) => {
      setExpandedOrderId(expandedOrderId === id ? null : id);
  }

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Rezolvare Blocaje</h1>
          <p className="mt-2 text-slate-400">Rezolvați blocajele operaționale zilnice și gestionați sarcinile urgente.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="material-symbols-outlined text-base">update</span>
          <span>Ultima actualizare: chiar acum</span>
          <button className="ml-2 rounded p-2 hover:bg-slate-800 hover:text-white transition-colors">
            <span className="material-symbols-outlined">refresh</span>
          </button>
        </div>
      </header>

      <div className="flex flex-col rounded-xl bg-slate-800 shadow-sm border border-slate-700 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Comenzi Urgente</h2>
          <p className="mt-1 text-sm text-slate-400">Comenzi blocate în status 'Primită' de mai mult de 24 de ore.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800/50">
                <th className="w-1/4 px-6 py-4 text-sm font-semibold text-slate-400">ID Comandă</th>
                <th className="w-1/4 px-6 py-4 text-sm font-semibold text-slate-400">Client</th>
                <th className="w-1/4 px-6 py-4 text-sm font-semibold text-slate-400">Alertă</th>
                <th className="w-1/4 px-6 py-4 text-sm font-semibold text-slate-400">Timp în Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {orders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr 
                    onClick={() => toggleExpand(order.id)}
                    className={`cursor-pointer transition-colors hover:bg-slate-700/30 ${expandedOrderId === order.id ? 'bg-slate-700/20' : ''}`}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-white">{order.id}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{order.client_name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          order.alert.includes('48h') 
                            ? 'bg-red-500/20 text-red-400' 
                            : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {order.alert}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300 flex items-center justify-between">
                        {order.time_in_status} ore
                        <span className={`material-symbols-outlined text-slate-500 transition-transform ${expandedOrderId === order.id ? 'rotate-180' : ''}`}>expand_more</span>
                    </td>
                  </tr>
                  
                  {/* Expanded Details */}
                  {expandedOrderId === order.id && (
                    <tr className="bg-slate-900/30">
                        <td colSpan={4} className="p-0">
                            <div className="p-6">
                                <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
                                    <h4 className="mb-3 text-xs font-bold uppercase text-slate-500 tracking-wider">Produse în comandă</h4>
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-slate-700 text-xs text-slate-500">
                                                <th className="pb-2 font-medium w-16">Imagine</th>
                                                <th className="pb-2 font-medium">SKU</th>
                                                <th className="pb-2 font-medium">Nume Produs</th>
                                                <th className="pb-2 font-medium text-right">Cantitate</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-700/50">
                                            {order.items.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="py-3">
                                                        <img src={item.image_url} alt={item.name} className="h-10 w-10 rounded object-cover bg-slate-700" />
                                                    </td>
                                                    <td className="py-3 text-sm text-slate-300">{item.sku}</td>
                                                    <td className="py-3 text-sm text-slate-300">{item.name}</td>
                                                    <td className="py-3 text-sm text-slate-300 text-right">{item.quantity}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="mt-4 flex justify-end gap-3">
                                        <button className="rounded-md border border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700">Contactează Client</button>
                                        <button className="rounded-md bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-500">Forțează Expediere</button>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OperationalPage;
