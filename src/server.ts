declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

import { ethers } from 'ethers';
import express, { NextFunction, Request, Response } from 'express';
import morgan, { format } from 'morgan';
import { v4 as uuidv4 } from 'uuid';
import { PaymasterHandler } from './handler/paymaster';
import { logger } from './config/winstom';
import { env } from './config/config';

const app = express();

app.use(express.json());

// app.use(morgan((tokens, req, res) => {
//   // 필요한 request 데이터 추출
//   const logData = {
//     method: tokens.method(req, res),
//     url: tokens.url(req, res),
//     status: tokens.status(req, res),
//     'response-time': tokens['response-time'](req, res) + ' ms',
//     body: req.body,             // JSON body (app.use(express.json()) 필요)
//     query: req.query,
//     headers: req.headers,
//     ip: req.ip
//   };

//   // winston으로 로그 전송 (JSON 전체)
//   logger.info('API Request :' + JSON.stringify(logData,null,2));

//   // morgan은 빈 문자열 리턴 (console에 별도 로그 출력하지 않음)
//   return '';
// }));

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

function pm_checkChainId(req: Request, res: Response, next: NextFunction) {
  const { method, params } = req.body;
  const chainId = params[2];

  if (chainId == env.CHAIN_ID) {
    next()
  } else {
    return res.status(400).json({ error: 'Unsupported chain id' });
  }
    
}


app.post('/', [pm_logger,pm_checkChainId], async (req: Request, res: Response) => {
  try {
    const query = req.query;
    const body = req.body;
    const method = body.method;

    let sponsorDetails = false,
      estimate = true;

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
  } catch (error) {
    logger.debug(error)
    return res.status(400).send(error);
  }
});

app.listen(env.PORT, () => {
  logger.info(`Server listening on port ${env.PORT}`);
});
