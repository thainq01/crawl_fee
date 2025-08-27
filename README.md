# BSC Event Tester

A comprehensive tool for testing and monitoring the `DevGovFeeCharged` event on Binance Smart Chain (BSC) for contract `0x239B4dBf964dF383ae79c4fAE2bBD92438cEB1aD`.

## 📋 Event Details

The `DevGovFeeCharged` event has the following structure:

```solidity
event DevGovFeeCharged(
    address indexed trader,    // The trader address (indexed for filtering)
    uint256 valueUsdc,        // The USDC value (in wei, 6 decimals)
    bool isPositive           // Whether the fee is positive or negative
);
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure RPC (Optional)

The tool uses public BSC RPC endpoints by default. To use a custom RPC:

```bash
export BSC_RPC_URL="your_rpc_url_here"
export CONTRACT_ADDRESS="0x239B4dBf964dF383ae79c4fAE2bBD92438cEB1aD"
```

### 3. Run Tests

Test your setup and connection:

```bash
npm run test
```

### 4. Monitor Live Events

Listen for new events in real-time:

```bash
npm run listen
```

### 5. Query Historical Events

Search for past events:

```bash
npm run history
```

## 📖 Detailed Usage

### Live Event Monitoring

```bash
node listen-events.js
```

This will:

- Connect to BSC network
- Subscribe to new `DevGovFeeCharged` events
- Display event details in real-time
- Show formatted USDC values and BSCScan links

**Output Example:**

```
🎉 NEW EVENT DETECTED!
═══════════════════════════════════════
📦 Block: 35123456
🔗 Transaction: 0xabc123...
👤 Trader: 0x1234567890123456789012345678901234567890
💰 Value USDC: 10.500000
💰 Value USDC (raw): 10500000
📈 Is Positive: true
🔍 BSCScan: https://bscscan.com/tx/0xabc123...
═══════════════════════════════════════
```

### Historical Event Queries

```bash
# Query last 1000 blocks (default)
node query-history.js

# Query from specific block to latest
node query-history.js 35000000

# Query specific block range
node query-history.js 35000000 35001000

# Query all historical events (may be slow)
node query-history.js all
```

**Features:**

- Block range scanning
- Event summaries and statistics
- Timestamp information
- BSCScan links for each transaction

### Testing Suite

```bash
node test-events.js
```

The test suite validates:

- BSC network connection
- Contract existence and validation
- Event signature calculation
- Event filtering capabilities
- Performance across different block ranges
- Manual event decoding examples

## 🔧 Advanced Usage

### Filtering Events by Trader

Since `trader` is an indexed parameter, you can filter events for specific addresses:

```javascript
const events = await contract.getPastEvents("DevGovFeeCharged", {
  filter: { trader: "0x1234567890123456789012345678901234567890" },
  fromBlock: 35000000,
  toBlock: "latest",
});
```

### Manual Event Decoding

If you need to decode events manually from transaction logs:

```javascript
// Get transaction logs
const logs = await web3.eth.getPastLogs({
  address: contractAddress,
  topics: [web3.utils.keccak256("DevGovFeeCharged(address,uint256,bool)")],
});

// Decode each log
logs.forEach((log) => {
  // Topic[1] contains the indexed trader address
  const trader = "0x" + log.topics[1].slice(26);

  // Decode non-indexed parameters from data field
  const decoded = web3.eth.abi.decodeParameters(["uint256", "bool"], log.data);

  console.log("Trader:", trader);
  console.log("Value USDC:", decoded[0]);
  console.log("Is Positive:", decoded[1]);
});
```

### USDC Value Conversion

The `valueUsdc` parameter is in wei format but represents USDC (6 decimals):

```javascript
// Convert from wei to USDC
const usdcValue = web3.utils.fromWei(valueUsdc, "mwei"); // 'mwei' = 6 decimals

// Convert back to wei
const weiValue = web3.utils.toWei(usdcValue, "mwei");
```

## 🌐 Network Configuration

### Default RPC Endpoints

The tool uses these public BSC RPC endpoints:

- `https://bsc-dataseed1.binance.org/`
- `https://bsc-dataseed2.binance.org/`
- `https://bsc-dataseed3.binance.org/`
- `https://bsc-dataseed4.binance.org/`

### Rate Limits

Public RPC endpoints have rate limits. For heavy usage, consider:

- Using premium RPC services (Alchemy, Infura, QuickNode)
- Implementing retry logic with exponential backoff
- Reducing block range sizes for historical queries

## 🔍 Debugging

### Common Issues

1. **"No events found"**

   - Check if the contract is active
   - Verify the contract address
   - Try a larger block range

2. **"Connection failed"**

   - Check internet connection
   - Try a different RPC endpoint
   - Verify the RPC URL format

3. **"Rate limit exceeded"**
   - Use a premium RPC service
   - Reduce query frequency
   - Implement delays between requests

### Contract Verification

To verify the contract exists and is active:

```bash
# Check if contract has code
curl -X POST https://bsc-dataseed1.binance.org/ \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getCode","params":["0x239B4dBf964dF383ae79c4fAE2bBD92438cEB1aD","latest"],"id":1}'
```

### BSCScan Integration

All events include BSCScan links for detailed transaction analysis:

- Transaction details: `https://bscscan.com/tx/{transactionHash}`
- Contract page: `https://bscscan.com/address/0x239B4dBf964dF383ae79c4fAE2bBD92438cEB1aD`

## 📊 Event Analysis

### Statistics and Metrics

The historical query tool provides:

- Total event count
- Positive vs negative events
- Total USDC value processed
- Block range coverage
- Timestamp analysis

### Data Export

To save events to a file:

```bash
node query-history.js > events.log 2>&1
```

Or create a JSON export by modifying the scripts to use `JSON.stringify()`.

## 🛠 Development

### File Structure

```
test_event/
├── package.json          # Dependencies and scripts
├── config.js             # Configuration and ABI
├── listen-events.js      # Real-time event monitoring
├── query-history.js      # Historical event queries
├── test-events.js        # Testing and validation suite
└── README.md            # This documentation
```

### Adding New Features

1. **Custom Event Filters**: Modify the filter parameters in event queries
2. **Webhook Integration**: Add HTTP callbacks when events are detected
3. **Database Storage**: Store events in MongoDB/PostgreSQL
4. **Alert System**: Send notifications via email/Slack/Discord
5. **Dashboard**: Create a web interface for event monitoring

## 📜 License

MIT License - feel free to modify and use as needed.

## 🤝 Contributing

To contribute:

1. Test your changes with the test suite
2. Update documentation for new features
3. Follow the existing code style
4. Add error handling for edge cases

---

**Happy Event Monitoring! 🎉**
