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
console.log("📡 Listening for DevGovFeeCharged and MarketExecuted events...\n");

// Function to format DevGovFeeCharged event data
function formatDevGovFeeEventData(event) {
  const { trader, valueUsdc, isPositive } = event.returnValues;
  const blockNumber = event.blockNumber;
  const transactionHash = event.transactionHash;
  const logIndex = event.logIndex;

  return {
    eventType: "DevGovFeeCharged",
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

// Function to format MarketExecuted event data
function formatMarketExecutedEventData(event) {
  const { orderId, t, open, price, priceImpactP, positionSizeUsdc, percentProfit, usdcSentToTrader } = event.returnValues;
  const blockNumber = event.blockNumber;
  const transactionHash = event.transactionHash;
  const logIndex = event.logIndex;

  return {
    eventType: "MarketExecuted",
    blockNumber,
    transactionHash,
    logIndex,
    orderId,
    trade: {
      trader: t.trader,
      pairIndex: t.pairIndex,
      index: t.index,
      initialPosToken: web3.utils.fromWei(t.initialPosToken, "ether"),
      initialPosTokenRaw: t.initialPosToken,
      positionSizeUsdc: web3.utils.fromWei(t.positionSizeUsdc, "mwei"),
      positionSizeUsdcRaw: t.positionSizeUsdc,
      openPrice: web3.utils.fromWei(t.openPrice, "ether"),
      openPriceRaw: t.openPrice,
      buy: t.buy,
      leverage: t.leverage,
      tp: web3.utils.fromWei(t.tp, "ether"),
      tpRaw: t.tp,
      sl: web3.utils.fromWei(t.sl, "ether"),
      slRaw: t.sl
    },
    open,
    price: web3.utils.fromWei(price, "ether"),
    priceRaw: price,
    priceImpactP: web3.utils.fromWei(priceImpactP, "ether"),
    priceImpactPRaw: priceImpactP,
    positionSizeUsdc: web3.utils.fromWei(positionSizeUsdc, "mwei"),
    positionSizeUsdcRaw: positionSizeUsdc,
    percentProfit: percentProfit.toString(),
    usdcSentToTrader: web3.utils.fromWei(usdcSentToTrader, "mwei"),
    usdcSentToTraderRaw: usdcSentToTrader,
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
    const devGovFeeSubscription = contract.events.DevGovFeeCharged({
      fromBlock: config.START_BLOCK,
    });

    devGovFeeSubscription.on("data", (event) => {
      console.log("🎉 NEW DEV GOV FEE EVENT DETECTED!");
      console.log("═══════════════════════════════════════");

      const formattedData = formatDevGovFeeEventData(event);

      console.log(`📦 Block: ${formattedData.blockNumber}`);
      console.log(`🔗 Transaction: ${formattedData.transactionHash}`);
      console.log(`👤 Trader: ${formattedData.trader}`);
      console.log(`💰 Value USDC: ${formattedData.valueUsdc}`);
      console.log(`💰 Value USDC (raw): ${formattedData.valueUsdcRaw}`);
      console.log(`📈 Is Positive: ${formattedData.isPositive}`);
      console.log(`🔍 BSCScan: ${formattedData.bscscanUrl}`);
      console.log("═══════════════════════════════════════\n");
    });

    // Subscribe to MarketExecuted events
    const marketExecutedSubscription = contract.events.MarketExecuted({
      fromBlock: config.START_BLOCK,
    });

    marketExecutedSubscription.on("data", (event) => {
      console.log("🚀 NEW MARKET EXECUTED EVENT DETECTED!");
      console.log("═══════════════════════════════════════");

      const formattedData = formatMarketExecutedEventData(event);

      console.log(`📦 Block: ${formattedData.blockNumber}`);
      console.log(`🔗 Transaction: ${formattedData.transactionHash}`);
      console.log(`🆔 Order ID: ${formattedData.orderId}`);
      console.log(`👤 Trader: ${formattedData.trade.trader}`);
      console.log(`📈 Pair Index: ${formattedData.trade.pairIndex}`);
      console.log(`📊 Position Index: ${formattedData.trade.index}`);
      console.log(`💰 Position Size USDC: ${formattedData.positionSizeUsdc}`);
      console.log(`📊 Open Price: ${formattedData.trade.openPrice}`);
      console.log(`🔄 Buy: ${formattedData.trade.buy}`);
      console.log(`⚡ Leverage: ${formattedData.trade.leverage}`);
      console.log(`🎯 Take Profit: ${formattedData.trade.tp}`);
      console.log(`🛑 Stop Loss: ${formattedData.trade.sl}`);
      console.log(`🔓 Open: ${formattedData.open}`);
      console.log(`💵 Execution Price: ${formattedData.price}`);
      console.log(`📊 Price Impact P: ${formattedData.priceImpactP}`);
      console.log(`📊 Percent Profit: ${formattedData.percentProfit}`);
      console.log(`💰 USDC Sent to Trader: ${formattedData.usdcSentToTrader}`);
      console.log(`🔍 BSCScan: ${formattedData.bscscanUrl}`);
      console.log("═══════════════════════════════════════\n");
    });

    devGovFeeSubscription.on("error", (error) => {
      console.error("❌ Error in DevGovFeeCharged subscription:", error);
    });

    devGovFeeSubscription.on("connected", (subscriptionId) => {
      console.log(`✅ Connected to DevGovFeeCharged subscription: ${subscriptionId}`);
    });

    marketExecutedSubscription.on("error", (error) => {
      console.error("❌ Error in MarketExecuted subscription:", error);
    });

    marketExecutedSubscription.on("connected", (subscriptionId) => {
      console.log(`✅ Connected to MarketExecuted subscription: ${subscriptionId}\n`);
    });

    // Handle graceful shutdown
    process.on("SIGINT", () => {
      console.log("\n🛑 Shutting down event listeners...");
      devGovFeeSubscription.unsubscribe();
      marketExecutedSubscription.unsubscribe();
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Error starting event listener:", error);
    process.exit(1);
  }
}

// Start the event listener
startListening();
