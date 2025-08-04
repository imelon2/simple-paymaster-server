import { AbiCoder, AddressLike, BigNumberish, BytesLike, ethers, JsonRpcProvider, toBeHex, Wallet } from 'ethers';
import { hexConcat, packUint } from '../utils/pack';
import { SimplePaymaster, SimplePaymaster__factory } from '../typechain-types';
import { PackedUserOperationStruct } from '../typechain-types/contracts/SimplePaymaster';

export class PaymasterHandler {
  SimplePaymaster: SimplePaymaster;
  PaymasterWallet: Wallet;

  paymasterPostOpGasLimit = ethers.toBeHex(40000);
  paymasterVerificationGasLimit = ethers.toBeHex(30000);
  entryPointV7 = '0x0000000071727De22E5E9d8BAf0edAc6f37da032';

  constructor(pmAddr: string, wallet: Wallet) {
    this.PaymasterWallet = wallet;
    this.SimplePaymaster = SimplePaymaster__factory.connect(pmAddr, wallet);
  }

  packPaymasterData(
    paymaster: string,
    paymasterVerificationGasLimit: BigNumberish,
    postOpGasLimit: BigNumberish,
    paymasterData?: BytesLike
  ): BytesLike {
    return ethers.concat([paymaster, packUint(paymasterVerificationGasLimit, postOpGasLimit), paymasterData ?? '0x']);
  }

  async encodePaymasterData(validUntil: number, validAfter: number, packedUserOp: PackedUserOperationStruct) {
    const hash = await this.SimplePaymaster.getHash(packedUserOp, validUntil, validAfter);
    const sig = await this.PaymasterWallet.signMessage(ethers.toBeArray(hash))

    const coder = new AbiCoder();
    return hexConcat([coder.encode(['uint48', 'uint48'], [validUntil, validAfter]), sig]);
  }

  async signV7(
    validUntil: number,
    validAfter: number,
    userOp: any,
    bundler: JsonRpcProvider,
    entryPoint:string,
    estimate: boolean
  ) {    
    if (!userOp.signature) userOp.signature = '0x';
    if (userOp.factory && userOp.factoryData) userOp.initCode = hexConcat([userOp.factory, userOp.factoryData ?? '']);
    if (!userOp.initCode) userOp.initCode = "0x";

    console.log(2);
    const paymaster = await this.SimplePaymaster.getAddress();
    if (estimate) {
      console.log(21);
      userOp.paymaster = paymaster;
      userOp.paymasterVerificationGasLimit = this.paymasterVerificationGasLimit;
      userOp.paymasterPostOpGasLimit = this.paymasterPostOpGasLimit;
      
      console.log(22);
      const accountGasLimits = packUint(userOp.verificationGasLimit, userOp.callGasLimit);
      const gasFees = packUint(userOp.maxPriorityFeePerGas, userOp.maxFeePerGas);
      
      console.log(23);
      const packedUserOp: PackedUserOperationStruct = {
        sender: userOp.sender,
        nonce: userOp.nonce,
        initCode: userOp.initCode,
        callData: userOp.callData,
        accountGasLimits: accountGasLimits,
        preVerificationGas: userOp.preVerificationGas,
        gasFees: gasFees,
        paymasterAndData: this.packPaymasterData(paymaster, this.paymasterVerificationGasLimit, this.paymasterPostOpGasLimit),
        signature: userOp.signature,
      };
      console.log(24);
      userOp.paymasterData = await this.encodePaymasterData(validUntil, validAfter, packedUserOp);
      
      console.log(25);
      const response = await bundler.send('eth_estimateUserOperationGas', [userOp, entryPoint]);

      console.log(3);
      // estimated gas
      userOp.verificationGasLimit = response.verificationGasLimit;
      userOp.callGasLimit = response.callGasLimit;
      userOp.preVerificationGas = response.preVerificationGas;
    }

    const accountGasLimits = packUint(userOp.verificationGasLimit, userOp.callGasLimit);
    const gasFees = packUint(userOp.maxPriorityFeePerGas, userOp.maxFeePerGas);
    const packedUserOp = {
      sender: userOp.sender,
      nonce: userOp.nonce,
      initCode: userOp.initCode,
      callData: userOp.callData,
      accountGasLimits: accountGasLimits,
      preVerificationGas: userOp.preVerificationGas,
      gasFees: gasFees,
      paymasterAndData: this.packPaymasterData(paymaster, this.paymasterVerificationGasLimit, this.paymasterPostOpGasLimit),
      signature: userOp.signature,
    };

    const paymasterAndData = await this.encodePaymasterData(validUntil, validAfter, packedUserOp);

    if (estimate) {
      return {
        paymaster: userOp.paymaster,
        paymasterData: paymasterAndData,
        paymasterPostOpGasLimit: this.paymasterPostOpGasLimit,
        paymasterVerificationGasLimit: this.paymasterVerificationGasLimit,
      };
    } else {
      return {
        paymaster,
        paymasterData: paymasterAndData,
      };
    }
  }
}
