// SPDX-License-Identifier: MIT
pragma solidity >0.5.0 <0.8.0;

/**
 * @title OVM_GodKeyEntrypoint
 */
contract OVM_GodKeyEntrypoint {

    /*************
     * Variables *
     *************/

	bytes32 public l1Blockhash;
	uint256 public l1BaseFee;
	uint256 public l1Timestamp;
	uint256 public l1BlockNumber;
	address public l1TxOrigin;

    // The God key address.
    address constant internal GOD_KEY_ADDRESS = 0x696969FF03171A9BcC58e5a1A7fb3De2ad49B5d7;

    /************
     * Modifier *
     ***********/
    /**
     * Only execute if you're the God key.
     */
    modifier onlyGodKey() {
        require(msg.sender == GOD_KEY_ADDRESS, "Only callable by God key");
        _;
    }

    /********************
     * Public Functions *
     ********************/
    /**
     * Execute a deposit.
     */
    function executeDeposit(
	    address _target,
	    address _l1TxOrigin,
	    bytes memory _calldata
    )
        public
        onlyGodKey
    {
        l1TxOrigin = _l1TxOrigin;
        _target.call(_calldata);
        // Update with default address
        l1TxOrigin = address(-1);
    }

    /**
     * Sets the L1 context variables.
     */
    function setContext(
	    bytes32 _l1Blockhash,
	    uint256 _l1BaseFee,
	    uint256 _l1Timestamp,
	    uint256 _l1BlockNumber
    )
        public
        onlyGodKey
    {
	    l1Blockhash = _l1Blockhash;
	    l1BaseFee = _l1BaseFee;
	    l1Timestamp = _l1Timestamp;
	    l1BlockNumber = _l1BlockNumber;
    }
}
