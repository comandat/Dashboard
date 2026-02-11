/**
 * Global Store
 * Gestionează starea aplicației și datele venite din n8n
 */
import { getDashboardData } from './api.js';

const initialState = {
    currentView: 'dashboard',
    loading: true,
    financialPeriod: 'current_month',

    // Data Holders (populate din n8n)
    financialSummary: null,
    monthlyData: [],
    expenses: [],
    
    // --- STOCURI & PRODUSE ---
    inventoryHealth: null,       // Starea generală a stocului (Sursa Master pentru COGS)
    deadStockActionList: [],     // Lista de produse pentru acțiune (Lichidare)
    
    operationalOrders: [],
    topCategories: []
};

export const store = {
    state: { ...initialState },
    listeners: [],

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    },

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    },

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notify();
    },

    /**
     * Returnează costul de achiziție (COGS) pentru un SKU dat.
     * Caută în lista principală de inventar.
     */
getProductCost(sku) {
        if (!sku) return 0;

        // Normalizăm SKU-ul
        const cleanSku = String(sku).trim().toUpperCase();

        // 1. Verificare Securizată pentru inventoryHealth
        let allProducts = this.state.inventoryHealth;

        // Dacă nu e array (e null, undefined, sau obiect), folosim o listă goală
        if (!Array.isArray(allProducts)) {
            // Debugging: Poți decomenta linia de mai jos ca să vezi ce primești de fapt în consolă
            // console.warn("InventoryHealth nu este array! Este:", typeof allProducts, allProducts);
            allProducts = []; 
        }

        const product = allProducts.find(p => 
            (p.sku && String(p.sku).trim().toUpperCase() === cleanSku) ||
            (p.part_number && String(p.part_number).trim().toUpperCase() === cleanSku)
        );

        if (product) {
            return parseFloat(product.unit_cost) || parseFloat(product.purchase_price) || 0;
        }

        // 2. Fallback: Verificare Securizată pentru deadStockActionList
        let deadStock = this.state.deadStockActionList;
        if (!Array.isArray(deadStock)) {
            deadStock = [];
        }

        const dsProduct = deadStock.find(p => String(p.sku).trim().toUpperCase() === cleanSku);
        
        return dsProduct ? (parseFloat(dsProduct.unit_cost) || 0) : 0;
    },

    async init() {
        this.setState({ loading: true });
        try {
            const data = await getDashboardData(this.state.financialPeriod);

            this.setState({
                financialSummary: data.financialSummary,
                monthlyData: data.monthlyData,
                expenses: data.expenses,
                
                // Populăm datele de stoc
                inventoryHealth: data.inventoryHealth,
                deadStockActionList: data.deadStockActionList,
                
                operationalOrders: data.operationalOrders,
                topCategories: data.topCategories,
                loading: false
            });
        } catch (error) {
            console.error("Eroare inițializare date:", error);
            this.setState({ loading: false });
        }
    },

    async setView(view) {
        this.setState({ currentView: view });
    },

    async setFinancialPeriod(period) {
        this.setState({ financialPeriod: period, loading: true });
        
        try {
            const data = await getDashboardData(period);

            this.setState({
                financialSummary: data.financialSummary,
                monthlyData: data.monthlyData,
                expenses: data.expenses,
                
                // Actualizăm și stocurile la schimbarea perioadei (dacă e cazul)
                inventoryHealth: data.inventoryHealth,
                deadStockActionList: data.deadStockActionList,
                
                operationalOrders: data.operationalOrders,
                topCategories: data.topCategories,
                loading: false
            });
        } catch (error) {
            console.error("Eroare filtrare perioadă:", error);
            this.setState({ loading: false });
        }
    },

    async refreshExpenses() {
        await this.init();
    }
};
