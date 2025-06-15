import "dotenv/config";
import { createPublicClient, http, createWalletClient, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

const client = createPublicClient({
  chain: sepolia,
  transport: http()
});

const blockNumber = await client.getBlockNumber();

console.log(`Current block number: ${blockNumber}`);
console.log(`Private key: ${process.env.PRIVATE_KEY}`);

const wallet_client = createWalletClient({
  chain: sepolia,
  transport: http()
});

const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);

const hash = await wallet_client.sendTransaction({
  account,
  to: "0x5Ba55eaBD43743Ef6bB6285f393fA3CbA33FbA5e",
  value: parseEther("0.001")
});

console.log(`Transaction hash: ${hash}`);
console.log(`Transaction sent successfully!`);
console.log(`Check the transaction at: https://sepolia.etherscan.io/tx/${hash}`);
