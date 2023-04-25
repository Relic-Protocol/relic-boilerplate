import { expect } from "chai";
import { ethers } from "hardhat";
import { RelicClient, utils } from "@relicprotocol/client";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployToken, resetProvenFact, proveBirthFact } from "./helpers";

const ACCOUNT_TO_BE_SUCCESS = "ACCOUNT_TO_BE_SUCCESS";
const ACCOUNT_TO_BE_FAILED = "ACCOUNT_TO_BE_FAILED";

describe("Token", function () {
  const deployFixture = async () => {
    const client = await RelicClient.fromProvider(ethers.provider);

    const { token } = await deployToken({ client });

    const factSig = utils.toFactSignature(
      utils.FeeClass.NoFee,
      utils.birthCertificateSigData()
    );

    await Promise.all([
      resetProvenFact({
        client,
        factSig,
        target: ACCOUNT_TO_BE_SUCCESS,
      }),
      resetProvenFact({
        client,
        factSig,
        target: ACCOUNT_TO_BE_FAILED,
      }),
    ]);

    return { token };
  };

  async function proveFixture() {
    const client = await RelicClient.fromProvider(ethers.provider);

    await Promise.all([
      proveBirthFact({ client, account: ACCOUNT_TO_BE_SUCCESS }),
      proveBirthFact({ client, account: ACCOUNT_TO_BE_FAILED }),
    ]);
  }

  describe("Mint", function () {
    it("Should mint with proven fact", async function () {
      const { token } = await loadFixture(deployFixture);

      await expect(token.mint(ACCOUNT_TO_BE_SUCCESS)).to.be.revertedWith(
        "birth certificate fact missing"
      );
    });

    it("Should mint for account to be success", async function () {
      const { token } = await loadFixture(deployFixture);
      await loadFixture(proveFixture);

      await expect(token.mint(ACCOUNT_TO_BE_SUCCESS)).to.changeTokenBalance(
        token,
        ACCOUNT_TO_BE_SUCCESS,
        1
      );
    });

    it("Shouldn't mint for account to be failed", async function () {
      const { token } = await loadFixture(deployFixture);
      await loadFixture(proveFixture);

      await expect(token.mint(ACCOUNT_TO_BE_FAILED)).to.be.revertedWith(
        "account too new"
      );
    });
  });
});
