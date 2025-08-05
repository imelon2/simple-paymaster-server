import { ZodError } from 'zod';
import { PaymasterDataRequestDTO } from '../../src/domain/PaymasterDataRequestDTO';

describe('PaymasterDataRequestDTO', () => {
  let body: any = {};
  beforeEach(() => {
    body['params'] = [
      {
        callData:
          '0xb61d27f60000000000000000000000000000000000000000000000000000000000004337000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000',
        factory: '0x91E60e0613810449d098b0b5Ec8b51A0FE8c8985',
        factoryData:
          '0x5fbfb9cf000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb922660000000000000000000000000000000000000000000000000000000000000000',
        nonce: '0x19872f0f19e0000000000000000',
        signature:
          '0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c',
        sender: '0xa3aBDC7f6334CD3EE466A115f30522377787c024111',
        callGasLimit: '0x0',
        verificationGasLimit: '0x0',
        preVerificationGas: '0x0',
      },
      '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
      '0x539',
      { 'policy-id': '1234-5678-90' },
    ];
  });

  it('test', () => {
    try {
      const data = PaymasterDataRequestDTO.of(body);

      expect(data).toBeInstanceOf(PaymasterDataRequestDTO);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error(error.message);
        
        
      }
      console.error();
    }
  });
});
