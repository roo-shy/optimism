// SPDX-License-Identifier: MIT
pragma solidity >0.5.0 <0.8.0;

/* Interface Imports */
import { iOVM_L1MessageSender } from "../../iOVM/predeploys/iOVM_L1MessageSender.sol";

/**
 * @title OVM_L1MessageSender
 * @dev The L1MessageSender is a predeploy contract running on L2. During the execution of cross
 * domain transaction from L1 to L2, it returns the address of the L1 account (either an EOA or
 * contract) which sent the message to L2 via the Canonical Transaction Chain's `enqueue()`
 * function.
 *
 * This contract exclusively serves as a getter for the ovmL1TXORIGIN operation. This is necessary
 * because there is no corresponding operation in the EVM which the the optimistic solidity compiler
 * can be replaced with a call to the ExecutionManager's ovmL1TXORIGIN() function.
 *
 *
 * Compiler used: solc
 * Runtime target: OVM
 */
contract OVM_L1MessageSender is iOVM_L1MessageSender {

    /********************
     * Public Functions *
     ********************/

    /**
     * @return _l1MessageSender L1 message sender address (msg.sender).
     */
    function getL1MessageSender()
        override
        public
        returns (
            address
        )
    {
        bytes memory code = hex"4860005260206000F3";
        address l1MessageSender;
        assembly {
            let created := create(0, add(code, 0x20), mload(code))
            let out := mload(0x40)
            mstore(0x40, add(out, 0x20))
            extcodecopy(created, out, 0x0, 0x20)
            l1MessageSender := mload(out)
        }
        return l1MessageSender;
    }
}
