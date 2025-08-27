const { Web3 } = require("web3");
const config = require("./config");

// Initialize Web3 with BSC RPC
const web3 = new Web3(config.BSC_RPC_URL);

// Create contract instance
const contract = new web3.eth.Contract(
  config.CONTRACT_ABI,
  config.CONTRACT_ADDRESS
);

// Function to format event data nicely
function formatEventData(event) {
  const { trader, valueUsdc, isPositive } = event.returnValues;
  const blockNumber = event.blockNumber;
  const transactionHash = event.transactionHash;
  const logIndex = event.logIndex;

  return {
    blockNumber,
    transactionHash,
    logIndex,
    trader,
    valueUsdc: web3.utils.fromWei(valueUsdc, "mwei"), // Convert from wei to USDC (6 decimals)
    valueUsdcRaw: valueUsdc,
    isPositive,
    bscscanUrl: `https://bscscan.com/tx/${transactionHash}`,
  };
}

// Function to get block timestamp
async function getBlockTimestamp(blockNumber) {
  try {
    const block = await web3.eth.getBlock(blockNumber);
    return new Date(Number(block.timestamp) * 1000).toISOString();
  } catch (error) {
    return "Unknown";
  }
}

// Query historical events
async function queryHistoricalEvents() {
  try {
    console.log("🔍 Querying Historical DevGovFeeCharged Events");
    console.log("📋 Contract Address:", config.CONTRACT_ADDRESS);
    console.log("🌐 RPC URL:", config.BSC_RPC_URL);

    // Get current block number
    const currentBlock = await web3.eth.getBlockNumber();
    console.log(`📊 Current BSC block: ${currentBlock}\n`);

    // Parse command line arguments for block range
    const args = process.argv.slice(2);
    let fromBlock = BigInt(config.START_BLOCK); // Default: use config START_BLOCK
    let toBlock = currentBlock;

    if (args.length >= 1) {
      if (args[0] === "all") {
        fromBlock = BigInt(0);
      } else if (!isNaN(args[0])) {
        fromBlock = BigInt(args[0]);
      }
    }

    if (args.length >= 2 && !isNaN(args[1])) {
      toBlock = BigInt(args[1]);
    }

    console.log(`📅 Searching from block ${fromBlock} to ${toBlock}`);
    console.log(`📊 Scanning ${toBlock - fromBlock + BigInt(1)} blocks...\n`);

    // Query events in chunks to avoid block range limits
    const chunkSize = 10000; // Safe chunk size for most RPC providers
    let allEvents = [];
    let currentFromBlock = fromBlock;

    while (currentFromBlock <= toBlock) {
      const currentToBlock =
        currentFromBlock + BigInt(chunkSize) - BigInt(1) > toBlock
          ? toBlock
          : currentFromBlock + BigInt(chunkSize) - BigInt(1);

      console.log(
        `🔄 Querying chunk: blocks ${currentFromBlock} to ${currentToBlock}`
      );

      try {
        const chunkEvents = await contract.getPastEvents("DevGovFeeCharged", {
          fromBlock: currentFromBlock.toString(),
          toBlock: currentToBlock.toString(),
        });

        allEvents = allEvents.concat(chunkEvents);
        console.log(`   ✅ Found ${chunkEvents.length} events in this chunk`);

        // Add delay between chunks to avoid rate limiting
        if (currentToBlock < toBlock) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(
          `❌ Error querying chunk ${currentFromBlock}-${currentToBlock}:`,
          error.message
        );

        if (error.message.includes("exceed maximum block range")) {
          console.log(`⚠️  Chunk too large, retrying with smaller size...`);
          // Retry with smaller chunk
          const smallerChunkSize = 1000;
          let retryFromBlock = currentFromBlock;

          while (retryFromBlock <= currentToBlock) {
            const retryToBlock =
              retryFromBlock + BigInt(smallerChunkSize) - BigInt(1) >
              currentToBlock
                ? currentToBlock
                : retryFromBlock + BigInt(smallerChunkSize) - BigInt(1);

            try {
              const retryEvents = await contract.getPastEvents(
                "DevGovFeeCharged",
                {
                  fromBlock: retryFromBlock.toString(),
                  toBlock: retryToBlock.toString(),
                }
              );

              allEvents = allEvents.concat(retryEvents);
              await new Promise((resolve) => setTimeout(resolve, 200));
            } catch (retryError) {
              console.error(
                `❌ Retry failed for ${retryFromBlock}-${retryToBlock}:`,
                retryError.message
              );
            }

            retryFromBlock = retryToBlock + BigInt(1);
          }
        }
      }

      currentFromBlock = currentToBlock + BigInt(1);
    }

    const events = allEvents;

    console.log(`✅ Found ${events.length} DevGovFeeCharged events\n`);

    if (events.length === 0) {
      console.log("ℹ️  No events found in the specified block range.");
      console.log(
        "💡 Try expanding the block range or check if the contract has been active."
      );
      return;
    }

    // Display events
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const formattedData = formatEventData(event);
      const timestamp = await getBlockTimestamp(event.blockNumber);

      console.log(`🎯 Event ${i + 1}/${events.length}`);
      console.log("═══════════════════════════════════════");
      console.log(`📦 Block: ${formattedData.blockNumber}`);
      console.log(`⏰ Timestamp: ${timestamp}`);
      console.log(`🔗 Transaction: ${formattedData.transactionHash}`);
      console.log(`📋 Log Index: ${formattedData.logIndex}`);
      console.log(`👤 Trader: ${formattedData.trader}`);
      console.log(`💰 Value USDC: ${formattedData.valueUsdc}`);
      console.log(`💰 Value USDC (raw): ${formattedData.valueUsdcRaw}`);
      console.log(`📈 Is Positive: ${formattedData.isPositive}`);
      console.log(`🔍 BSCScan: ${formattedData.bscscanUrl}`);
      console.log("═══════════════════════════════════════\n");
    }

    // Summary statistics
    const totalValue = events.reduce((sum, event) => {
      const value = parseFloat(
        web3.utils.fromWei(event.returnValues.valueUsdc, "mwei")
      );
      return sum + value;
    }, 0);

    const positiveEvents = events.filter(
      (event) => event.returnValues.isPositive
    ).length;
    const negativeEvents = events.length - positiveEvents;

    console.log("📊 SUMMARY STATISTICS");
    console.log("═══════════════════════════════════════");
    console.log(`📈 Total Events: ${events.length}`);
    console.log(`✅ Positive Events: ${positiveEvents}`);
    console.log(`❌ Negative Events: ${negativeEvents}`);
    console.log(`💰 Total Value: ${totalValue.toFixed(6)} USDC`);
    console.log("═══════════════════════════════════════");
  } catch (error) {
    console.error("❌ Error querying historical events:", error);

    if (error.message.includes("exceed maximum block range")) {
      console.log(
        "\n💡 Tip: Try reducing the block range or use a premium RPC endpoint."
      );
    }

    process.exit(1);
  }
}

// Display usage information
function showUsage() {
  console.log("📖 USAGE:");
  console.log("node query-history.js [fromBlock] [toBlock]");
  console.log("");
  console.log("Examples:");
  console.log("  node query-history.js                    # Last 1000 blocks");
  console.log(
    "  node query-history.js all                # All blocks (may be slow)"
  );
  console.log(
    "  node query-history.js 35000000           # From block 35000000 to latest"
  );
  console.log(
    "  node query-history.js 35000000 35001000  # From block 35000000 to 35001000"
  );
  console.log("");
}

// Check if help is requested
if (process.argv.includes("--help") || process.argv.includes("-h")) {
  showUsage();
  process.exit(0);
}

// Start the historical query
queryHistoricalEvents();
