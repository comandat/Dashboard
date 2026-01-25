
import { FinancialSummary, MonthlyData, Order, Product, Expense, TimePeriod, ExpenseCategory } from '../types';

// Webhook URL Placeholder - Modifică această constantă cu URL-ul tău real de producție n8n dacă este diferit
const N8N_WEBHOOK_URL = 'https://n8n.your-instance.com/webhook/convert-invoice-data';

// Simulates: /webhook/financial-summary
export const getFinancialSummary = async (period: TimePeriod = 'current_month'): Promise<FinancialSummary> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let multiplier = 1;
      if (period === 'last_month') multiplier = 0.9;
      if (period === 'last_quarter') multiplier = 2.8;

      resolve({
        net_profit: Math.round(42583 * multiplier),
        revenue: Math.round(125430 * multiplier),
        expenses_total: Math.round(40220 * multiplier),
        expense_coverage_percent: period === 'current_month' ? 78 : 92,
        margin_percent: period === 'current_month' ? 15 : 18,
        break_even_target: Math.round(112000 * multiplier)
      });
    }, 400);
  });
};

// Simulates: /webhook/monthly-chart
export const getMonthlyData = async (): Promise<MonthlyData[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { month: 'Aug', profit: 12000, cogs: 15000, logistics: 5000, platform_fees: 3000, fixed_ops: 4000, revenue: 39000, expenses: 27000 },
        { month: 'Sep', profit: 18000, cogs: 16000, logistics: 6000, platform_fees: 3500, fixed_ops: 4000, revenue: 47500, expenses: 29500 },
        { month: 'Oct', profit: 24000, cogs: 20000, logistics: 8000, platform_fees: 5000, fixed_ops: 4500, revenue: 61500, expenses: 37500 },
        { month: 'Nov', profit: 42583, cogs: 22000, logistics: 9000, platform_fees: 6000, fixed_ops: 5000, revenue: 84583, expenses: 42000 },
      ]);
    }, 500);
  });
};

// Simulates: /webhook/dead-stock
export const getDeadStock = async (): Promise<Product[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          sku: 'MSE-ERG-01',
          name: 'Mouse Ergonomic',
          image_url: 'https://picsum.photos/id/1/200/200',
          stock_qty: 15,
          cost_price: 5812.50,
          retail_price: 8718.75,
          status: 'Lent (>60z)',
          last_sold_at: '2023-09-15',
          category: 'Electronice',
          rotation_speed: 'Lent',
          avg_items_per_day: 0.2,
          total_revenue_1y: 12500
        },
        {
          sku: 'HST-BLU-99',
          name: 'Căști Bluetooth',
          image_url: 'https://picsum.photos/id/3/200/200',
          stock_qty: 18,
          cost_price: 4185.00,
          retail_price: 6277.50,
          status: 'Lent (>60z)',
          last_sold_at: '2023-09-10',
          category: 'Electronice',
          rotation_speed: 'Lent',
          avg_items_per_day: 0.5,
          total_revenue_1y: 8900
        },
        {
          sku: 'KBD-MECH-X',
          name: 'Tastatură Mecanică',
          image_url: 'https://picsum.photos/id/4/200/200',
          stock_qty: 32,
          cost_price: 3472.00,
          retail_price: 5208.00,
          status: 'Stagnant (30z)',
          last_sold_at: '2023-10-01',
          category: 'Electronice',
          rotation_speed: 'Stagnant',
          avg_items_per_day: 1.2,
          total_revenue_1y: 45000
        }
      ]);
    }, 700);
  });
};

/**
 * INTEGRARE REALA n8n
 * Trimite documentul binar către webhook-ul n8n și mapează răspunsul Gemini
 */
export const extractExpenseFromDocument = async (file: File): Promise<Partial<Expense>> => {
    const formData = new FormData();
    formData.append('data', file); // Nodul n8n "Format to Base64" citește de obicei proprietatea 'data'

    try {
        console.log(`[n8n] Trimitere ${file.name} către ${N8N_WEBHOOK_URL}...`);
        
        // Dacă ești în mediul de dezvoltare și nu ai webhook-ul activ, 
        // poți lăsa mock-ul de mai jos activat pentru teste UI.
        const USE_MOCK = true; // Setează pe FALSE pentru a apela n8n real

        if (USE_MOCK) {
            await new Promise(r => setTimeout(r, 2000));
            return {
                vendor: 'S.C. EXEMPLU FURNIZOR S.R.L.',
                amount: 1450.50,
                date: '2024-03-20',
                category: 'Logistica',
                invoice_id: 'FACT-9988'
            };
        }

        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) throw new Error(`Eroare n8n: ${response.statusText}`);

        const result = await response.json();
        
        // Mapare conform schemei n8n furnizate de tine (nodul Formatting Answer1)
        // Câmpuri n8n: source_doc, furnizor, factura_valoare, factura_total, date
        return {
            vendor: result.furnizor || '',
            amount: result.factura_total || result.factura_valoare || 0,
            date: result.date || new Date().toISOString().split('T')[0],
            invoice_id: result.source_doc || '',
            category: 'Logistica' // n8n nu returnează categoria încă
        };

    } catch (error) {
        console.error("[n8n] Eroare la extracție:", error);
        throw error;
    }
};

export const getOperationalAlerts = async (): Promise<Order[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'OD7865',
          client_name: 'Ion Popescu',
          alert: 'Peste 48h',
          time_in_status: 52,
          status: 'Received',
          items: [
             { sku: 'PROD-001', name: 'Mouse Ergonomic', quantity: 1, image_url: 'https://picsum.photos/id/1/200/200' }
          ]
        }
      ]);
    }, 400);
  });
};

export const getRecentExpenses = async (period: TimePeriod = 'current_month'): Promise<Expense[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { id: '1', vendor: 'Stripe', invoice_id: '#INV-12345', date: '15 Ian, 2024', amount: 2500.00, status: 'Paid', category: 'Taxe' }
            ]);
        }, 500)
    })
}

export const addExpense = async (expense: Omit<Expense, 'id' | 'status'>): Promise<boolean> => {
    return new Promise((resolve) => {
        console.log("[n8n] Salvare cheltuială verificată:", expense);
        setTimeout(() => resolve(true), 800);
    })
}
