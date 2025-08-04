import { cleanEnv, email, str, json, url, makeValidator, EnvError, port, num } from 'envalid';
import { isAddress, isHexString } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

const address = makeValidator<string>((input: string) => {
  const coerced = isAddress(input);
  if (!coerced) throw new EnvError(`Invalid address input: "${input}"`);
  return input;
});

const hex = makeValidator<`0x${string}`>((input: string) => {
  const coerced = isHexString(input);
  if (!coerced) throw new EnvError(`Invalid address input: "${input}"`);
  return input;
});

export const env = cleanEnv(process.env, {
  PROVIDER_URL: url(),
  BUNDLER_URL: url(),
  PAYMASTER_ADDRESS: address(),
  PAYMASTER_PK: hex(),
  PORT: port({ default: 3500 }),
  CHAIN_ID:num({ default: 1337 }),
  VERBOSITY: str({ choices: ['error', 'warn', 'info', 'debug','verbose'] }),
});
