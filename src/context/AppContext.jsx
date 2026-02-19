import React, { createContext, useContext, useReducer, useEffect } from 'react';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
export const INITIAL_CATEGORIES = [
  { id: '1', name: 'Food',          icon: '🍔', color: '#6366f1', type: 'expense' },
  { id: '2', name: 'Rent',          icon: '🏠', color: '#8b5cf6', type: 'expense' },
  { id: '3', name: 'Salary',        icon: '💰', color: '#10b981', type: 'income'  },
  { id: '4', name: 'Shopping',      icon: '🛍️', color: '#f59e0b', type: 'expense' },
  { id: '5', name: 'Freelance',     icon: '💻', color: '#8b5cf6', type: 'income'  },
  { id: '6', name: 'Investment',    icon: '📈', color: '#10b981', type: 'expense' },
  { id: '7', name: 'Travel',        icon: '✈️', color: '#06b6d4', type: 'expense' },
  { id: '8', name: 'Entertainment', icon: '🎬', color: '#ec4899', type: 'expense' },
];

export const EMOJI_OPTIONS = [
  '🍔','🏠','🛍️','🎬','✈️','💊','⛽','💡','🎓',
  '🎁','🛒','🏋️','🐶','👶','🍕','🍻','💈','🎮',
];

// ─── INITIAL STATE ─────────────────────────────────────────────────────────────
const load = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
};

const makeInitialState = () => ({
  transactions:    load('et_transactions', []),
  categories:      load('et_categories', INITIAL_CATEGORIES),
  budget:          load('et_budget', 50000),
  incomeTarget:    load('et_income_target', 75000),
  theme:           localStorage.getItem('et_theme') || 'light',
  goals:           load('et_goals', []),
  assets:          load('et_assets', []),
  liabilities:     load('et_liabilities', []),
  activeTab:       'dashboard',
  comparisonMode:  'thisMonth',   // 'thisMonth' | 'lastMonth' | 'custom'
  comparisonRange: { start: '', end: '' },
  filters: {
    search:     '',
    type:       'all',
    category:   'all',
    dateRange:  'all',
    amountMin:  '',
    amountMax:  '',
    startDate:  '',
    endDate:    '',
  },
});

const initialState = makeInitialState();

// ─── REDUCER ───────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {

    // Transactions
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case 'EDIT_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case 'DELETE_TRANSACTION':
      return { ...state, transactions: state.transactions.filter(t => t.id !== action.payload) };

    // Budget / Income
    case 'SET_BUDGET':
      return { ...state, budget: action.payload };
    case 'SET_INCOME_TARGET':
      return { ...state, incomeTarget: action.payload };

    // Categories
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    case 'DELETE_CATEGORY':
      return { ...state, categories: state.categories.filter(c => c.id !== action.payload) };

    // Filters
    case 'SET_FILTER':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'CLEAR_FILTERS':
      return { ...state, filters: initialState.filters };

    // Theme
    case 'TOGGLE_THEME': {
      const t = state.theme === 'light' ? 'dark' : 'light';
      return { ...state, theme: t };
    }

    // Goals
    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, action.payload] };
    case 'UPDATE_GOAL':
      return {
        ...state,
        goals: state.goals.map(g => g.id === action.payload.id ? action.payload : g),
      };
    case 'DELETE_GOAL':
      return { ...state, goals: state.goals.filter(g => g.id !== action.payload) };

    // Net Worth: Assets
    case 'ADD_ASSET':
      return { ...state, assets: [...state.assets, action.payload] };
    case 'DELETE_ASSET':
      return { ...state, assets: state.assets.filter(a => a.id !== action.payload) };

    // Net Worth: Liabilities
    case 'ADD_LIABILITY':
      return { ...state, liabilities: [...state.liabilities, action.payload] };
    case 'DELETE_LIABILITY':
      return { ...state, liabilities: state.liabilities.filter(l => l.id !== action.payload) };

    // Navigation
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };

    // Monthly Comparison
    case 'SET_COMPARISON_MODE':
      return { ...state, comparisonMode: action.payload };
    case 'SET_COMPARISON_RANGE':
      return { ...state, comparisonRange: action.payload };

    // Reset
    case 'RESET_ALL':
      return { ...makeInitialState(), theme: state.theme };

    default:
      return state;
  }
}

// ─── CONTEXT ───────────────────────────────────────────────────────────────────
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('et_transactions', JSON.stringify(state.transactions));
    localStorage.setItem('et_categories',   JSON.stringify(state.categories));
    localStorage.setItem('et_budget',        JSON.stringify(state.budget));
    localStorage.setItem('et_income_target', JSON.stringify(state.incomeTarget));
    localStorage.setItem('et_theme',         state.theme);
    localStorage.setItem('et_goals',         JSON.stringify(state.goals));
    localStorage.setItem('et_assets',        JSON.stringify(state.assets));
    localStorage.setItem('et_liabilities',   JSON.stringify(state.liabilities));

    if (state.theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [
    state.transactions, state.categories, state.budget,
    state.incomeTarget, state.theme, state.goals,
    state.assets, state.liabilities,
  ]);

  // Process recurring transactions
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const due = state.transactions.filter(t => {
      if (!t.recurring || !t.nextDate) return false;
      return t.nextDate <= today;
    });

    due.forEach(t => {
      // Spawn new transaction
      const newId = crypto.randomUUID();
      const next = calcNextDate(t.nextDate, t.frequency);
      dispatch({
        type: 'ADD_TRANSACTION',
        payload: {
          ...t,
          id:       newId,
          date:     t.nextDate,
          nextDate: undefined,
          recurring: false,
        },
      });
      // Update original: advance nextDate
      dispatch({
        type: 'EDIT_TRANSACTION',
        payload: { ...t, nextDate: next },
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

function calcNextDate(dateStr, frequency) {
  const d = new Date(dateStr);
  if (frequency === 'weekly')  d.setDate(d.getDate() + 7);
  if (frequency === 'monthly') d.setMonth(d.getMonth() + 1);
  if (frequency === 'yearly')  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be inside AppProvider');
  return ctx;
}

export default AppContext;
