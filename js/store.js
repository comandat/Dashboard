/**
 * Global Store
 * Mimics the useState/useEffect logic from the original React App.tsx
 */
import { getFinancialSummary, getMonthlyData, getRecentExpenses, getDeadStock, getOperationalAlerts } from './api.js';

const initialState = {
    currentView: 'dashboard',
    loading: true,

    // Financial Data
    financialPeriod: 'current_month',
    financialSummary: null,
    monthlyData: [],
    expenses: [],

    // Stock Data
    deadStock: [],

    // Operational Data
    operationalOrders: [],
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
            const [summary, monthly, recentExpenses, stock, orders] = await Promise.all([
                getFinancialSummary(this.state.financialPeriod),
                getMonthlyData(),
                getRecentExpenses(this.state.financialPeriod),
                getDeadStock(),
                getOperationalAlerts()
            ]);

            this.setState({
                financialSummary: summary,
                monthlyData: monthly,
                expenses: recentExpenses,
                deadStock: stock,
                operationalOrders: orders,
                loading: false
            });
        } catch (error) {
            console.error("Error loading initial data", error);
            this.setState({ loading: false });
        }
    },

    async setView(view) {
        this.setState({ currentView: view });
    },

    async setFinancialPeriod(period) {
        this.setState({ financialPeriod: period }); // Optimistic update

        // Fetch new data
        const [newSummary, newExpenses] = await Promise.all([
            getFinancialSummary(period),
            getRecentExpenses(period)
        ]);

        this.setState({
            financialSummary: newSummary,
            expenses: newExpenses
        });
    },

    async refreshExpenses() {
        const newExpenses = await getRecentExpenses(this.state.financialPeriod);
        this.setState({ expenses: newExpenses });
    }
};
