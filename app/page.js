"use client"

import { useEffect, useState } from "react"
import { ethers } from 'ethers'

// Components
import Header from "./components/Header"
import List from "./components/List"
import Token from "./components/Token"
import Trade from "./components/Trade"

// ABIs & Config
import Factory from "./abis/Factory.json"
import config from "./config.json"

export default function Home() {
  const [provider, setProvider] = useState(null)
  const [account, setAccount] = useState(null)
  const [factory, setFactory] = useState(null)
  const [fee, setFee] = useState(0)
  const [tokens, setTokens] = useState([])
  const [token, setToken] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showTrade, setShowTrade] = useState(false)

  const toggleCreate = () => {
    showCreate ? setShowCreate(false) : setShowCreate(true)
  }

  const toggleTrade = (token) => {
    setToken(token)
    showTrade ? setShowTrade(false) : setShowTrade(true)
  }

  const loadBlockchainData = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum)
    setProvider(provider)

    const network = await provider.getNetwork()

    const factory = new ethers.Contract(config[network.chainId].factory.address, Factory, provider)
    setFactory(factory)

    const fee = await factory.fee()
    setFee(fee)

    const totalTokens = await factory.totalTokens()
    const tokens = []

    // We'll get the first 6 tokens listed
    for (let i = 0; i < totalTokens; i++) {
      if (i == 6) {
        break
      }

      const token = await factory.getTokenSale(i)
      tokens.push(token)
    }

    // We reverse the array so we can get the most
    // recent token listed to display first
    setTokens(tokens.reverse())
  }

  useEffect(() => {
    loadBlockchainData()
  }, [showCreate, showTrade])

  return (
    <div className="page">
      <Header account={account} setAccount={setAccount} />

      <main>
        <div className="create">
          <button onClick={toggleCreate} className="btn--fancy">[ start a new token ]</button>
        </div>

        <div className="listings">
          <h1>new listings</h1>

          <div className="tokens">
            {tokens ? (
              tokens.map((token, index) => (
                <Token
                  toggleTrade={toggleTrade}
                  token={token}
                  key={index}
                />
              ))
            ) : (
              <div>No tokens listed</div>
            )}
          </div>
        </div>

        {showCreate && (
          <List toggleCreate={toggleCreate} fee={fee} provider={provider} factory={factory} />
        )}

        {showTrade && (
          <Trade toggleTrade={toggleTrade} token={token} provider={provider} factory={factory} />
        )}
      </main>
    </div>
  );
}
