import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Transaction,
  ApiKey,
  Payout,
  WebhookEndpoint,
  initialApiKeys,
  initialPayouts,
  initialWebhooks
} from '@/lib/mockData';
import { fetchInvoices, Invoice } from '@/lib/api';
import { toast } from 'sonner';

interface DataContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;

  apiKeys: ApiKey[];
  addApiKey: (key: ApiKey) => void;
  deleteApiKey: (keyName: string) => void;

  payouts: Payout[];
  addPayout: (payout: Payout) => void;

  webhooks: WebhookEndpoint[];
  addWebhook: (webhook: WebhookEndpoint) => void;
  deleteWebhook: (url: string) => void;
  updateWebhook: (url: string, webhook: Partial<WebhookEndpoint>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialApiKeys);
  const [payouts, setPayouts] = useState<Payout[]>(initialPayouts);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>(initialWebhooks);

  useEffect(() => {
    const loadData = async () => {
      try {
        const invoices = await fetchInvoices();
        const mappedTransactions: Transaction[] = invoices.map((inv: Invoice) => ({
          id: inv.invoice_number,
          status: inv.status === 'paid' ? 'succeeded' : inv.status === 'pending' ? 'processing' : inv.status as any,
          amount: `$${inv.amount.toFixed(2)} ${inv.currency}`,
          customer: inv.customer_email,
          date: new Date(inv.created_at).toISOString().slice(0, 16).replace('T', ' ')
        }));
        setTransactions(mappedTransactions);
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
        toast.error("Failed to load invoices from server");
      }
    };

    loadData();
  }, []);

  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
  };

  const addApiKey = (key: ApiKey) => {
    setApiKeys(prev => [key, ...prev]);
  };

  const deleteApiKey = (keyName: string) => {
    setApiKeys(prev => prev.filter(k => k.name !== keyName));
  };

  const addPayout = (payout: Payout) => {
    setPayouts(prev => [payout, ...prev]);
  };

  const addWebhook = (webhook: WebhookEndpoint) => {
    setWebhooks(prev => [webhook, ...prev]);
  };

  const deleteWebhook = (url: string) => {
    setWebhooks(prev => prev.filter(w => w.url !== url));
  };

  const updateWebhook = (url: string, updates: Partial<WebhookEndpoint>) => {
    setWebhooks(prev => prev.map(w => w.url === url ? { ...w, ...updates } : w));
  };

  return (
    <DataContext.Provider
      value={{
        transactions,
        addTransaction,
        apiKeys,
        addApiKey,
        deleteApiKey,
        payouts,
        addPayout,
        webhooks,
        addWebhook,
        deleteWebhook,
        updateWebhook
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};
