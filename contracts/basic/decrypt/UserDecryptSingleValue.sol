// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title User Decrypt Single Value Example
/// @notice Demonstrates user decryption with proper permission handling
/// @dev Users can only decrypt values they have permission to access
contract UserDecryptSingleValue is ZamaEthereumConfig {
  euint32 private _value;
  address private _owner;

  constructor() {
    _owner = msg.sender;
  }

  /// @notice Sets an encrypted value
  /// @dev Grants permission to both contract and caller
  function setValue(externalEuint32 inputValue, bytes calldata inputProof) external {
    _value = FHE.fromExternal(inputValue, inputProof);

    // CRITICAL: Both permissions are required for user decryption
    FHE.allowThis(_value);  // Contract needs permission for storage
    FHE.allow(_value, msg.sender);  // User needs permission for decryption
  }

  /// @notice Grants decryption permission to a specific address
  /// @dev Only owner can grant permissions
  function grantPermission(address user) external {
    require(msg.sender == _owner, "Only owner can grant permissions");
    FHE.allow(_value, user);
  }

  /// @notice Returns the encrypted value
  /// @dev User must have permission to decrypt this value off-chain
  function getValue() external view returns (euint32) {
    // User can decrypt this value off-chain if they have permission
    return _value;
  }

  /// @notice Example of INCORRECT pattern - view function with encrypted return
  /// @dev This will NOT work for decryption due to view function limitations
  /// @custom:warning Anti-pattern: Don't use view functions for values meant to be decrypted
  function getValueIncorrect() external view returns (euint32) {
    // This pattern is discouraged because permissions cannot be granted in view functions
    return _value;
  }

  /// @notice CORRECT pattern - non-view function that grants permission
  function getValueWithPermission() external returns (euint32) {
    // Grant permission in a state-changing function
    FHE.allow(_value, msg.sender);
    return _value;
  }
}
