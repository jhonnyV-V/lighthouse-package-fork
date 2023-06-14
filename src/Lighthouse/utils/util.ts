import { ethers } from 'ethers'

const isCID = (cid: string) => {
  return /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|b[A-Za-z2-7]{58}|B[A-Z2-7]{58}|z[1-9A-HJ-NP-Za-km-z]{48}|F[0-9A-F]{50})*$/.test(
    cid
  )
}

const isPrivateKey = (key: string) => {
  return /^([0-9a-f]{64})$/i.test(key)
}

const addressValidator = (value: string) => {
  if (ethers.utils.isAddress(value?.toLowerCase())) {
    return value.toLowerCase()
  } else if (/^[A-HJ-NP-Za-km-z1-9]*$/.test(value) && value.length == 44) {
    return value
  }
  return ''
}



export { isCID, isPrivateKey, addressValidator }
