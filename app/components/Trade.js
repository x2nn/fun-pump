import { useEffect, useState } from "react"
import { ethers } from "ethers"

function Trade({ toggleTrade, token, provider, factory }) {
  const [cost, setCost] = useState(0)

  async function buyHandler(form) {
    const amount = form.get("amount")

    const cost = await factory.getCost(token.sold)
    const totalCost = cost * BigInt(amount)

    const signer = await provider.getSigner()

    const transaction = await factory.connect(signer).buy(
      token.token,
      ethers.parseUnits(amount, 18),
      { value: totalCost }
    )
    await transaction.wait()

    toggleTrade()
  }

  async function getCost() {
    const cost = await factory.getCost(token.sold)
    setCost(cost)
  }

  useEffect(() => {
    getCost()
  }, [])

  return (
    <div className="trade">
      <h2>trade</h2>

      <div className="trade__description">
        <p className="title">{token.name}</p>
        <p>creator: {token.creator.slice(0, 6) + '...' + token.creator.slice(38, 42)}</p>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit.
          At numquam qui sit minima nulla nesciunt eum dignissimos!
        </p>
        <p>marketcap: {ethers.formatUnits(token.raised, 18)} ETH</p>
        <p>base cost: {ethers.formatUnits(cost, 18)} ETH</p>
      </div>

      <form action={buyHandler}>
        <input type="number" name="amount" min={1} max={10000} placeholder="1" />
        <input type="submit" value="[ buy ]" />
      </form>

      <button onClick={toggleTrade} className="btn--fancy">[ cancel ]</button>
    </div>
  );
}

export default Trade;