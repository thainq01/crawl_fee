const { Web3 } = require("web3");
const config = require("./config");

// Initialize Web3 with BSC RPC
const web3 = new Web3(config.BSC_RPC_URL);

// Create contract instance
const contract = new web3.eth.Contract(
  config.CONTRACT_ABI,
  config.CONTRACT_ADDRESS
);

// Test event signature and topics
function testEventSignature() {
  console.log("🧪 Testing Event Signature and Topics");
  console.log("═══════════════════════════════════════");

  // Calculate event signature
  const eventSignature = web3.utils.keccak256(
    "DevGovFeeCharged(address,uint256,bool)"
  );
  console.log(`📝 Event Signature: ${eventSignature}`);

  // Event topics structure
  console.log("\n📋 Event Topics Structure:");
  console.log("  Topic[0]: Event signature (always present)");
  console.log("  Topic[1]: trader (indexed address)");
  console.log("  Topic[2]: Not used (valueUsdc is not indexed)");
  console.log("  Topic[3]: Not used (isPositive is not indexed)");

  console.log(
    "\n💡 Non-indexed parameters (valueUsdc, isPositive) are in the data field"
  );
  console.log("═══════════════════════════════════════\n");
}

// Test manual event decoding
function testEventDecoding() {
  console.log("🔧 Testing Manual Event Decoding");
  console.log("═══════════════════════════════════════");

  // Example event data (you would get this from actual events)
  console.log("📝 Example of how to manually decode event data:");
  console.log("");

  const exampleCode = `
// Assuming you have event logs from a transaction
const eventLogs = await web3.eth.getPastLogs({
  address: '${config.CONTRACT_ADDRESS}',
  topics: ['${web3.utils.keccak256("DevGovFeeCharged(address,uint256,bool)")}']
});

// Decode the event manually
eventLogs.forEach((log, index) => {
  console.log(\`Event \${index + 1}:\`);
  console.log('Topics:', log.topics);
  console.log('Data:', log.data);
  
  // Topic[1] is the indexed trader address
  const trader = '0x' + log.topics[1].slice(26); // Remove padding
  
  // Decode data field (valueUsdc and isPositive)
  const decodedData = web3.eth.abi.decodeParameters(
    ['uint256', 'bool'],
    log.data
  );
  
  console.log('Decoded trader:', trader);
  console.log('Decoded valueUsdc:', decodedData[0]);
  console.log('Decoded isPositive:', decodedData[1]);
});`;

  console.log(exampleCode);
  console.log("═══════════════════════════════════════\n");
}

// Test connection and contract
async function testConnection() {
  console.log("🌐 Testing BSC Connection");
  console.log("═══════════════════════════════════════");

  try {
    // Test connection
    const currentBlock = await web3.eth.getBlockNumber();
    console.log(`✅ Connected to BSC`);
    console.log(`📦 Current Block: ${currentBlock}`);

    // Test contract
    console.log(`📋 Contract Address: ${config.CONTRACT_ADDRESS}`);

    // Try to get contract code to verify it exists
    const code = await web3.eth.getCode(config.CONTRACT_ADDRESS);
    if (code === "0x") {
      console.log("⚠️  Warning: No contract code found at this address");
      console.log(
        "   This might be an EOA (Externally Owned Account) or the contract might not exist"
      );
    } else {
      console.log("✅ Contract code found - address is valid");
      console.log(`📏 Contract code size: ${(code.length - 2) / 2} bytes`);
    }
  } catch (error) {
    console.error("❌ Connection test failed:", error.message);
    return false;
  }

  console.log("═══════════════════════════════════════\n");
  return true;
}

// Test event filtering
async function testEventFiltering() {
  console.log("🔍 Testing Event Filtering");
  console.log("═══════════════════════════════════════");

  try {
    const currentBlock = await web3.eth.getBlockNumber();
    const fromBlock = currentBlock - BigInt(100); // Last 100 blocks

    console.log(
      `📅 Testing event query from block ${fromBlock} to ${currentBlock}`
    );

    // Test basic event query
    const events = await contract.getPastEvents("DevGovFeeCharged", {
      fromBlock: fromBlock.toString(),
      toBlock: "latest",
    });

    console.log(`📊 Found ${events.length} events in last 100 blocks`);

    if (events.length > 0) {
      console.log(`🎯 First event details:`);
      const firstEvent = events[0];
      console.log(`   Block: ${firstEvent.blockNumber}`);
      console.log(`   Transaction: ${firstEvent.transactionHash}`);
      console.log(`   Trader: ${firstEvent.returnValues.trader}`);
      console.log(
        `   Value USDC: ${web3.utils.fromWei(
          firstEvent.returnValues.valueUsdc,
          "mwei"
        )}`
      );
      console.log(`   Is Positive: ${firstEvent.returnValues.isPositive}`);
    }

    // Test filtering by trader (indexed parameter)
    console.log("\n🎯 Testing filter by trader address:");
    const exampleTrader = "0x1234567890123456789012345678901234567890";
    console.log(`   Example: Filter events for trader ${exampleTrader}`);

    const filteredEvents = await contract.getPastEvents("DevGovFeeCharged", {
      filter: { trader: exampleTrader },
      fromBlock: fromBlock.toString(),
      toBlock: "latest",
    });

    console.log(
      `   Result: ${filteredEvents.length} events found for this trader`
    );
  } catch (error) {
    console.error("❌ Event filtering test failed:", error.message);
  }

  console.log("═══════════════════════════════════════\n");
}

// Performance testing
async function testPerformance() {
  console.log("⚡ Performance Testing");
  console.log("═══════════════════════════════════════");

  try {
    const currentBlock = await web3.eth.getBlockNumber();

    // Test different block ranges
    const ranges = [10, 100, 1000];

    for (const range of ranges) {
      const fromBlock = currentBlock - BigInt(range);
      const startTime = Date.now();

      const events = await contract.getPastEvents("DevGovFeeCharged", {
        fromBlock: fromBlock.toString(),
        toBlock: "latest",
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(
        `📊 Range ${range} blocks: ${events.length} events found in ${duration}ms`
      );
    }
  } catch (error) {
    console.error("❌ Performance test failed:", error.message);
  }

  console.log("═══════════════════════════════════════\n");
}

// Main test function
async function runTests() {
  console.log("🧪 BSC Event Testing Suite");
  console.log("📋 Contract:", config.CONTRACT_ADDRESS);
  console.log("🌐 RPC:", config.BSC_RPC_URL);
  console.log("═══════════════════════════════════════\n");

  // Run all tests
  testEventSignature();
  testEventDecoding();

  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.log("❌ Connection failed - skipping remaining tests");
    return;
  }

  await testEventFiltering();
  await testPerformance();

  console.log("✅ All tests completed!");
  console.log("\n💡 Next steps:");
  console.log('   - Run "npm run listen" to monitor live events');
  console.log('   - Run "npm run history" to query historical events');
  console.log("   - Check BSCScan for recent contract activity");
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  console.log("📖 USAGE:");
  console.log("node test-events.js");
  console.log("");
  console.log(
    "This script runs various tests to validate event monitoring setup."
  );
  process.exit(0);
}

// Run the tests
runTests().catch((error) => {
  console.error("❌ Test suite failed:", error);
  process.exit(1);
});
