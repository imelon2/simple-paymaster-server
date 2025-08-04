export type UserOperation = {
    sender:`0x${string}`
    factory:`0x${string}`
    factoryData:`0x${string}`
    callData:`0x${string}`
    nonce:`0x${string}`
    signature:`0x${string}`
    callGasLimit:`0x${string}`
    verificationGasLimit:`0x${string}`
    preVerificationGas:`0x${string}`
    maxFeePerGas:`0x${string}`
    maxPriorityFeePerGas:`0x${string}`
}