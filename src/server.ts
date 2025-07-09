import { ethers } from 'ethers';
import express, { Request, Response } from 'express';
import morgan from 'morgan';
import { PaymasterHandler } from './handler/paymaster';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 3500;

app.use(express.json());
app.use(morgan('dev'));

if (!process.env.BUNDLER_URL) {
  throw new Error(`The following environmental variables are required: BUNDLER_URL`);
}
if (!process.env.PAYMASTER_ADDRESS) {
  throw new Error(`The following environmental variables are required: PAYMASTER_ADDRESS`);
}
if (!process.env.PAYMASTER_PK) {
  throw new Error(`The following environmental variables are required: PAYMASTER_PK`);
}
if (!process.env.PROVIDER_URL) {
  throw new Error(`The following environmental variables are required: PROVIDER_URL`);
}

const bundlerUrl = process.env.BUNDLER_URL;
const ProviderUrl = process.env.PROVIDER_URL;
const paymasterAddress = process.env.PAYMASTER_ADDRESS;
const paymasterPk = process.env.PAYMASTER_PK;

const provider = new ethers.JsonRpcProvider(ProviderUrl);
const bundler = new ethers.JsonRpcProvider(bundlerUrl);
const wallet = new ethers.Wallet(paymasterPk, provider);

const paymasterHandler = new PaymasterHandler(paymasterAddress, wallet);

app.post('/', async (req: Request, res: Response) => {
  const query = req.query;
  const body = req.body;
  const method = body.method;

  let sponsorDetails = false,
    estimate = true;
  console.log(method);

  if (method) {
    switch (method) {
      case 'pm_getPaymasterData':
        estimate = false;
        sponsorDetails = true;
        break;
      case 'pm_getPaymasterStubData':
        break;
      case 'pm_sponsorUserOperation':
        return res.status(400).json({
          error: 'pm_sponsorUserOperation Unsupported method name received',
        });
      case 'pm_getERC20TokenQuotes':
        return res.status(400).json({
          error: 'pm_getERC20TokenQuotes Unsupported method name received',
        });
      default:
        return res.status(400).json({ error: 'Unsupported method name received' });
    }
  }

  const userOp = body.params?.[0];
  const entryPoint = body.params?.[1];
  const chainId = body.params?.[2];
  const context = body.params?.[3];

  const date = new Date();
  const _validUntil = context?.validUntil ? new Date(context.validUntil) : date;
  const _validAfter = context?.validAfter ? new Date(context.validAfter) : date;
  const validUntil = Number((_validUntil.valueOf() / 1000).toFixed(0)) + 600;
  const validAfter = Number((_validAfter.valueOf() / 1000).toFixed(0)) - 60;

  const result = await paymasterHandler.signV7(validUntil, validAfter, userOp, bundler, entryPoint, estimate);

  if (body.jsonrpc) return res.status(200).send({ jsonrpc: body.jsonrpc, id: body.id, result, error: null });

  return res.send(result);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
