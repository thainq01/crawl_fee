const { Web3 } = require("web3");
const config = require("./config");

// Initialize Web3 with BSC RPC
const web3 = new Web3(config.BSC_RPC_URL);

// Create contract instance
const contract = new web3.eth.Contract(
  config.CONTRACT_ABI,
  config.CONTRACT_ADDRESS
);

console.log("🚀 Starting BSC Event Listener");
console.log("📋 Contract Address:", config.CONTRACT_ADDRESS);
console.log("🌐 RPC URL:", config.BSC_RPC_URL);
console.log("📡 Listening for DevGovFeeCharged events...\n");

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

// Listen for new DevGovFeeCharged events
async function startListening() {
  try {
    // Get current block number
    const currentBlock = await web3.eth.getBlockNumber();
    console.log(`📊 Current BSC block: ${currentBlock}`);
    console.log("⏳ Waiting for new events...\n");

    // Subscribe to DevGovFeeCharged events
    const subscription = contract.events.DevGovFeeCharged({
      fromBlock: config.START_BLOCK,
    });

    subscription.on("data", (event) => {
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
    });

    subscription.on("error", (error) => {
      console.error("❌ Error in event subscription:", error);
    });

    subscription.on("connected", (subscriptionId) => {
      console.log(`✅ Connected to subscription: ${subscriptionId}\n`);
    });

    // Handle graceful shutdown
    process.on("SIGINT", () => {
      console.log("\n🛑 Shutting down event listener...");
      subscription.unsubscribe();
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Error starting event listener:", error);
    process.exit(1);
  }
}

// Start the event listener
startListening();
