/* eslint @typescript-eslint/no-var-requires: "off" */
import { DeployFunction } from 'hardhat-deploy/dist/types'
import { getDeployedContract } from '../src/hardhat-deploy-ethers'
import { Signer } from '@ethersproject/abstract-signer'
import { Provider } from '@ethersproject/abstract-provider'
import * as fs from 'fs'
import * as path from 'path'

const deployFn: DeployFunction = async (hre) => {
  if (hre.hardhatArguments.network === 'fork') {
    const signerOrProvider: Signer | Provider = hre.ethers.provider
    const forkNetwork = (hre as any).deployConfig.forkNetwork
    if (!forkNetwork) {
      throw new Error('Must pass fork network')
    }
    console.log(`Using forked network ${forkNetwork}`)

    const p = path.join(
      __dirname,
      '..',
      'deployments',
      forkNetwork,
      'Lib_AddressManager.json'
    )

    const artifact = require(p)
    const iface = new hre.ethers.utils.Interface(artifact.abi)

    const Lib_AddressManager = new hre.ethers.Contract(
      artifact.address,
      iface,
      signerOrProvider
    )

    const owner = await Lib_AddressManager.owner()

    const res = await hre.ethers.provider.send('hardhat_impersonateAccount', [
      owner
    ])

    console.log(`Impersonated ${owner}`)
  }
}

deployFn.tags = ['hardhat']

export default deployFn
