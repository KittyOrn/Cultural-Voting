// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Access Control Example
/// @notice Demonstrates FHE.allow, FHE.allowThis, and FHE.allowTransient
/// @dev Shows proper permission management for encrypted values
contract AccessControlExample is ZamaEthereumConfig {
  euint32 private _privateData;
  euint32 private _sharedData;

  mapping(address => bool) private _authorized;
  address private _owner;

  constructor() {
    _owner = msg.sender;
    _authorized[msg.sender] = true;
  }

  /// @notice Authorizes an address to access encrypted data
  function authorizeUser(address user) external {
    require(msg.sender == _owner, "Only owner");
    _authorized[user] = true;
  }

  /// @notice Sets private data accessible only to the owner
  function setPrivateData(externalEuint32 inputValue, bytes calldata inputProof) external {
    require(msg.sender == _owner, "Only owner");

    _privateData = FHE.fromExternal(inputValue, inputProof);

    // IMPORTANT: allowThis grants the contract permission to use the value
    FHE.allowThis(_privateData);

    // IMPORTANT: allow grants a specific address permission to decrypt
    FHE.allow(_privateData, _owner);
  }

  /// @notice Sets shared data accessible to authorized users
  function setSharedData(externalEuint32 inputValue, bytes calldata inputProof) external {
    require(_authorized[msg.sender], "Not authorized");

    _sharedData = FHE.fromExternal(inputValue, inputProof);

    FHE.allowThis(_sharedData);
    FHE.allow(_sharedData, msg.sender);
  }

  /// @notice Grants access to shared data for authorized users
  /// @dev Demonstrates dynamic permission granting
  function grantSharedAccess(address user) external {
    require(msg.sender == _owner, "Only owner");
    require(_authorized[user], "User not authorized");

    // Grant permission to decrypt shared data
    FHE.allow(_sharedData, user);
  }

  /// @notice Example using FHE.allowTransient for temporary access
  /// @dev allowTransient grants permission only for the current transaction
  function getTemporaryAccess() external view returns (euint32) {
    require(_authorized[msg.sender], "Not authorized");

    // allowTransient grants temporary permission for this transaction only
    // Note: In view functions, use allowTransient carefully
    FHE.allowTransient(_sharedData, msg.sender);

    return _sharedData;
  }

  /// @notice Gets private data (only owner)
  function getPrivateData() external view returns (euint32) {
    require(msg.sender == _owner, "Only owner");
    return _privateData;
  }

  /// @notice Gets shared data (authorized users)
  function getSharedData() external view returns (euint32) {
    require(_authorized[msg.sender], "Not authorized");
    return _sharedData;
  }

  /// @notice ANTI-PATTERN: Missing allowThis
  /// @dev This will fail because contract doesn't have permission
  function setDataIncorrect(externalEuint32 inputValue, bytes calldata inputProof) external {
    euint32 data = FHE.fromExternal(inputValue, inputProof);

    // WRONG: Only granting user permission, not contract permission
    FHE.allow(data, msg.sender);
    // Missing: FHE.allowThis(data);

    _privateData = data;  // This will fail!
  }

  /// @notice CORRECT PATTERN: Both permissions granted
  function setDataCorrect(externalEuint32 inputValue, bytes calldata inputProof) external {
    euint32 data = FHE.fromExternal(inputValue, inputProof);

    // CORRECT: Grant both permissions
    FHE.allowThis(data);  // Contract can store/use the value
    FHE.allow(data, msg.sender);  // User can decrypt the value

    _privateData = data;  // This works!
  }
}
