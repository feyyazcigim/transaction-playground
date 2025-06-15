import clients from "./lib/clients.ts";

const main = async () => {
  const { kernelClient, publicClient, accountAddress } = await clients;

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
