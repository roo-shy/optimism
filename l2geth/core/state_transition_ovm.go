package core

import (
	"fmt"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/core/vm"
)

var ZeroAddress = common.HexToAddress("0x0000000000000000000000000000000000000000")

func toExecutionManagerRun(evm *vm.EVM, msg Message) (Message, error) {
	outputmsg, err := modMessage(
		msg,
		msg.From(),
		msg.To(),
		msg.Data(),
		evm.Context.GasLimit,
	)
	if err != nil {
		return nil, err
	}

	return outputmsg, nil
}

func AsOvmMessage(tx *types.Transaction, signer types.Signer, decompressor common.Address, gasLimit uint64) (Message, error) {
	msg, err := tx.AsMessage(signer)
	if err != nil {
		// This should only be allowed to pass if the transaction is in the ctc
		// already. The presence of `Index` should specify this.
		index := tx.GetMeta().Index
		if index == nil {
			return msg, fmt.Errorf("Cannot convert tx to message in asOvmMessage: %w", err)
		}
	}
	return msg, nil
}

func modMessage(
	msg Message,
	from common.Address,
	to *common.Address,
	data []byte,
	gasLimit uint64,
) (Message, error) {
	return msg, nil
}
