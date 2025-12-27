# Blind Auction

Sealed-bid auction with encrypted bids

## Contract Code

```solidity
// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, ebool, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Blind Auction Example
/// @notice Demonstrates a sealed-bid auction with encrypted bids
/// @dev Bids remain encrypted during bidding; winner is determined on encrypted data
contract BlindAuction is ZamaEthereumConfig {
  address public auctioneer;
  uint256 public auctionEndTime;

  struct Bid {
    euint32 encryptedAmount;
    address bidder;
    uint256 bidTime;
  }

  Bid[] public bids;
  mapping(address => uint256) public bidIndices;

  uint256 public highestBidIndex;
  address public highestBidder;
  uint32 public winningBidAmount;
  bool public auctionEnded;

  event BidPlaced(address indexed bidder, uint256 timestamp);
  event AuctionEnded(address indexed winner, uint32 amount);

  constructor(uint256 biddingDurationSeconds) {
    auctioneer = msg.sender;
    auctionEndTime = block.timestamp + biddingDurationSeconds;
  }

  /// @notice Place an encrypted bid
  /// @dev Bid amount remains encrypted until auction ends
  function placeBid(externalEuint32 encryptedBidAmount, bytes calldata proof) external {
    require(block.timestamp < auctionEndTime, "Auction has ended");

    euint32 bid = FHE.fromExternal(encryptedBidAmount, proof);

    FHE.allowThis(bid);
    FHE.allow(bid, msg.sender);

    // Store encrypted bid
    bids.push(Bid({encryptedAmount: bid, bidder: msg.sender, bidTime: block.timestamp}));

    bidIndices[msg.sender] = bids.length - 1;

    emit BidPlaced(msg.sender, block.timestamp);
  }

  /// @notice Compare two bids homomorphically
  /// @dev Returns encrypted boolean for bid comparison
  function isBidHigher(uint256 bidIndex1, uint256 bidIndex2) external returns (ebool) {
    require(bidIndex1 < bids.length && bidIndex2 < bids.length, "Invalid bid index");

    euint32 bid1 = bids[bidIndex1].encryptedAmount;
    euint32 bid2 = bids[bidIndex2].encryptedAmount;

    // Compare encrypted values - result is encrypted
    ebool isHigher = FHE.lt(bid2, bid1);  // bid1 > bid2

    FHE.allowThis(isHigher);
    FHE.allow(isHigher, msg.sender);

    return isHigher;
  }

  /// @notice Request decryption of the highest bid
  /// @dev Initiates asynchronous decryption process
  function requestHighestBidDecryption() external {
    require(msg.sender == auctioneer, "Only auctioneer");
    require(block.timestamp >= auctionEndTime, "Auction not ended");
    require(!auctionEnded, "Already ended");
    require(bids.length > 0, "No bids");

    // Request decryption of all bids to find winner
    bytes32[] memory cts = new bytes32[](bids.length);

    for (uint256 i = 0; i < bids.length; i++) {
      cts[i] = FHE.toBytes32(bids[i].encryptedAmount);
    }

    // Request decryption with callback to processAuction
    FHE.requestDecryption(cts, this.processAuction.selector);
  }

  /// @notice Callback to process decrypted bids and determine winner
  function processAuction(
    uint256 requestId,
    uint32[] calldata decryptedBids,
    bytes[] calldata signatures
  ) external {
    require(decryptedBids.length == bids.length, "Decryption mismatch");

    // Find highest bid
    uint32 maxBid = 0;
    uint256 winnerIndex = 0;

    for (uint256 i = 0; i < decryptedBids.length; i++) {
      if (decryptedBids[i] > maxBid) {
        maxBid = decryptedBids[i];
        winnerIndex = i;
      }
    }

    highestBidIndex = winnerIndex;
    highestBidder = bids[winnerIndex].bidder;
    winningBidAmount = maxBid;
    auctionEnded = true;

    emit AuctionEnded(highestBidder, maxBid);
  }

  /// @notice Get number of bids
  function getBidCount() external view returns (uint256) {
    return bids.length;
  }

  /// @notice Get encrypted bid for a specific index
  function getEncryptedBid(uint256 index) external view returns (euint32) {
    require(index < bids.length, "Invalid index");
    return bids[index].encryptedAmount;
  }

  /// @notice Get auction results (only after auction ends)
  function getResults()
    external
    view
    returns (address winner, uint32 winningAmount, bool ended)
  {
    return (highestBidder, winningBidAmount, auctionEnded);
  }

  /// @notice Check if auction is still active
  function isAuctionActive() external view returns (bool) {
    return block.timestamp < auctionEndTime && !auctionEnded;
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

Category: **Advanced Examples**
