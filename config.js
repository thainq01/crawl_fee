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

  // Event ABI for DevGovFeeCharged
  EVENT_ABI: {
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

  // Contract ABI (minimal - just the event)
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
  ],

  // Block range settings
  START_BLOCK: process.env.START_BLOCK || "56845886",
  END_BLOCK: process.env.END_BLOCK || "latest",
};
