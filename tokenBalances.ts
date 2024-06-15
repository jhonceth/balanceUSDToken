import Web3 from 'web3';

interface TokenBalance {
  symbol: string;
  balance: number;
}

async function getTokenBalances(address: string, tokens: string[]): Promise<TokenBalance[]> {
  const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/869d8bd6bd21431a82ed0c86a35b14ae'));

  const tokenBalances: TokenBalance[] = [];

  for (const token of tokens) {
    try {
      if (token === 'ETH') {
        const balanceWei = await web3.eth.getBalance(address);
        const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
        tokenBalances.push({ symbol: 'ETH', balance: parseFloat(balanceEth) });
      } else {
        // Example: ERC20 token balance retrieval
        const contract = new web3.eth.Contract(ERC20ABI, token);
        const balance = await contract.methods.balanceOf(address).call();
        const decimals = await contract.methods.decimals().call();
        
        if (typeof balance === 'string' && typeof decimals === 'string') {
          const balanceFormatted = parseFloat(balance) / Math.pow(10, parseInt(decimals, 10));
          tokenBalances.push({ symbol: token, balance: balanceFormatted });
        } else {
          console.error(`Error fetching balance for token ${token} at address ${address}: Balance or decimals not available`);
          tokenBalances.push({ symbol: token, balance: 0 }); // Handle error case
        }
      }
    } catch (error) {
      console.error(`Error fetching balance for token ${token} at address ${address}:`, error);
      tokenBalances.push({ symbol: token, balance: 0 }); // Handle error case
    }
  }

  return tokenBalances;
}

const ERC20ABI = [
  // ERC20 standard ABI
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "type": "function"
  }
];

export { getTokenBalances };
