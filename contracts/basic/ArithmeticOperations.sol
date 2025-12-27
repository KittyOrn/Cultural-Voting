// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title FHE Arithmetic Operations
/// @notice Demonstrates basic arithmetic operations on encrypted integers
contract ArithmeticOperations is ZamaEthereumConfig {
  euint32 private _result;

  /// @notice Performs addition of two encrypted values
  function add(
    externalEuint32 a,
    bytes calldata aProof,
    externalEuint32 b,
    bytes calldata bProof
  ) external {
    euint32 encryptedA = FHE.fromExternal(a, aProof);
    euint32 encryptedB = FHE.fromExternal(b, bProof);

    _result = FHE.add(encryptedA, encryptedB);

    FHE.allowThis(_result);
    FHE.allow(_result, msg.sender);
  }

  /// @notice Performs subtraction of two encrypted values
  function subtract(
    externalEuint32 a,
    bytes calldata aProof,
    externalEuint32 b,
    bytes calldata bProof
  ) external {
    euint32 encryptedA = FHE.fromExternal(a, aProof);
    euint32 encryptedB = FHE.fromExternal(b, bProof);

    _result = FHE.sub(encryptedA, encryptedB);

    FHE.allowThis(_result);
    FHE.allow(_result, msg.sender);
  }

  /// @notice Performs multiplication of two encrypted values
  function multiply(
    externalEuint32 a,
    bytes calldata aProof,
    externalEuint32 b,
    bytes calldata bProof
  ) external {
    euint32 encryptedA = FHE.fromExternal(a, aProof);
    euint32 encryptedB = FHE.fromExternal(b, bProof);

    _result = FHE.mul(encryptedA, encryptedB);

    FHE.allowThis(_result);
    FHE.allow(_result, msg.sender);
  }

  /// @notice Retrieves the result of the last operation
  function getResult() external view returns (euint32) {
    return _result;
  }
}
