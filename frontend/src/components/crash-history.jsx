const CrashHistory = ({ crashes }) => {
    return (
      <div className="grid grid-cols-5 gap-2">
        {crashes.length === 0 ? (
          <p className="col-span-5 text-gray-400 text-sm italic">No crash history available</p>
        ) : (
          crashes.map((crash, index) => (
            <div
              key={index}
              className={`flex items-center justify-center p-2 rounded ${
                crash < 2 ? "bg-red-900/50" : crash < 5 ? "bg-yellow-900/50" : "bg-green-900/50"
              }`}
            >
              <span
                className={`text-sm font-bold ${
                  crash < 2 ? "text-red-400" : crash < 5 ? "text-yellow-400" : "text-green-400"
                }`}
              >
                {crash.toFixed(2)}x
              </span>
            </div>
          ))
        )}
      </div>
    )
  }
  
  export default CrashHistory
  
  