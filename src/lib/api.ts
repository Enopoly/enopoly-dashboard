export const fakeApiCall = (ms = 1000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const generateApiKey = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'sk_live_51';
  for (let i = 0; i < 40; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
};

export const generatePayoutId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = 'pt-';
  for (let i = 0; i < 13; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};
