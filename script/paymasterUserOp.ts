import dotenv from 'dotenv';
import path from 'path';
import { getChainInfoById } from './chainList';
import { createPublicClient, http } from 'viem';
import { createPaymasterClient, createBundlerClient } from 'viem/account-abstraction';
import { privateKeyToAccount } from 'viem/accounts';
import { toSimpleSmartAccount } from 'permissionless/accounts';
dotenv.config({ path: path.join(__dirname, '.env') });

async function main() {
  /**
   * Set up: instantiate wallets connected to providers
   */
  if (!process.env.PRIVATE_KEY) throw new Error('PRIVATE_KEY is required');
  if (!process.env.BUNDLER_URL) throw new Error('BUNDLER_URL is required');
  if (!process.env.PAYMASTER_URL) throw new Error('PAYMASTER_URL is required');
  if (!process.env.CHAIN_ID) throw new Error('CHAIN_ID is required');

  const walletPrivateKey = process.env.PRIVATE_KEY as `0x${string}`;
  const bundlerUrl = process.env.BUNDLER_URL;
  const paymasterUrl = process.env.PAYMASTER_URL;

  const chain = getChainInfoById(Number(process.env.CHAIN_ID));
  const client = createPublicClient({
    chain: chain,
    transport: http(),
  });

  const paymasterClient = createPaymasterClient({
    transport: http(paymasterUrl),
  });

  const bundlerClient = createBundlerClient({
    client,
    paymaster: paymasterClient,
    transport: http(bundlerUrl),
  });

  /**
   * Set up: instantiate AA SimpleSmartAccount connected to provider
   */
  const owner = privateKeyToAccount(walletPrivateKey);
  const account = await toSimpleSmartAccount({
    client,
    owner: owner,
  });

  /**
   * Set up tx: set transaction minimal-data
   */
  const to = '0x0000000000000000000000000000000000004337';
  const value = 1n; // 1wei
  // console.log('send UserOp to Bundler.... ');
//   const hash = await bundlerClient.estimateUserOperationGas({
//     account,
//     paymasterContext: {
//       'policy-id': '1234-5678-90',
//     },
//     calls: [
//       {
//         to: to,
//         value: 0n,
//       },
//     ],
//   });
// console.log(hash);

  console.log('send UserOp to Bundler.... ');
  const hash = await bundlerClient.sendUserOperation({
    account,
    paymasterContext: {
      'policy-id': '1234-5678-90',
    },
    calls: [
      {
        to: to,
        value: 0n,
      },
    ],
  });
  console.log('wait tx......');
  console.log();
  const receipt = await bundlerClient.waitForUserOperationReceipt({
    hash,
  });
  const userOp = await bundlerClient.getUserOperation({ hash });
  console.log(`UserOpHash : ${hash}`);
  console.log(`Transaction Hash : ${userOp.transactionHash}`);
  console.log(
    `UserOp executed in ${receipt.receipt.blockNumber.toString()} block number | status : ${
      receipt.success ? 'success' : 'fail'
    }`
  );
  console.log();
}

main().then(() => {
  console.log('done');
  process.exit();
});
