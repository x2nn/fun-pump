function Token({ toggleTrade, token }) {
  return (
    <button onClick={() => toggleTrade(token)} className="token">
      <div className="token__details">
        <p>created by {token.creator}</p>
        <p>market Cap: {token.marketCap} eth</p>
        <p className="title">{token.name}</p>
      </div>
    </button>
  );
}

export default Token;