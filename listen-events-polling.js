const { Web3 } = require("web3");
const config = require("./config");

// Initialize Web3 with BSC RPC
const web3 = new Web3(config.BSC_RPC_URL);

// Create contract instance
const contract = new web3.eth.Contract(
  config.CONTRACT_ABI,
  config.CONTRACT_ADDRESS
);

console.log("🚀 Starting BSC Event Listener (Polling Mode)");
console.log("📋 Contract Address:", config.CONTRACT_ADDRESS);
console.log("🌐 RPC URL:", config.BSC_RPC_URL);
console.log("📡 Polling for DevGovFeeCharged events...\n");

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

// Polling-based event monitoring
async function startPolling() {
  try {
    // Get current block number
    let currentBlock = await web3.eth.getBlockNumber();
    let lastCheckedBlock = BigInt(config.START_BLOCK);
    
    console.log(`📊 Current BSC block: ${currentBlock}`);
    console.log(`📅 Starting from block: ${lastCheckedBlock}`);
    console.log("⏳ Polling for new events every 10 seconds...\n");

    // Store processed events to avoid duplicates
    const processedEvents = new Set();

    const pollInterval = setInterval(async () => {
      try {
        const latestBlock = await web3.eth.getBlockNumber();
        
        if (latestBlock > lastCheckedBlock) {
          console.log(`🔄 Checking blocks ${lastCheckedBlock + BigInt(1)} to ${latestBlock}`);
          
          // Query events in chunks to avoid block range limits
          const chunkSize = 10000; // Safe chunk size
          let fromBlock = lastCheckedBlock + BigInt(1);
          
          while (fromBlock <= latestBlock) {
            const toBlock = fromBlock + BigInt(chunkSize) - BigInt(1) > latestBlock 
              ? latestBlock 
              : fromBlock + BigInt(chunkSize) - BigInt(1);
            
            try {
              const events = await contract.getPastEvents("DevGovFeeCharged", {
                fromBlock: fromBlock.toString(),
                toBlock: toBlock.toString(),
              });

              for (const event of events) {
                const eventId = `${event.transactionHash}-${event.logIndex}`;
                
                if (!processedEvents.has(eventId)) {
                  processedEvents.add(eventId);
                  
                  console.log("🎉 NEW EVENT DETECTED!");
                  console.log("═══════════════════════════════════════");
                  
                  const formattedData = formatEventData(event);
                  
                  console.log(`📦 Block: ${formattedData.blockNumber}`);
                  console.log(`🔗 Transaction: ${formattedData.transactionHash}`);
                  console.log(`👤 Trader: ${formattedData.trader}`);
                  console.log(`💰 Value USDC: ${formattedData.valueUsdc}`);
                  console.log(`💰 Value USDC (raw): ${formattedData.valueUsdcRaw}`);
                  console.log(`📈 Is Positive: ${formattedData.isPositive}`);
                  console.log(`🔍 BSCScan: ${formattedData.bscscanUrl}`);
                  console.log("═══════════════════════════════════════\n");
                }
              }
            } catch (error) {
              console.error(`❌ Error querying blocks ${fromBlock}-${toBlock}:`, error.message);
            }
            
            fromBlock = toBlock + BigInt(1);
          }
          
          lastCheckedBlock = latestBlock;
        }
      } catch (error) {
        console.error("❌ Error during polling:", error.message);
      }
    }, 10000); // Poll every 10 seconds

    // Handle graceful shutdown
    process.on("SIGINT", () => {
      console.log("\n🛑 Shutting down event listener...");
      clearInterval(pollInterval);
      process.exit(0);
    });

  } catch (error) {
    console.error("❌ Error starting event listener:", error);
    process.exit(1);
  }
}

// Start the event listener
startPolling();
