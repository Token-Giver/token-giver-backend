export default {
  contracts: {
    sepolia: {
      TOKEN_GIVER_CONTRACT_ADDRESS:
        '0x070790e665f1ca28d58b51d42bf1c468da844a54cf626ede7bd01afabd2ee488',
      TOKEN_GIVER_ABI: '', // TODO: replace with actual abi
    },
    mainnet: {
      TOKEN_GIVER_CONTRACT_ADDRESS: '', // TODO: replace with actual address
      TOKEN_GIVER_ABI: '', // TODO: replace with actual abi
    },
  },
  event_names: {
    CREATE_CAMPAIGN: 'CreateCampaign',
    DONATION_MADE: 'DonationMade',
    WITHDRAWAL_MADE: 'WithdrawalMade',
    DEPLOYED_TOKEN_GIVER_NFT: 'DeployedTokenGiverNFT',
  },
  apibara: {
    maxReceiveMessageLength: 128 * 1_048_576,
  },
};
