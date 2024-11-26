function Trade({ toggleTrade, token }) {
  async function buyHandler(form) {
    console.log(form.get("amount"))
  }

  return (
    <div className="trade">
      <h2>trade</h2>

      <div className="trade__description">
        <p className="title">{token.name}</p>
        <p>creator: {token.creator}</p>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit.
          At numquam qui sit minima nulla nesciunt eum dignissimos!
        </p>
        <p>marketcap: {token.marketCap} ETH</p>
        <p>base cost: {0.01} ETH</p>
      </div>

      <form action={buyHandler}>
        <input type="number" name="amount" min={1} max={100} placeholder="1" />
        <input type="submit" value="[ buy ]" />
      </form>

      <button onClick={toggleTrade} className="btn--fancy">[ cancel ]</button>
    </div>
  );
}

export default Trade;