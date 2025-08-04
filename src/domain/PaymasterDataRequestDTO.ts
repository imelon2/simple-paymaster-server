import * as z from 'zod';
import { UserOperation } from '../type/types';

export class PaymasterDataRequestDTO {
  userOp: UserOperation;
  entryPoint: `0x${string}`;
  chainId: `0x${string}`;
  context: Record<string, any>;

  schema = z.object({
    userOp: z.object({
      sender: z.custom<`0x${string}`>(),
      factory: z.custom<`0x${string}`>(),
      factoryData: z.custom<`0x${string}`>(),
      callData: z.custom<`0x${string}`>(),
      nonce: z.custom<`0x${string}`>(),
      signature: z.custom<`0x${string}`>(),
      callGasLimit: z.custom<`0x${string}`>(),
      verificationGasLimit: z.custom<`0x${string}`>(),
      preVerificationGas: z.custom<`0x${string}`>(),
      maxFeePerGas: z.custom<`0x${string}`>().default("0x0"),
      maxPriorityFeePerGas: z.custom<`0x${string}`>().default("0x0"),
    }),
    entryPoint: z.custom<`0x${string}`>(),
    chainId: z.custom<`0x${string}`>(),
    context: z.object(),
  });

  constructor() {}

  static of(body: any) {
    const dto = new PaymasterDataRequestDTO();

    dto.userOp = body.params[0];
    dto.entryPoint = body.params[1];
    dto.chainId = body.params[2];
    dto.context = body.params[3];

    const {userOp,entryPoint,chainId,context} = dto.validation();

    dto.userOp = userOp;
    dto.entryPoint = entryPoint;
    dto.chainId = chainId;
    dto.context = context;
    return dto;
  }

  validation() {
    return this.schema.parse({
      userOp:this.userOp,
      entryPoint:this.entryPoint,
      chainId:this.chainId,
      context:this.context,
    })
  }
}
