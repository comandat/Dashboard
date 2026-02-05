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
    
    // --- UPDATE AICI ---
    inventoryHealth: null,       // Starea generală a stocului
    deadStockActionList: [],     // Lista de produse pentru acțiune
    
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

    async init() {
        this.setState({ loading: true });
        try {
            const data = await getDashboardData(this.state.financialPeriod);

            this.setState({
                financialSummary: data.financialSummary,
                monthlyData: data.monthlyData,
                expenses: data.expenses,
                
                // --- UPDATE AICI ---
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
                
                // --- UPDATE AICI ---
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
