import { ethers, artifacts } from "hardhat";
import { RelicClient } from "@relicprotocol/client";
import path from "path";
import fs from "fs";

async function main() {
  const { addresses } = await RelicClient.fromProvider(ethers.provider);

  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account: ", deployer.address);

  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy(addresses.reliquary);

  await token.deployed();

  console.log("Token address: ", token.address);

  const contractsDir = path.join(
    __dirname,
    "..",
    "frontend",
    "src",
    "contracts"
  );

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ Token: token.address }, undefined, 2)
  );

  const TokenArtifact = artifacts.readArtifactSync("Token");

  fs.writeFileSync(
    path.join(contractsDir, "Token.json"),
    JSON.stringify(TokenArtifact, null, 2)
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
