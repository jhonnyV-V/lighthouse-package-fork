/* istanbul ignore file */
import axios from 'axios'
import FormData from 'form-data'
import { encryptFile } from '../../encryptionBrowser'
import { generate, saveShards } from 'lighthouse-encryption-sdk-browser'
import { lighthouseConfig } from '../../../../lighthouse.config'

export default async (
  text: string,
  apiKey: string,
  publicKey: string,
  signedMessage: string,
  name: string
) => {
  try {
    const token = 'Bearer ' + apiKey
    const endpoint = lighthouseConfig.lighthouseNode + '/api/v0/add'

    // Upload file
    const formDdata = new FormData()

    const { masterKey: fileEncryptionKey, keyShards } = await generate()

    const encoder = new TextEncoder()
    const encryptedData = await encryptFile(
      encoder.encode(text).buffer,
      fileEncryptionKey
    )

    formDdata.append('file', new Blob([encryptedData], { type: "text/plain" }), name)

    const boundary = Symbol()
    const response = await axios.post(endpoint, formDdata, {
      withCredentials: false,
      maxContentLength: Infinity, //this is needed to prevent axios from erroring out with large directories
      maxBodyLength: Infinity,
      headers: {
        'Content-type': `multipart/form-data; boundary= ${boundary.toString()}`,
        Encryption: 'true',
        'Mime-Type': 'text/plain',
        Authorization: token,
      },
    })

    const { error } = await saveShards(
      publicKey,
      response.data.Hash,
      signedMessage,
      keyShards
    )

    if (error) {
      throw new Error('Error encrypting file')
    }
    return { data: response.data }
  } catch (error: any) {
    throw new Error(error.message)
  }
}
