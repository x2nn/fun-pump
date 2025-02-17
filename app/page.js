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
import images from "./images.json"

export default function Home() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [factory, setFactory] = useState(null);
  const [fee, setFee] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [showTrade, setShowTrade] = useState(false);
  const [token, setToken] = useState(false);


  async function loadBlockchainData(){
    //连接metamask钱包
    const provider = new ethers.BrowserProvider(window.ethereum);
    setProvider(provider);

    //获取网络
    const network = await provider.getNetwork();

    console.log("chainId:",network.chainId);
    console.log("address:", config[network.chainId].factory.address);
    //address,abi,signerOrProvider
    const factory = new ethers.Contract(config[network.chainId].factory.address,Factory,provider);
    setFactory(factory);
    console.log("factory:",factory);
    const fee = await factory.fee();
    console.log("fee:",fee);
    setFee(fee);

    //获取token的总数量
    const totalToken = await factory.totalTokens();
    const tokens = []
    for(let i = 0; i < totalToken; i++){
      const tokenToSale = await factory.getTokenSale(i);
      //输出创建的token的信息
      console.log(tokenToSale);

      const token = {
        token: tokenToSale.token,
        name: tokenToSale.name,
        creator: tokenToSale.creator,
        sold: tokenToSale.sold,
        raised: tokenToSale.raised,
        isOpen: tokenToSale.isOpen,
        image: images[i]
      }
      tokens.push(token);
    }
    setTokens(tokens.reverse());
    console.log("tokens:",tokens);
  }
  function toggleCreate(){
    console.log("creating...");
    showCreate ? setShowCreate(false) : setShowCreate(true);
  }

  function toggleTrade(token){
    console.log("trading...");
    setToken(token);
    showTrade ? setShowTrade(false) : setShowTrade(true);
  }

  useEffect(() => {
    loadBlockchainData();
  },[])
  return (
    <div className="page">
      <Header account={account} setAccount={setAccount}/>
      <main>
        <div className="create">
          <button onClick={factory && account && toggleCreate} className="btn--fancy">
            {!factory ? (
              "[ contract not deployed ]"
            ) : !account ? (
              "[ please connect wallet ]"
            ) : (
              "[ start a new token ]"
            )}
          </button>
        </div>

        <div className="listings">
          <h1>new listings</h1>
          <div className="tokens">
            {!account ? (
              <p>please connect wallet</p>
            ) : tokens.length === 0 ? (
              <p>No tokens listed</p>
            ) : (
              tokens.map((token, index) => (
                <Token toggleTrade={toggleTrade} token={token} key={index} />
              ))
            )
            }
          </div>
        </div>
      </main>
      {showCreate && (
        <List toggleCreate={toggleCreate} fee={fee} provider={provider} factory={factory}/>
        )}

      {showTrade && (
          <Trade toggleTrade={toggleTrade} token={token} provider={provider} factory={factory}/>
        )}

    </div>
  );
}
