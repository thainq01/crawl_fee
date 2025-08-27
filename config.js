// Configuration for BSC event testing
module.exports = {
  // BSC RPC URL - you can use public endpoints or your own
  BSC_RPC_URL:
    process.env.BSC_RPC_URL ||
    "https://stylish-capable-tent.bsc.quiknode.pro/577ad151d9504f0ac0f3f4f636509201b1beb4b1",

  // Contract address to monitor
  CONTRACT_ADDRESS:
    process.env.CONTRACT_ADDRESS ||
    "0x239B4dBf964dF383ae79c4fAE2bBD92438cEB1aD",

  // Event ABIs
  DEV_GOV_FEE_EVENT_ABI: {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "trader",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "valueUsdc",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isPositive",
        type: "bool",
      },
    ],
    name: "DevGovFeeCharged",
    type: "event",
  },

  MARKET_EXECUTED_EVENT_ABI: {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "orderId",
        type: "uint256"
      },
      {
        components: [
          {
            internalType: "address",
            name: "trader",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "pairIndex",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "index",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "initialPosToken",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "positionSizeUsdc",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "openPrice",
            type: "uint256"
          },
          {
            internalType: "bool",
            name: "buy",
            type: "bool"
          },
          {
            internalType: "uint256",
            name: "leverage",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "tp",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "sl",
            type: "uint256"
          }
        ],
        indexed: false,
        internalType: "struct StorageInterfaceV5.Trade",
        name: "t",
        type: "tuple"
      },
      {
        indexed: false,
        internalType: "bool",
        name: "open",
        type: "bool"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "price",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "priceImpactP",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "positionSizeUsdc",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "int256",
        name: "percentProfit",
        type: "int256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "usdcSentToTrader",
        type: "uint256"
      }
    ],
    name: "MarketExecuted",
    type: "event",
  },

  // Contract ABI (minimal - both events)
  CONTRACT_ABI: [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "trader",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "valueUsdc",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "isPositive",
          type: "bool",
        },
      ],
      name: "DevGovFeeCharged",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "orderId",
          type: "uint256"
        },
        {
          components: [
            {
              internalType: "address",
              name: "trader",
              type: "address"
            },
            {
              internalType: "uint256",
              name: "pairIndex",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "index",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "initialPosToken",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "positionSizeUsdc",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "openPrice",
              type: "uint256"
            },
            {
              internalType: "bool",
              name: "buy",
              type: "bool"
            },
            {
              internalType: "uint256",
              name: "leverage",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "tp",
              type: "uint256"
            },
            {
              internalType: "uint256",
              name: "sl",
              type: "uint256"
            }
          ],
          indexed: false,
          internalType: "struct StorageInterfaceV5.Trade",
          name: "t",
          type: "tuple"
        },
        {
          indexed: false,
          internalType: "bool",
          name: "open",
          type: "bool"
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "price",
          type: "uint256"
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "priceImpactP",
          type: "uint256"
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "positionSizeUsdc",
          type: "uint256"
        },
        {
          indexed: false,
          internalType: "int256",
          name: "percentProfit",
          type: "int256"
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "usdcSentToTrader",
          type: "uint256"
        }
      ],
      name: "MarketExecuted",
      type: "event",
    },
  ],

  // Block range settings
  START_BLOCK: process.env.START_BLOCK || "58941918",
  END_BLOCK: process.env.END_BLOCK || "latest",
};
