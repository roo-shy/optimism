import { expect } from './shared/setup'

/* Imports: External */
import { ethers } from 'hardhat'
import { Contract, ContractFactory } from 'ethers'

/* Imports: Internal */
import {
  Direction,
  OptimismEnv,
  useDynamicTimeoutForWithdrawals,
} from './shared'

describe('basic L1 <> L2 communication', async () => {
  let env: OptimismEnv
  before(async () => {
    env = await OptimismEnv.new()
  })

  let Factory__SimpleStorage: ContractFactory
  before(async () => {
    Factory__SimpleStorage = await ethers.getContractFactory('SimpleStorage')
  })

  let L1SimpleStorage: Contract
  let L2SimpleStorage: Contract
  beforeEach(async () => {
    // Deploy the L1 instance of the SimpleStorage contract
    L1SimpleStorage = await Factory__SimpleStorage.connect(
      env.l1Wallet
    ).deploy()
    await L1SimpleStorage.deployTransaction.wait()

    // Deploy the L2 instance of the SimpleStorage contract
    L2SimpleStorage = await Factory__SimpleStorage.connect(
      env.l1Wallet
    ).deploy()
    await L2SimpleStorage.deployTransaction.wait()
  })

  describe('L2 => L1', () => {
    it('should be able to send a message from L2 to L1', async function () {
      // TODO: Get rid of this dynamic timeout thing
      await useDynamicTimeoutForWithdrawals(this, env)

      // TODO: Use a shared constant non-zero value
      const value = `0x${'77'.repeat(32)}`

      // Trigger the L2 -> L1 message.
      const transaction = await env.l2Messenger.sendMessage(
        L1SimpleStorage.address,
        L1SimpleStorage.interface.encodeFunctionData('setValue', [value]),
        5000000
      )
      await transaction.wait()

      // TODO: Add a step here for waiting for the transaction to finalize.

      // Relay the message and wait for it to be received on L2.
      await env.relayXDomainMessages(transaction)
      await env.waitForXDomainTransaction(transaction, Direction.L2ToL1)

      // msg.sender should be the L1CrossDomainMessenger.
      expect(await L1SimpleStorage.msgSender()).to.equal(
        env.l1Messenger.address
      )

      // xDomainMessageSender should be the L2 wallet address.
      expect(await L1SimpleStorage.xDomainSender()).to.equal(
        env.l2Wallet.address
      )

      // value should be the value we sent.
      expect(await L1SimpleStorage.value()).to.equal(value)

      // totalCount should be 1 because we only sent one message.
      expect((await L1SimpleStorage.totalCount()).toNumber()).to.equal(1)
    })
  })

  describe('L1 => L2', () => {
    it('should be able to send a message from L1 to L2', async () => {
      // TODO: Use a shared constant non-zero value
      const value = `0x${'42'.repeat(32)}`

      // Trigger the L1 -> L2 message.
      const transaction = await env.l1Messenger.sendMessage(
        L2SimpleStorage.address,
        L2SimpleStorage.interface.encodeFunctionData('setValue', [value]),
        5000000
      )
      await transaction.wait()

      // Wait for the transaction to be executed on L2.
      const { remoteReceipt } = await env.waitForXDomainTransaction(
        transaction,
        Direction.L1ToL2
      )

      // L2 transaction status should be 1 (success).
      expect(remoteReceipt.status).to.equal(1)

      // msg.sender should be the L2CrossDomainMessenger.
      expect(await L2SimpleStorage.msgSender()).to.equal(
        env.l2Messenger.address
      )

      // xDomainMessageSender should be the L1 wallet address.
      expect(await L2SimpleStorage.xDomainSender()).to.equal(
        env.l1Wallet.address
      )

      // value should be the value we sent.
      expect(await L2SimpleStorage.value()).to.equal(value)

      // totalCount should be 1 because we only sent one message.
      expect((await L2SimpleStorage.totalCount()).toNumber()).to.equal(1)
    })
  })
})
