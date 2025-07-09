import { BigNumberish, toBeHex, zeroPadValue, BytesLike, hexlify } from "ethers";

export function packUint(high128: BigNumberish, low128: BigNumberish): string {
  // BigInt로 변환
  const high = BigInt(high128);
  const low = BigInt(low128);

  // (high << 128) + low 계산
  const packed = (high << 128n) + low;

  // hex 변환 + 32바이트 패딩
  const hex = toBeHex(packed);
  return zeroPadValue(hex, 32);
}

export function hexConcat(items: ReadonlyArray<BytesLike>): string {
  let result = "0x";
  items.forEach((item) => {
    result += hexlify(item).substring(2);
  });
  return result;
}