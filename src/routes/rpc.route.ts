import { NextFunction, Request, Response, Router } from 'express';
import { PaymasterDataRequestDTO } from '../domain/PaymasterDataRequestDTO';
import { ZodError } from 'zod';
import { env } from '../config/config';
import { ethers } from 'ethers';
import { PaymasterHandler } from '../handler/paymaster';
import { logger } from '../config/winstom';

type MethodName = keyof typeof methodMap;

const router = Router();

const {
  ENTRYPOINT_ADDRESS,
  CHAIN_ID,
  TIME_RANGE_UNTIL,
  TIME_RANGE_AFTER,
  BUNDLER_URL,
  PROVIDER_URL,
  PAYMASTER_PK,
  PAYMASTER_ADDRESS,
} = env;

const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
const bundler = new ethers.JsonRpcProvider(BUNDLER_URL);
const wallet = new ethers.Wallet(PAYMASTER_PK, provider);

const paymasterHandler = new PaymasterHandler(PAYMASTER_ADDRESS, wallet);

const methodMap = {
  pm_getPaymasterData: async (req: Request, res: Response) => {
    try {
      const { params, id,method } = req.body;
      const pmDTO = PaymasterDataRequestDTO.of(params);
      const { userOp, entryPoint, chainId } = pmDTO;

      if (ENTRYPOINT_ADDRESS !== entryPoint) {
        return res.json(rpcError(-32000, 'Unsupported Entrypoint version received', id));
      }
      if (CHAIN_ID !== ethers.toNumber(chainId)) {
        return res.json(rpcError(-32000, 'Unsupported Chain id received', id));
      }

      const { validUntil, validAfter } = pmDTO.getExpiration(TIME_RANGE_UNTIL, TIME_RANGE_AFTER);
      const data = await paymasterHandler.signV7(validUntil, validAfter, userOp, bundler, entryPoint, false);

      const result = {
        sponsor: { name: 'sponsorName', icon: 'sponsorImage' },
        ...data,
      };
      logger.debug(`Response ${method}`,{response:JSON.stringify(rpcReturn(result, id))})
      return res.send(rpcReturn(result, id));
    } catch (error) {
      throw error;
    }
  },
  pm_getPaymasterStubData: async (req: Request, res: Response) => {
    try {
      const { params, id,method } = req.body;
      const pmDTO = PaymasterDataRequestDTO.of(params);
      const { userOp, entryPoint, chainId } = pmDTO;

      if (ENTRYPOINT_ADDRESS !== entryPoint) {
        return res.json(rpcError(-32000, 'Unsupported Entrypoint version received', id));
      }
      if (CHAIN_ID !== ethers.toNumber(chainId)) {
        return res.json(rpcError(-32000, 'Unsupported Chain id received', id));
      }

      const { validUntil, validAfter } = pmDTO.getExpiration(TIME_RANGE_UNTIL, TIME_RANGE_AFTER);
      const result = await paymasterHandler.signV7(validUntil, validAfter, userOp, bundler, entryPoint, true);

      logger.debug(`Response ${method}`,{response:JSON.stringify(rpcReturn(result, id))})
      return res.send(rpcReturn(result, id));
    } catch (error) {
      throw error;
    }
  },
  pm_sponsorUserOperation: async (req: Request, res: Response) => {
    return res.json(rpcError(-32000, 'Unsupported pm_sponsorUserOperation received', req.body.id));
  },
  pm_getERC20TokenQuotes: async (req: Request, res: Response) => {
    return res.json(rpcError(-32000, 'Unsupported pm_getERC20TokenQuotes received', req.body.id));
  },
};

router.post('/', async (req: Request, res: Response) => {
  const { method, id, jsonrpc, params } = req.body;
  logger.info(`Served ${method}`,{sender:params[0].sender,id:id});
  logger.verbose(`Served ${method}`,{"body":JSON.stringify({ method, id, jsonrpc, params })});

  if (!method || !(method in methodMap)) {
    return res.json(rpcError(-32601, 'Method not found', id));
  }

  if (jsonrpc !== '2.0') {
    return res.json(rpcError(-32600, 'Invalid JSON-RPC version', id));
  }

  try {
    return methodMap[method as MethodName](req, res);
  } catch (error) {
    logger.debug(error);
    if (error instanceof ZodError) {
      return res.json(rpcError(-32602, 'Invalid params', id, error.message));
    }

    return res.json(rpcError(-32603, 'Internal error', id, error));
  }
});

function rpcError(code: number, message: string, id: any = null, data?: any) {
  return { jsonrpc: '2.0', error: { code, message, data }, id };
}

function rpcReturn(result: any, id: any = null, data?: any) {
  return { jsonrpc: '2.0', result: result, id };
}

export default router;
