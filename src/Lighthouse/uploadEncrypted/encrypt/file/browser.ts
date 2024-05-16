/* istanbul ignore file */
import axios from 'axios'
import FormData from 'form-data'
import { generate, saveShards } from 'lighthouse-encryption-sdk-browser'
import {
  IFileUploadedResponse,
  IUploadProgressCallback,
} from '../../../../types'
import { encryptFile } from '../../encryptionBrowser'
import { lighthouseConfig } from '../../../../lighthouse.config'
import { checkDuplicateFileNames } from '../../../utils/util'

declare const FileReader: any

const readFileAsync = (file: any) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      reader.result && resolve(reader.result)
    }

    reader.onerror = reject

    reader.readAsArrayBuffer(file)
  })
}

export default async (
  files: any,
  apiKey: string,
  publicKey: string,
  auth_token: string,
  uploadProgressCallback: (data: IUploadProgressCallback) => void
): Promise<{ data: IFileUploadedResponse[] }> => {
  try {
    let keyMap = {} as any
    // Generate fileEncryptionKey
    // const { masterKey: fileEncryptionKey, keyShards } = await generate()

    // Upload file
    let mimeType = null
    if (files.length === 1) {
      mimeType = files[0].type
    }
    const endpoint =
      lighthouseConfig.lighthouseNode + '/api/v0/add?wrap-with-directory=false'
    const token = 'Bearer ' + apiKey

    const fileArr = []
    for (let i = 0; i < files.length; i++) {
      fileArr.push(files[i])
    }
    checkDuplicateFileNames(fileArr)

    if (files.length > 1 && auth_token.startsWith("0x")) {
      throw new Error(JSON.stringify(`auth_token must be a JWT`))
    }

    const formData = new FormData()
    const boundary = Symbol()
    const filesParam = await Promise.all(
      fileArr.map(async (f) => {
        const { masterKey: fileEncryptionKey, keyShards } = await generate()
        const fileData = await readFileAsync(f)
        const encryptedData = await encryptFile(fileData, fileEncryptionKey)
        keyMap = { ...keyMap, [f.name]: keyShards }
        return {
          data: new Blob([encryptedData], { type: f.type }),
          fileName: f.name,
          keyShards,
        }
      })
    )
    filesParam.forEach(function(item_) {
      return formData.append(
        'file',
        item_.data,
        item_.fileName ? item_.fileName : 'file'
      )
    })

    const response = await axios.post(endpoint, formData, {
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      headers: {
        'Content-type': `multipart/form-data; boundary= ${boundary.toString()}`,
        Encryption: `${true}`,
        Authorization: token,
      },
      onUploadProgress: function(progressEvent) {
        if (progressEvent.total) {
          const _progress = Math.round(progressEvent.loaded / progressEvent.total)
          uploadProgressCallback({
            progress: _progress,
            total: progressEvent.total,
            uploaded: progressEvent.loaded,
          })
        }
      },
    })
    if (typeof response.data === 'string') {
      response.data = JSON.parse(
        `[${response.data.slice(0, -1)}]`.split('\n').join(',')
      )
    } else {
      response.data = [response.data]
    }

    const savedKey = await Promise.all(
      response.data.map(async (data: IFileUploadedResponse) => {
        return saveShards(
          publicKey,
          data.Hash,
          auth_token,
          keyMap[data.Name]
        )
      })
    )
    savedKey.forEach((_savedKey) => {
      if (!_savedKey.isSuccess) {
        throw new Error(JSON.stringify(_savedKey))
      }
    })

    // return response
    /*
      {
        data: [{
          Name: 'flow1.png',
          Hash: 'QmUHDKv3NNL1mrg4NTW4WwJqetzwZbGNitdjr2G6Z5Xe6s',
          Size: '31735'
        }]
      }
    */
    return { data: response.data }
  } catch (error: any) {
    return error.message
  }
}
