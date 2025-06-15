import "dotenv/config";
import { createKernelAccount, createKernelAccountClient } from "@zerodev/sdk";
import { KERNEL_V3_1, getEntryPoint } from "@zerodev/sdk/constants";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { http, createPublicClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

const ZERODEV_RPC =
  "https://rpc.zerodev.app/api/v3/c5d7ddfd-c4fb-4250-a23b-1232829b264e/chain/84532";
const chain = baseSepolia;
const entryPoint = getEntryPoint("0.7");
const kernelVersion = KERNEL_V3_1;
const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
const signer = privateKeyToAccount(privateKey);

// Singleton pattern with lazy initialization and error handling
class ClientManager {
  private static instance: ClientManager;
  private clientsPromise: Promise<{
    account: any;
    kernelClient: any;
    publicClient: any;
    accountAddress: string;
  }> | null = null;

  private constructor() {}

  static getInstance(): ClientManager {
    if (!ClientManager.instance) {
      ClientManager.instance = new ClientManager();
    }
    return ClientManager.instance;
  }

  async getClients() {
    if (!this.clientsPromise) {
      this.clientsPromise = this.initializeClients();
    }
    return this.clientsPromise;
  }

  private async initializeClients() {
    try {
      return await setupClients();
    } catch (error) {
      // Reset promise on failure to allow retry
      this.clientsPromise = null;
      throw new Error(`Failed to initialize clients: ${error}`);
    }
  }

  // Force refresh clients (useful for testing or error recovery)
  async refreshClients() {
    this.clientsPromise = null;
    return this.getClients();
  }
}

export const clientManager = ClientManager.getInstance();
export default clientManager.getClients();

// Construct a validator
async function setupClients() {
  // Construct a public client
  const publicClient = createPublicClient({
    // Use your own RPC provider in production (e.g. Infura/Alchemy).
    transport: http(ZERODEV_RPC),
    chain
  });

  // Construct a validator
  const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
    signer,
    entryPoint,
    kernelVersion
  });

  // Construct a Kernel account
  const account = await createKernelAccount(publicClient, {
    plugins: {
      sudo: ecdsaValidator
    },
    entryPoint,
    kernelVersion
  });

  // Construct a Kernel account client
  const kernelClient = createKernelAccountClient({
    account,
    chain,
    bundlerTransport: http(ZERODEV_RPC),
    client: publicClient
  });

  return {
    account,
    kernelClient,
    publicClient,
    accountAddress: account.address
  };
}
