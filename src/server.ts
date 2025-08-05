declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}
import { ethers, isHexString } from 'ethers';
import express, { NextFunction, Request, Response } from 'express';
import morgan, { format } from 'morgan';
import { v4 as uuidv4 } from 'uuid';
import { PaymasterHandler } from './handler/paymaster';
import { logger } from './config/winstom';
import { env } from './config/config';
import rpcRoutes from './routes/rpc.route';
import { PaymasterDataRequestDTO } from './domain/PaymasterDataRequestDTO';

const app = express();

app.use(express.json());
app.set("env",env)


const bundlerUrl = env.BUNDLER_URL;
const ProviderUrl = env.PROVIDER_URL;
const paymasterAddress = env.PAYMASTER_ADDRESS;
const paymasterPk = env.PAYMASTER_PK;

const provider = new ethers.JsonRpcProvider(ProviderUrl);
const bundler = new ethers.JsonRpcProvider(bundlerUrl);
const wallet = new ethers.Wallet(paymasterPk, provider);

const paymasterHandler = new PaymasterHandler(paymasterAddress, wallet);



function pm_logger(req: Request, res: Response, next: NextFunction) {
  req.id = uuidv4();
  const { method, params } = req.body;
  logger.info(`Served ${method}                           sender=${params[0].sender} id=${req.id}`);

  const userOp = params[0];
  const entryPoint = params[1];
  const chainId = params[2];
  const context = params[3];
  logger.verbose(JSON.stringify({ userOp, entryPoint, chainId, context }));

  res.on('finish', () => {
    if (res.statusCode == 400) {
      logger.error(`Response ${res.statusMessage}                           status=${res.statusCode} id=${req.id}`);
    } else {
      logger.info(`Response                            status=${res.statusCode} id=${req.id}`);
    }
  });

  res.on('close', () => {
    // console.log(`[CLOSE] ${req.method} ${req.originalUrl}`);
  });
  next();
}

app.use('/',rpcRoutes)

// app.post('/', [pm_logger], async (req: Request, res: Response) => {
//   try {
//     const body = req.body;
//     const method = body.method;
//     const jsonrpc = body.jsonrpc;
//     const id = body.id;
    
//     let sponsorDetails = false,
//       estimate = true;

//     if (method) {
//       switch (method) {
//         case 'pm_getPaymasterData':
//           estimate = false;
//           sponsorDetails = true;
//           break;
//         case 'pm_getPaymasterStubData':
//           break;
//         case 'pm_sponsorUserOperation':
//           return res.status(400).json({
//             error: 'pm_sponsorUserOperation Unsupported method name received',
//           });
//         case 'pm_getERC20TokenQuotes':
//           return res.status(400).json({
//             error: 'pm_getERC20TokenQuotes Unsupported method name received',
//           });
//         default:
//           return res.status(400).json({ error: 'Unsupported method name received' });
//       }
//     }
    
//     const pmDTO = PaymasterDataRequestDTO.of(body.params)
//     const {userOp, entryPoint, chainId, context} = pmDTO
//     const {validUntil, validAfter} = pmDTO.getExpiration(env.TIME_RANGE_UNTIL,env.TIME_RANGE_AFTER)
    
//     const result = await paymasterHandler.signV7(validUntil, validAfter, userOp, bundler, entryPoint, estimate);

//     if (body.jsonrpc) return res.status(200).send({ jsonrpc: body.jsonrpc, id: body.id, result, error: null });

//     return res.send(result);
//   } catch (error) {
//     logger.debug(error)
//     return res.status(400).send(error);
//   }
// });

app.listen(env.PORT, () => {
  logger.info(`Server listening on port ${env.PORT}`);
});
