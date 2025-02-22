export default {
  contracts: {
    sepolia: {
      TOKEN_GIVER_CONTRACT_ADDRESS:
        '0x6a71ae1fad7070249fd5a191701a7851f3d919def3b7fa1278df02ce5e293a4',
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
