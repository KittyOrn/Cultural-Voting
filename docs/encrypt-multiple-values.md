# Encrypt Multiple Values

Handling multiple encrypted values

## Contract Code

```solidity
// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, euint8, euint16 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Encrypt Multiple Values Example
/// @notice Demonstrates handling multiple encrypted values of different types
contract EncryptMultipleValues is ZamaEthereumConfig {
  // Different encrypted types
  euint8 private _age;
  euint16 private _score;
  euint32 private _balance;

  /// @notice Sets multiple encrypted values in one transaction
  function setMultipleValues(
    bytes calldata encryptedAge,
    bytes calldata encryptedScore,
    bytes calldata encryptedBalance
  ) external {
    // Convert from bytes to encrypted types
    _age = FHE.asEuint8(encryptedAge);
    _score = FHE.asEuint16(encryptedScore);
    _balance = FHE.asEuint32(encryptedBalance);

    // Grant permissions for all values
    FHE.allowThis(_age);
    FHE.allow(_age, msg.sender);

    FHE.allowThis(_score);
    FHE.allow(_score, msg.sender);

    FHE.allowThis(_balance);
    FHE.allow(_balance, msg.sender);
  }

  /// @notice Updates age value
  function updateAge(bytes calldata encryptedAge) external {
    _age = FHE.asEuint8(encryptedAge);

    FHE.allowThis(_age);
    FHE.allow(_age, msg.sender);
  }

  /// @notice Updates score value
  function updateScore(bytes calldata encryptedScore) external {
    _score = FHE.asEuint16(encryptedScore);

    FHE.allowThis(_score);
    FHE.allow(_score, msg.sender);
  }

  /// @notice Updates balance value
  function updateBalance(bytes calldata encryptedBalance) external {
    _balance = FHE.asEuint32(encryptedBalance);

    FHE.allowThis(_balance);
    FHE.allow(_balance, msg.sender);
  }

  /// @notice Gets all encrypted values
  function getAllValues() external view returns (euint8, euint16, euint32) {
    return (_age, _score, _balance);
  }

  /// @notice Gets age value
  function getAge() external view returns (euint8) {
    return _age;
  }

  /// @notice Gets score value
  function getScore() external view returns (euint16) {
    return _score;
  }

  /// @notice Gets balance value
  function getBalance() external view returns (euint32) {
    return _balance;
  }
}

```

## Test Code

```typescript

```

## Key Concepts

### FHE Operations
This example demonstrates the use of Fully Homomorphic Encryption (FHE) in smart contracts.

### Important Patterns
- Encrypted input handling with `FHE.fromExternal()`
- Permission management with `FHE.allowThis()` and `FHE.allow()`
- Homomorphic operations on encrypted data

## Running the Example

### Install Dependencies
```bash
npm install
```

### Compile
```bash
npm run compile
```

### Test
```bash
npm run test
```

### Deploy
```bash
npx hardhat deploy --network localhost
```

## Resources
- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Zama Examples](https://docs.zama.org/protocol/examples)

---

Category: **Encryption Examples**
