# Encrypt Single Value

Working with a single encrypted value

## Contract Code

```solidity
// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Encrypt Single Value Example
/// @notice Demonstrates how to work with a single encrypted value
contract EncryptSingleValue is ZamaEthereumConfig {
  euint32 private _encryptedValue;

  /// @notice Sets an encrypted value
  /// @param encryptedInput The encrypted value to store
  function setEncryptedValue(bytes calldata encryptedInput) external {
    // Input validation would go here
    _encryptedValue = FHE.asEuint32(encryptedInput);

    // Grant permissions for further operations
    FHE.allowThis(_encryptedValue);
    FHE.allow(_encryptedValue, msg.sender);
  }

  /// @notice Retrieves the encrypted value
  /// @return The encrypted value stored in contract
  function getEncryptedValue() external view returns (euint32) {
    return _encryptedValue;
  }

  /// @notice Doubles the encrypted value using homomorphic addition
  function doubleValue() external {
    _encryptedValue = FHE.add(_encryptedValue, _encryptedValue);

    FHE.allowThis(_encryptedValue);
    FHE.allow(_encryptedValue, msg.sender);
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
