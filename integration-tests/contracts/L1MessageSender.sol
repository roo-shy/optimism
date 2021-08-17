// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;

contract L1MessageSender {
    address public predeploy;

    constructor() {
        bytes memory initCode = abi.encodePacked(
            bytes1(0x7F),
            bytes32(bytes9(0x4860005260206000F3)),
            bytes8(0x60005260096000F3)
        );

        address created;
        assembly {
            created := create(0, add(initCode, 0x20), mload(initCode))
        }
        predeploy = created;
    }

    function getL1MessageSender() public returns (bool, bytes memory) {
        (bool success, bytes memory returndata) = predeploy.call("");
        return (success, returndata);
    }

    function dothing() public returns (address) {
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
