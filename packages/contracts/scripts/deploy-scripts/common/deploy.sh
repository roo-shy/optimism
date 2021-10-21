#!/bin/bash

# Helper function for checking that environment variables exist.
reqenv () {
  if [[ -z $(eval "$"$1) ]]; then
    echo "Must pass $1"
    exit 1
  fi
}

# Check that all required environment variables are set.
envs=(
  CONTRACTS_DEPLOYER_KEY
  CONTRACTS_RPC_URL
  ETHERSCAN_API_KEY
  NETWORK_NAME
  L1_BLOCK_TIME_SECONDS
  CTC_L2_MAX_TRANSACTION_GAS_LIMIT
  CTC_L2_GAS_DISCOUNT_DIVISOR
  CTC_ENQUEUE_GAS_COST
  SCC_FRAUD_PROOF_WINDOW
  SCC_SEQUENCER_PUBLISH_WINDOW
  OVM_SEQUENCER_ADDRESS
  OVM_PROPOSER_ADDRESS
  OVM_ADDRESS_MANAGER_OWNER
  DEPLOY_GAS_PRICE
  DEPLOY_MODE
)

for env in "${envs[@]}"; do
  reqenv $env
done

# Build the deployment arguments.
args=(
  --l1-block-time-seconds $L1_BLOCK_TIME_SECONDS
  --ctc-max-transaction-gas-limit $CTC_L2_MAX_TRANSACTION_GAS_LIMIT
  --ctc-l2-gas-discount-divisor $CTC_L2_GAS_DISCOUNT_DIVISOR
  --ctc-enqueue-gas-cost $CTC_ENQUEUE_GAS_COST
  --scc-fraud-proof-window $SCC_FRAUD_PROOF_WINDOW
  --scc-sequencer-publish-window $SCC_SEQUENCER_PUBLISH_WINDOW
  --ovm-sequencer-address $OVM_SEQUENCER_ADDRESS
  --ovm-proposer-address $OVM_PROPOSER_ADDRESS
  --ovm-address-manager-owner $OVM_ADDRESS_MANAGER_OWNER
  --gasprice $DEPLOY_GAS_PRICE
  --network $NETWORK_NAME
)

if [ "$DEPLOY_MODE" == "upgrade" ]; then
  args+=(--tags upgrade)
fi

if [ "$DEPLOY_MODE" == "reset" ]; then
  args+=(--reset)
fi

# Run the deployment function.
CONTRACTS_TARGET_NETWORK=$NETWORK_NAME \
npx hardhat deploy "${args[@]}"

# Verify the deployment via etherscan.
CONTRACTS_TARGET_NETWORK=$NETWORK_NAME \
npx hardhat etherscan-verify \
  --network $NETWORK_NAME \
  --sleep
