const PlayersList = ({ activeBets, cashedOut }) => {
    return (
      <div className="flex flex-col h-[300px] overflow-y-auto">
        {/* Active Bets Section */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-yellow-400 mb-2">Active Bets</h4>
          {activeBets.length === 0 ? (
            <p className="text-gray-400 text-sm italic">No active bets</p>
          ) : (
            <div className="space-y-2">
              {activeBets.map((bet) => (
                <div key={bet.userId} className="flex justify-between items-center p-2 bg-gray-800 rounded">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium">{bet.username}</span>
                  </div>
                  <span className="text-sm font-bold text-green-400">${bet.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
  
        {/* Cashed Out Section */}
        <div>
          <h4 className="text-sm font-semibold text-cyan-400 mb-2">Cashed Out</h4>
          {cashedOut.length === 0 ? (
            <p className="text-gray-400 text-sm italic">No players cashed out yet</p>
          ) : (
            <div className="space-y-2">
              {cashedOut.map((cashout) => (
                <div key={cashout.userId} className="flex justify-between items-center p-2 bg-gray-800 rounded">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium">{cashout.username}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-cyan-400">{cashout.multiplier.toFixed(2)}x</div>
                    <div className="text-xs text-green-400">+${cashout.profit.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }
  
  export default PlayersList
  
  