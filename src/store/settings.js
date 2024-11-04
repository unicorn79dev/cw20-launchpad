const Self = {
  CHAIN_DISPLAY_NAME: {
    'INJ': 'Injective',
    'SEI': 'Sei',
  },
  CHAIN_UDENOM: {
    'INJ': 'inj',
    'SEI': 'usei',
  },
  CHAIN_DECIMALS: {
    'INJ': 18,
    'SEI': 6,
  },
  CHAIN_IDS: {
    'INJ': "injective-888",
    // 'SEI': "pacific-1",
    'SEI': "atlantic-2",
  },

  RPC_URL: {
    'INJ': 'https://testnet.sentry.tm.injective.network:443',
    'SEI': 'https://sei-testnet-2-rpc.brocha.in',
  },

  EXPLORER_NAME: {
    'INJ': 'Etherscan',
    'SEI': 'Etherscan',
  },

  ETHERSCAN_URL: {
    'INJ': 'https://etherscan.io',
    'SEI': 'https://kovan.etherscan.io',
  },

  NATIVE_GAS_TOKEN_SYMBOL: {
    'INJ': 'INJ',
    'SEI': 'SEI',
  },

  WRAPPED_GAS_TOKEN: {
    'INJ': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    'SEI': '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
  },

  CHAINS: {
    'INJ': {
      lpLocker: 'inj1lp0xh3uxkr2dhwyqq2meq0mds5ypde96s47r0a',
      tokenLocker: 'inj1q5uphctrlv5at4k4zcnx7u9nd843evex79q6w3',
      defaultFee: {
        amount: [],
        gas: "500000",
      },
      icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/injective/images/inj.svg',
      gasToken: {
        symbol: 'INJ',
        name: 'Injective',
        decimals: 18
      },
      explorerName: 'Etherscan',
      explorerURL: 'https://etherscan.io'
    },
    'SEI': {
      lpLocker: 'sei1n5669l8nf52gp9wpd8m5jl4n50yv54exurah06sl3r26qwdutq9qumu9cx',
      tokenLocker: 'sei1kehqxwqxp62zecrdzmxn58h7rd5x2d7mf2xyf9ve9ajdmvgwlsaqeh0pka',
      defaultFee: {
        amount: [],
        gas: "500000",
      },
      icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/sei/images/sei.svg',
      gasToken: {
        symbol: 'Sei',
        name: 'SEI',
        decimals: 6
      },
      explorerName: 'Etherscan',
      explorerURL: 'https://kovan.etherscan.io'
    },
  },
}

module.exports = Self