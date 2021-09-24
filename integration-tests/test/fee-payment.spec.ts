import { expect } from './shared/setup'

/* Imports: External */
import { ethers, BigNumber, utils } from 'ethers'
import { serialize } from '@ethersproject/transactions'
import { predeploys, getContractFactory } from '@eth-optimism/contracts'

/* Imports: Internal */
import { IS_LIVE_NETWORK, OptimismEnv, Direction } from './shared'

describe('fees and fee payment', async () => {
  let env: OptimismEnv
  before(async () => {
    env = await OptimismEnv.new()
  })

  const other = '0x1234123412341234123412341234123412341234'

  it('should return eth_gasPrice equal to OVM_GasPriceOracle.gasPrice', async () => {
    // Gas price from the oracle should be the same as the gas price returned by the RPC
    const gasPriceBefore = await env.l2Wallet.getGasPrice()
    const oracleGasPriceBefore = await env.gasPriceOracle.gasPrice()
    expect(gasPriceBefore).to.deep.equal(oracleGasPriceBefore)

    // Update the gas price to some new value
    const tx = await env.gasPriceOracle.setGasPrice(1000)
    await tx.wait()

    // Gas prices should still share the same value after the update
    const gasPriceAfter = await env.l2Wallet.getGasPrice()
    const oracleGasPriceAfter = await env.gasPriceOracle.gasPrice()
    expect(gasPriceAfter).to.deep.equal(oracleGasPriceAfter)
  })

  describe('fee payment logic', async () => {
    const setGasPrices = async (args: {
      l2GasPrice: number | BigNumber
      l1GasPrice: number | BigNumber
    }) => {
      const gasPrice = await env.gasPriceOracle.setGasPrice(args.l2GasPrice)
      await gasPrice.wait()
      const baseFee = await env.gasPriceOracle.setL1BaseFee(args.l1GasPrice)
      await baseFee.wait()
    }

    const getL1Fee = async (
      tx: ethers.providers.TransactionRequest
    ): Promise<ethers.BigNumber> => {
      return env.gasPriceOracle.getL1Fee(
        serialize({
          nonce: parseInt(tx.nonce.toString(10), 10),
          value: tx.value,
          gasPrice: tx.gasPrice,
          gasLimit: tx.gasLimit,
          to: tx.to,
          data: tx.data,
        })
      )
    }

    afterEach(async () => {
      // Always prices back to zero when we're done
      await setGasPrices({
        l2GasPrice: 0,
        l1GasPrice: 0,
      })
    })

    describe('when the L2 gas price is nonzero', async () => {
      before(async () => {
        await setGasPrices({
          l2GasPrice: 1000,
          l1GasPrice: 1000,
        })
      })

      it('should charge a fee equal to the L1 fee plus the L2 fee', async () => {
        // Quickly make sure the wallet has enough balance to be able to run this test
        // TODO: Handle this more gracefully
        const amount = utils.parseEther('0.0000001')
        const balanceBefore = await env.l2Wallet.getBalance()
        expect(balanceBefore.gt(amount))

        const feeVaultBalanceBefore = await env.l2Wallet.provider.getBalance(
          env.sequencerFeeVault.address
        )

        // TODO: Should this use signed transactions instead? Need to talk to wallets.
        const unsigned = await env.l2Wallet.populateTransaction({
          to: other,
          value: amount,
          gasLimit: 500000,
        })

        // Compute the L1 fee based on the unsigned transaction.
        const l1Fee = await getL1Fee(unsigned)

        // Send the transaction and make sure it succeeds.
        const tx = await env.l2Wallet.sendTransaction(unsigned)
        const receipt = await tx.wait()
        expect(receipt.status).to.eq(1)

        const balanceAfter = await env.l2Wallet.getBalance()
        const feeVaultBalanceAfter = await env.l2Wallet.provider.getBalance(
          env.sequencerFeeVault.address
        )

        // Compute the L2 fee based on the gas price and the amount of gas used.
        const l2Fee = receipt.gasUsed.mul(tx.gasPrice)

        // Total fee should be equal to the L1 fee plus the L2 fee
        const expectedFeePaid = l1Fee.add(l2Fee)

        // Wallet balance should have decreased by amount + total fee
        expect(balanceBefore.sub(balanceAfter)).to.deep.equal(
          expectedFeePaid.add(amount)
        )

        // Fee vault balance should have increased by total fee
        expect(feeVaultBalanceAfter.sub(feeVaultBalanceBefore)).to.deep.equal(
          expectedFeePaid
        )
      })
    })

    describe('when the L2 gas price is zero', async () => {
      it('should not charge a fee when the L1 gas price is nonzero', async () => {
        await setGasPrices({
          l2GasPrice: 0,
          l1GasPrice: 1000,
        })
      })

      it('should not charge a fee when the L1 gas price is zero', async () => {})
    })
  })

  it('should not be able to withdraw fees before the minimum is met', async () => {
    await expect(env.sequencerFeeVault.withdraw()).to.be.rejected
  })

  it('should be able to withdraw fees back to L1 once the minimum is met', async function () {
    const l1FeeWallet = await env.sequencerFeeVault.l1FeeWallet()
    const balanceBefore = await env.l1Wallet.provider.getBalance(l1FeeWallet)
    const withdrawalAmount = await env.sequencerFeeVault.MIN_WITHDRAWAL_AMOUNT()

    const l2WalletBalance = await env.l2Wallet.getBalance()
    if (IS_LIVE_NETWORK && l2WalletBalance.lt(withdrawalAmount)) {
      console.log(
        `NOTICE: must have at least ${ethers.utils.formatEther(
          withdrawalAmount
        )} ETH on L2 to execute this test, skipping`
      )
      this.skip()
    }

    // Transfer the minimum required to withdraw.
    const tx = await env.l2Wallet.sendTransaction({
      to: env.sequencerFeeVault.address,
      value: withdrawalAmount,
      gasLimit: 500000,
    })
    await tx.wait()

    const vaultBalance = await env.ovmEth.balanceOf(
      env.sequencerFeeVault.address
    )

    // Submit the withdrawal.
    const withdrawTx = await env.sequencerFeeVault.withdraw({
      gasPrice: 0, // Need a gasprice of 0 or the balances will include the fee paid during this tx.
    })

    // Wait for the withdrawal to be relayed to L1.
    await env.waitForXDomainTransaction(withdrawTx, Direction.L2ToL1)

    // Balance difference should be equal to old L2 balance.
    const balanceAfter = await env.l1Wallet.provider.getBalance(l1FeeWallet)
    expect(balanceAfter.sub(balanceBefore)).to.deep.equal(
      BigNumber.from(vaultBalance)
    )
  })
})
