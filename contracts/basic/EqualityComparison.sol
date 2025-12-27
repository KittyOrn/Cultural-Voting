// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, ebool, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Equality Comparison Example
/// @notice Demonstrates FHE equality comparison operations
contract EqualityComparison is ZamaEthereumConfig {
  euint32 private _secretValue;
  ebool private _comparisonResult;

  /// @notice Sets a secret value for comparison
  function setSecretValue(externalEuint32 inputValue, bytes calldata inputProof) external {
    _secretValue = FHE.fromExternal(inputValue, inputProof);

    FHE.allowThis(_secretValue);
    FHE.allow(_secretValue, msg.sender);
  }

  /// @notice Compares two encrypted values for equality
  /// @return The encrypted boolean result
  function compareEqual(
    externalEuint32 valueA,
    bytes calldata proofA,
    externalEuint32 valueB,
    bytes calldata proofB
  ) external returns (ebool) {
    euint32 encryptedA = FHE.fromExternal(valueA, proofA);
    euint32 encryptedB = FHE.fromExternal(valueB, proofB);

    // FHE.eq returns an encrypted boolean
    _comparisonResult = FHE.eq(encryptedA, encryptedB);

    FHE.allowThis(_comparisonResult);
    FHE.allow(_comparisonResult, msg.sender);

    return _comparisonResult;
  }

  /// @notice Checks if input equals the secret value
  function checkIfEqual(externalEuint32 inputValue, bytes calldata inputProof) external returns (ebool) {
    euint32 encryptedInput = FHE.fromExternal(inputValue, inputProof);

    _comparisonResult = FHE.eq(encryptedInput, _secretValue);

    FHE.allowThis(_comparisonResult);
    FHE.allow(_comparisonResult, msg.sender);

    return _comparisonResult;
  }

  /// @notice Gets the last comparison result
  function getComparisonResult() external view returns (ebool) {
    return _comparisonResult;
  }
}
