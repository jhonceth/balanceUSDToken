export interface TokenBalance {
  address: string;  // Cambiar tokenAddress por address
  balance: number;
  name: string;
  usdPrice: number;
  BalanceUSD: number;
}

export interface Address {
  address: string;
  network: number;
}

export interface Output {
  address: string;
  network: number;
  tokens: TokenBalance[];
  totalBalanceUSD: number;
}
