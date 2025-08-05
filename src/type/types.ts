export type UserOperation = {
    sender:string
    factory?:string
    factoryData?:string
    callData:string
    nonce:string
    signature:string
    callGasLimit:string
    verificationGasLimit:string
    preVerificationGas:string
    maxFeePerGas:string
    maxPriorityFeePerGas:string
}