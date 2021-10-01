/**
 * Optimism PBC
 */
import path from 'path'

export const SOLC_BIN_PATH = 'https://binaries.soliditylang.org'
export const EMSCRIPTEN_BUILD_PATH = `${SOLC_BIN_PATH}/emscripten-wasm32`
export const EMSCRIPTEN_BUILD_LIST = `${EMSCRIPTEN_BUILD_PATH}/list.json`
export const LOCAL_SOLC_DIR = path.join(__dirname, '..', 'solc-bin')

// Address prefix for predeploy contracts
export const PREDEPLOY = '0x420000000000000000000000000000000000'
// Address prefix for dead contracts
export const DEAD = '0xdeaddeaddeaddeaddeaddeaddeaddeaddead'

export const EOA_CODE_HASHES = [
  '0xa73df79c90ba2496f3440188807022bed5c7e2e826b596d22bcb4e127378835a',
  '0xef2ab076db773ffc554c9f287134123439a5228e92f5b3194a28fec0a0afafe3',
]

export const ECDSA_CONTRACT_ACCOUNT_PREDEPLOY_SLOT =
  '0x0000000000000000000000004200000000000000000000000000000000000003'

export const IMPLEMENTATION_KEY =
  '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'

export const skip = [
  '0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24', // ERC 1820 Registery
  '0x06a506a506a506a506a506a506a506a506a506a5', // Gas metadata
]

export const compilerVersionsToSolc = {
  'v0.5.16': 'v0.5.16+commit.9c3226ce',
  'v0.5.16-alpha.7': 'v0.5.16+commit.9c3226ce',
  'v0.6.12': 'v0.6.12+commit.27d51765',
  'v0.7.6': 'v0.7.6+commit.7338295f',
  'v0.7.6+commit.3b061308': 'v0.7.6+commit.7338295f', // what vanilla solidity should this be?
  'v0.7.6-allow_kall': 'v0.7.6+commit.7338295f', // ^same q
  'v0.7.6-no_errors': 'v0.7.6+commit.7338295f',
  'v0.8.4': 'v0.8.4+commit.c7e474f2',
}

// TODO: figure out if all these need to be lowercased!
// Addresses to be wiped
export const uniswapLibraries = new Set([
  '0x18F7E3ae7202e93984290e1195810c66e1E276FF',
  '0x17B0F5E5850E7230136Df66c5d49497b8C3bE0c1',
  '0x47405B0D5f88e16701be6dC8aE185FEFaA5dcA2F',
  '0x01D95165C3C730D6B40f55c37e24c7AAC73d5E6f',
  '0x308C3E60585Ad4EAb5b7677BE0566FeaD4cb4746',
  '0x198Dcc7CD919dD33Dd72c3f981Df653750901D75',
  '0x569E8D536EC2dD5988857147c9FCC7d8a08a7DBc',
  '0x042f51014b152C2D2fC9b57E36b16bC744065D8C',
])

// Uniswap address to deployedBytecode
// Matching up to L1 at: https://github.com/Uniswap/v3-periphery/blob/main/deploys.md
export const uniswapContractAddresses = new Set([
  // UniswapV3Factory
  '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  // Multicall2: doesn't need to be pulled from L1 since no modifications
  // ProxyAdmin: OZ, doesn't need to be pulled from L1 since no modifications
  // TickLens
  '0xbfd8137f7d1516D3ea5cA83523914859ec47F573',
  // Quoter
  '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
  // SwapRouter
  '0xE592427A0AEce92De3Edee1F18E0157C05861564',
  // NFTDescriptor
  '0x42B24A95702b9986e82d421cC3568932790A48Ec',
  // NonfungibleTokenPositionDescriptor
  '0x91ae842A5Ffd8d12023116943e72A606179294f3',
  // TransparentUpgradeableProxy: OZ, doesn't need to be pulled from L1 since no modifications
  // NonfungiblePositionManager
  '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
])
export interface EtherscanContract {
  contractAddress: string
  code: string
  hash: string
  sourceCode: string
  creationCode: string
  contractFileName: string
  contractName: string
  compilerVersion: string
  optimizationUsed: string
  runs: string
  constructorArguments: string
  library: string
}

export interface immutableReference {
  start: number
  length: number
}

export interface immutableReferences {
  [key: string]: immutableReference[]
}
