<script setup lang="ts">
import type { Ref } from 'vue'
import type { BigNumber, Signer } from 'ethers'
import type { Web3Provider } from '@ethersproject/providers'
import type { WalletState } from '@web3-onboard/core'
import type { TransactionReceipt } from '@ethersproject/abstract-provider'
import type { ProofData } from '@relicprotocol/client'
import { ref } from 'vue'
import { Contract, providers } from 'ethers'
import { useOnboard } from '@web3-onboard/vue'
import { RelicClient } from '@relicprotocol/client'
import addresses from '@/contracts/contract-address.json'
import contract from '@/contracts/Token.json'

interface Account {
  address: string
  provider: Web3Provider
  signer: Signer
}

const Token = new Contract(addresses.Token, contract.abi)

const getBalance = async ({ address, signer }: Account): Promise<BigNumber> => {
  return await Token.connect(signer).balanceOf(address)
}

const getProof = async ({ address, provider }: Account) => {
  const client = await RelicClient.fromProvider(provider)

  return await client.birthCertificateProver.getProofData({
    account: address
  })
}

const setFact = async ({ address, provider, signer }: Account) => {
  const client = await RelicClient.fromProvider(provider)

  const tx = await client.birthCertificateProver.prove({ account: address })

  const res = await signer.sendTransaction(tx)

  return await res.wait()
}

const mint = async ({ address, signer }: Account) => {
  const res = await Token.connect(signer).mint(address)

  return await res.wait()
}

const toAccount = (wallet: WalletState): Account => {
  const address = wallet.accounts[0].address
  const provider = new providers.Web3Provider(wallet.provider)
  const signer = provider.getSigner()

  return { address, provider, signer }
}

const reactify =
  <T>({ wallet, result }: { wallet: Ref<WalletState | null>; result?: Ref<T> }) =>
  (f: (w: Account) => Promise<T>) =>
  async () => {
    const _wallet = wallet.value

    if (_wallet !== null) {
      const value = await f(toAccount(_wallet))

      if (result) {
        result.value = value
      }
    }
  }

const { connectWallet, connectedWallet } = useOnboard()

const [proof, factTxReceipt, mintTxReceipt, balance] = [
  ref<ProofData>(),
  ref<TransactionReceipt>(),
  ref<TransactionReceipt>(),
  ref<BigNumber>()
]

const state = {
  connectedWallet,
  proof,
  factTxReceipt,
  mintTxReceipt,
  balance
}
</script>

<template>
  <main>
    <div class="app">
      <h1>dApp</h1>
      <template v-if="connectedWallet !== null">
        <div class="entry">
          <h2>Token Balance</h2>
          <pre>{{ state.balance.value }}</pre>
          <button
            @click="
              reactify({ wallet: state.connectedWallet, result: state.balance })(getBalance)()
            "
          >
            Get Balance
          </button>
        </div>
        <div class="entry">
          <h2>Proof</h2>
          <pre>{{ state.proof.value }}</pre>
          <button
            @click="reactify({ wallet: state.connectedWallet, result: state.proof })(getProof)()"
          >
            Get Proof
          </button>
        </div>
        <div class="entry">
          <h2>Verify</h2>
          <pre>{{ state.factTxReceipt.value }}</pre>
          <button
            @click="
              reactify({ wallet: state.connectedWallet, result: state.factTxReceipt })(setFact)()
            "
          >
            Set Fact
          </button>
        </div>
        <div class="entry">
          <h2>Access</h2>
          <pre>{{ state.mintTxReceipt.value }}</pre>
          <button
            @click="
              reactify({ wallet: state.connectedWallet, result: state.mintTxReceipt })(mint)()
            "
          >
            Mint Token
          </button>
        </div>
      </template>
      <template v-else>
        <div>
          <button @click="connectWallet()">Connect Wallet</button>
        </div>
      </template>
    </div>
  </main>
</template>

<style scoped>
h1 {
  font-size: 1.5rem;
}

h2 {
  font-size: 1.25rem;
}

h3 {
  font-size: 1rem;
}

pre {
  background-color: #f0f0f0;
  overflow: scroll;
  padding: 1rem;
  min-height: 1rem;
  max-height: 3rem;
  border-radius: 0.25rem;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

pre::-webkit-scrollbar {
  display: none;
}

button {
  background-color: black;
  color: white;
  border: none;
  display: block;
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;
}

.app {
  max-width: 360px;
  margin: 1rem auto;
  padding: 1rem;
  background-color: white;
  border-radius: 0.25rem;
  border: solid #f0f0f0;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.04) 0px 10px 10px -5px;
}

.entry {
  margin-bottom: 2rem;
}
</style>
