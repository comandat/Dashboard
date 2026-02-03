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
    deadStock: [],
    operationalOrders: [],
    topCategories: [] // Nou: Categoriile vin acum din API, nu mai sunt hardcodate
};

export const store = {
    state: { ...initialState },
    listeners: [],

    // Sistem simplu de abonare pentru update-uri UI
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
     * Inițializare: Trage toate datele la prima încărcare
     */
    async init() {
        this.setState({ loading: true });
        try {
            // Apel unic către n8n pentru toate datele
            const data = await getDashboardData(this.state.financialPeriod);

            this.setState({
                financialSummary: data.financialSummary,
                monthlyData: data.monthlyData,
                expenses: data.expenses,
                deadStock: data.deadStock,
                operationalOrders: data.operationalOrders,
                topCategories: data.topCategories,
                loading: false
            });
        } catch (error) {
            console.error("Eroare inițializare date:", error);
            this.setState({ loading: false });
        }
    },

    // Schimbarea vederii (paginii)
    async setView(view) {
        this.setState({ currentView: view });
    },

    /**
     * Schimbarea filtrului de perioadă (ex: Luna Trecută)
     * Reîncarcă datele din n8n cu noul filtru.
     */
    async setFinancialPeriod(period) {
        this.setState({ financialPeriod: period, loading: true });
        
        try {
            const data = await getDashboardData(period);

            this.setState({
                financialSummary: data.financialSummary,
                monthlyData: data.monthlyData,
                expenses: data.expenses,
                deadStock: data.deadStock,
                operationalOrders: data.operationalOrders,
                topCategories: data.topCategories,
                loading: false
            });
        } catch (error) {
            console.error("Eroare filtrare perioadă:", error);
            this.setState({ loading: false });
        }
    },

    // Refresh rapid (opțional)
    async refreshExpenses() {
        await this.init();
    }
};
