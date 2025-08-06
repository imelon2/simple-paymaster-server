import * as z from 'zod';
import { UserOperation } from '../type/types';

type PaymasterParams = {
  userOp: UserOperation;
  entryPoint: `0x${string}`;
  chainId: `0x${string}`;
  context: Record<string, any>;
};

export class PaymasterDataRequestDTO {
  userOp: UserOperation;
  entryPoint: string;
  chainId: string;
  context: Record<string, any>;

  constructor() {}

  static of(params: any) {
    const dto = new PaymasterDataRequestDTO();

    const _params:PaymasterParams = {
      userOp: params[0],
      entryPoint: params[1],
      chainId: params[2],
      context: params[3],
    };

    const { userOp, entryPoint, chainId, context } = PaymasterDataRequestDTO.validation(_params);

    dto.userOp = userOp;
    dto.entryPoint = entryPoint;
    dto.chainId = chainId;
    dto.context = context;
    return dto;
  }

  getExpiration(until: number, after: number) {
    const date = new Date();
    const _validUntil = this.context?.validUntil ? new Date(this.context.validUntil) : date;
    const _validAfter = this.context?.validAfter ? new Date(this.context.validAfter) : date;
    const validUntil = Number((_validUntil.valueOf() / 1000).toFixed(0)) + until;
    const validAfter = Number((_validAfter.valueOf() / 1000).toFixed(0)) - after;

    return {
      validUntil,
      validAfter,
    };
  }

  static validation(params:PaymasterParams) {
    const paramSchema = z.object({
      userOp: z.object({
        sender: z.string().startsWith("0x").length(42),
        factory: z.string().startsWith("0x").optional(),
        factoryData: z.string().startsWith("0x").optional(),
        callData: z.string().startsWith("0x"),
        nonce: z.string().startsWith("0x"),
        signature: z.string().startsWith("0x"),
        callGasLimit: z.string().startsWith("0x"),
        verificationGasLimit: z.string().startsWith("0x"),
        preVerificationGas: z.string().startsWith("0x"),
        maxFeePerGas: z.string().default("0x0"),
        maxPriorityFeePerGas: z.string().default("0x0"),
      }),
      entryPoint: z.string().startsWith("0x"),
      chainId: z.string().startsWith("0x"),
      context: z.object(),
    });

    return paramSchema.parse({
      userOp: params.userOp,
      entryPoint: params.entryPoint,
      chainId: params.chainId,
      context: params.context,
    });
  }
}
