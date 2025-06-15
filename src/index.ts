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

const main = async () => {
  // Construct a signer
  const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
  const signer = privateKeyToAccount(privateKey);

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
    // Required - the public client
    client: publicClient
  });

  const accountAddress = kernelClient.account.address;
  console.log("My account:", accountAddress);

  // Send a UserOp
  const userOpHash = await kernelClient.sendUserOperation({
    callData: await kernelClient.account.encodeCalls([
      {
        to: "0x11C1195Cc41d31A6A310f2700d355393f878e06A",
        value: BigInt("1000000000000000"), // 0.001 ETH
        data: "0x"
      }
    ])
  });

  console.log("UserOp hash:", userOpHash);
  console.log("Waiting for UserOp to complete...");

  await kernelClient.waitForUserOperationReceipt({
    hash: userOpHash,
    timeout: 1000 * 15
  });

  console.log("UserOp completed: https://base-sepolia.blockscout.com/op/" + userOpHash);

  process.exit();
};

main();
