// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Public Decrypt Single Value Example
/// @notice Demonstrates public decryption mechanism for revealing encrypted values
/// @dev Public decryption is asynchronous and requires relayer interaction
contract PublicDecryptSingleValue is ZamaEthereumConfig {
  euint32 private _encryptedValue;
  uint32 private _decryptedValue;
  bool private _isDecrypted;

  event DecryptionRequested(uint256 requestId);
  event ValueDecrypted(uint32 value);

  /// @notice Sets an encrypted value
  function setEncryptedValue(externalEuint32 inputValue, bytes calldata inputProof) external {
    _encryptedValue = FHE.fromExternal(inputValue, inputProof);

    FHE.allowThis(_encryptedValue);
    FHE.allow(_encryptedValue, msg.sender);

    _isDecrypted = false;
  }

  /// @notice Requests public decryption of the stored value
  /// @dev This initiates asynchronous decryption via the relayer
  function requestDecryption() external {
    require(!_isDecrypted, "Value already decrypted");

    // Create array with single value to decrypt
    bytes32[] memory cts = new bytes32[](1);
    cts[0] = FHE.toBytes32(_encryptedValue);

    // Request decryption - callback will be processDecryption
    uint256 requestId = FHE.requestDecryption(cts, this.processDecryption.selector);

    emit DecryptionRequested(requestId);
  }

  /// @notice Callback function for processing decrypted value
  /// @dev Called by the relayer with the decrypted value
  /// @param requestId The decryption request identifier
  /// @param decryptedValues Array of decrypted values
  /// @param signatures Relayer signatures (unused in this example)
  function processDecryption(
    uint256 requestId,
    uint32[] calldata decryptedValues,
    bytes[] calldata signatures
  ) external {
    // In production, validate the caller is the trusted relayer
    require(decryptedValues.length > 0, "No decrypted values");

    _decryptedValue = decryptedValues[0];
    _isDecrypted = true;

    emit ValueDecrypted(_decryptedValue);
  }

  /// @notice Returns the decrypted value if available
  function getDecryptedValue() external view returns (uint32, bool) {
    return (_decryptedValue, _isDecrypted);
  }

  /// @notice Returns the encrypted value
  function getEncryptedValue() external view returns (euint32) {
    return _encryptedValue;
  }
}
