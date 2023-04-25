import type { RelicClient } from "@relicprotocol/client";
import { ethers } from "hardhat";
import { setBalance } from "@nomicfoundation/hardhat-network-helpers";

export const deployToken = async ({ client }: { client: RelicClient }) => {
  const Token = await ethers.getContractFactory("Token");

  const token = await Token.deploy(client.addresses.reliquary);

  await token.deployed();

  return { token };
};

export const proveBirthFact = async ({
  client,
  account,
}: {
  client: RelicClient;
  account: string;
}) => {
  const [signer] = await ethers.getSigners();

  return await client.birthCertificateProver
    .prove({ account })
    .then((tx) => signer.sendTransaction(tx))
    .then((res) => res.wait());
};

export const resetProvenFact = async ({
  client,
  factSig,
  target,
}: {
  client: RelicClient;
  factSig: string;
  target: string;
}) => {
  const prover = await ethers.getImpersonatedSigner(
    client.addresses.birthCertificateProver
  );

  setBalance(prover.address, 100n ** 18n);

  const reliquary = await ethers.getContractAt(
    "IReliquary",
    client.addresses.reliquary
  );

  await reliquary.connect(prover).resetFact(target, factSig);
};
