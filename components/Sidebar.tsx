
import React from 'react';
import { View } from '../App';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const menuItems: { id: View; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'query_stats' },
    { id: 'financial', label: 'Financiar', icon: 'paid' },
    { id: 'stock', label: 'Analiza Stoc & Lichidare', icon: 'inventory_2' },
    { id: 'operational', label: 'Operațional', icon: 'receipt_long' },
    { id: 'reports', label: 'Reports', icon: 'summarize' },
  ];

  return (
    <aside className="flex w-64 flex-col border-r border-slate-700 bg-slate-800 p-4">
      <div className="flex h-full flex-col justify-between">
        <div className="flex flex-col gap-6">
          {/* Logo Area */}
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 shadow-lg shadow-primary-500/20">
                <span className="material-symbols-outlined text-white">incomplete_circle</span>
            </div>
            <div>
                <h1 className="text-lg font-bold text-white">BizDash</h1>
                <p className="text-xs text-slate-400 uppercase tracking-tighter">Operational View</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left ${
                  currentView === item.id
                    ? 'bg-primary-600/10 text-primary-500'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                }`}
              >
                <span className={`material-symbols-outlined ${currentView === item.id ? 'text-primary-500' : ''}`}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1 border-t border-slate-700 pt-4">
            <button 
              onClick={() => onViewChange('settings')}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">settings</span>
              <span className="text-sm font-medium">Settings</span>
            </button>
            <button className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 transition-colors">
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span className="text-sm font-medium">Log out</span>
            </button>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 border-t border-slate-700 pt-4">
            <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-600 ring-2 ring-slate-700">
              <img src="https://picsum.photos/id/64/200/200" alt="User" className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-medium text-white">Eleanor Pena</h1>
              <p className="text-xs text-slate-400 uppercase">CEO</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
