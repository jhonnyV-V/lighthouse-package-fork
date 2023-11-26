/* istanbul ignore file */
import axios from 'axios'
import { ethers } from 'ethers'
import { lighthouseConfig } from '../../../lighthouse.config'

export default async (): Promise<string> => {
	try {
		const provider = new ethers.BrowserProvider((window as any).ethereum)
    	const signer = await provider.getSigner()
		const message = (await axios.get(
			`${lighthouseConfig.lighthouseAPI}/api/auth/get_message?publicKey=${signer.address}`
		)).data
		const signature = await signer.signMessage(message)
		return `${signer.address}$${signature}`
	} catch (error: any) {
		throw new Error(error.message)
	}
}
