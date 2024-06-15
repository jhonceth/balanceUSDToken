// Created by Jhon Wardcast
// https://warpcast.com/jhonc.eth
// Email: jhon20ab@gmail.com

import * as fs from 'fs';
import * as dotenv from 'dotenv';
import axios from 'axios';
import { Address, TokenBalance, Output } from './types'; // Import types from types.ts

dotenv.config(); // Load environment variables from .env

// Define the JSON file containing addresses and networks
const inputFile = 'input.json';

// Function to get token balances on the Optimism network
const getOptimismTokenBalances = async (address: string): Promise<TokenBalance[]> => {
  const apiUrl = `https://optimism.blockscout.com/api/v2/addresses/${address}/token-balances`;
  try {
    const response = await axios.get(apiUrl);
    return response.data
      .filter((token: any) => token.token.exchange_rate !== null) // Filter tokens with non-null exchange_rate
      .map((token: any) => {
        const balance = parseFloat(token.value) / Math.pow(10, parseInt(token.token.decimals));
        const usdPrice = parseFloat(token.token.exchange_rate);
        return {
          address: token.token.address,  // Changed tokenAddress to address
          balance: balance,
          name: token.token.name,
          usdPrice: usdPrice,
          BalanceUSD: balance * usdPrice, // Calculate BalanceUSD
        };
      });
  } catch (error) {
    console.error(`Error fetching token balances for address ${address} on Optimism network:`, error);
    return [];
  }
};

// Function to get token balances on the Base network
const getBaseTokenBalances = async (address: string): Promise<TokenBalance[]> => {
  const apiUrl = `https://base.blockscout.com/api/v2/addresses/${address}/token-balances`;
  try {
    const response = await axios.get(apiUrl);
    return response.data
      .filter((token: any) => token.token.exchange_rate !== null) // Filter tokens with non-null exchange_rate
      .map((token: any) => {
        const balance = parseFloat(token.value) / Math.pow(10, parseInt(token.token.decimals));
        const usdPrice = parseFloat(token.token.exchange_rate);
        return {
          address: token.token.address,  // Changed tokenAddress to address
          balance: balance,
          name: token.token.name,
          usdPrice: usdPrice,
          BalanceUSD: balance * usdPrice, // Calculate BalanceUSD
        };
      });
  } catch (error) {
    console.error(`Error fetching token balances for address ${address} on Base network:`, error);
    return [];
  }
};

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Main function to fetch balances with rate limiting
const fetchBalances = async () => {
  try {
    const addresses: Address[] = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    const output: Output[] = [];

    const batchSize = 10; // Number of requests per batch
    const delayMs = 1000; // Delay between batches in milliseconds

    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, i + batchSize);

      const fetchBalanceTasks = batch.map(async (addr) => {
        let tokens: TokenBalance[] = [];

        if (addr.network === 10) {
          tokens = await getOptimismTokenBalances(addr.address);
        } else if (addr.network === 8453) {
          tokens = await getBaseTokenBalances(addr.address);
        } else {
          console.error(`Unsupported network: ${addr.network}`);
        }

        // Calculate total balance in USD
        let totalBalanceUSD = tokens.reduce((acc, token) => acc + token.BalanceUSD, 0);

        output.push({
          address: addr.address,
          network: addr.network,
          tokens: tokens,
          totalBalanceUSD: totalBalanceUSD,
        });
      });

      await Promise.all(fetchBalanceTasks);

      if (i + batchSize < addresses.length) {
        await delay(delayMs); // Delay between batches
      }
    }

    console.log(JSON.stringify(output, null, 2));
  } catch (error) {
    console.error("Error reading input file or processing balances:", error);
  }
};

// Run the script
fetchBalances().catch((error) => {
  console.error("Unexpected error:", error);
});
