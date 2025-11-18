export interface Transaction {
  id: string;
  status: 'succeeded' | 'processing' | 'failed' | 'refunded' | 'expired';
  amount: string;
  customer: string;
  date: string;
}

export interface ApiKey {
  name: string;
  key: string;
  scopes: string[];
  created: string;
  lastUsed: string;
}

export interface Payout {
  id: string;
  recipient: string;
  date: string;
  amount: string;
  status: 'succeeded' | 'processing' | 'failed';
}

export interface WebhookEndpoint {
  url: string;
  events: string[];
  status: 'active' | 'inactive';
  created: string;
  lastDelivery: string;
}

const customers = [
  "john.doe@gmail.com", "jane.smith@gmail.com", "bob.wilson@gmail.com",
  "alice.brown@gmail.com", "charlie.davis@gmail.com", "david.miller@gmail.com",
  "emma.johnson@gmail.com", "frank.martinez@gmail.com", "grace.garcia@gmail.com",
  "henry.rodriguez@gmail.com", "isabel.hernandez@gmail.com", "jack.lopez@gmail.com"
];

const statuses: Transaction['status'][] = ['succeeded', 'processing', 'failed', 'refunded', 'expired'];

const generateTransactionId = (index: number) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'cos-';
  for (let i = 0; i < 13; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

export const generateMockTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  
  for (let i = 0; i < 50; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    date.setHours(Math.floor(Math.random() * 24));
    date.setMinutes(Math.floor(Math.random() * 60));
    
    transactions.push({
      id: generateTransactionId(i),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      amount: `$${(Math.random() * 5000 + 100).toFixed(2)} USD`,
      customer: customers[Math.floor(Math.random() * customers.length)],
      date: date.toISOString().slice(0, 16).replace('T', ' ')
    });
  }
  
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const initialApiKeys: ApiKey[] = [
  {
    name: "Production API Key",
    key: "sk_live_51OxK8jL2abcdefghijklmnopqrstuvwxyz",
    scopes: ["checkout", "payout", "webhooks"],
    created: "2024-01-01",
    lastUsed: "2024-01-15 14:32",
  },
  {
    name: "Development API Key",
    key: "sk_test_51OxK8jL2zyxwvutsrqponmlkjihgfedcba",
    scopes: ["checkout"],
    created: "2023-12-15",
    lastUsed: "2024-01-14 09:15",
  },
];

export const initialPayouts: Payout[] = [
  { id: "pt-1B5sHxq3gi1D6", recipient: "merchant-123", date: "2024-01-15 10:00", amount: "$1,000.00 USD", status: "succeeded" },
  { id: "pt-2B5tlyr9h2D07", recipient: "merchant-456", date: "2024-01-15 09:30", amount: "$500.00 USD", status: "processing" },
  { id: "pt-3C6umzs0i3E18", recipient: "merchant-789", date: "2024-01-14 16:45", amount: "$750.00 USD", status: "succeeded" },
];

export const initialWebhooks: WebhookEndpoint[] = [
  {
    url: "https://api.client.com/webhooks",
    events: ["checkout.session.completed", "payment_intent.succeeded"],
    status: "active",
    created: "2024-01-01",
    lastDelivery: "2024-01-15 14:30"
  },
  {
    url: "https://staging.client.com/webhooks",
    events: ["payout.paid"],
    status: "active",
    created: "2023-12-20",
    lastDelivery: "2024-01-15 10:05"
  }
];
