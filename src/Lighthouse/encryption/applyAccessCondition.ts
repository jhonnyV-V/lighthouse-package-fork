import { accessControl } from 'lighthouse-encryption-sdk-browser'
import { ChainType } from 'lighthouse-encryption-sdk-browser/dist/types'

export type accessControlResponse = {
  data: {
    cid: string
    status: string
  }
}

export default async (
  publicKey: string,
  cid: string,
  signedMessage: string,
  conditions: any,
  aggregator: string | undefined = undefined,
  chainType: ChainType = 'evm'
): Promise<accessControlResponse> => {
  // send encryption key
  const { isSuccess, error } = await accessControl(
    publicKey,
    cid,
    signedMessage,
    conditions,
    aggregator,
    chainType
  )

  if (error) {
    throw error
  }
  return { data: { cid: cid, status: 'Success' } }
}
