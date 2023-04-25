import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  networks: {
    hardhat: {
      chainId: 1,
      forking: {
        url: "https://cloudflare-eth.com",
      },
    },
  },
};

export default config;
