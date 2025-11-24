import React, { useState, useEffect } from 'react';
import { ArrowDown, RefreshCcw, Info, Wallet, TrendingUp, AlertCircle } from 'lucide-react';

const STABLECOINS = [
  'tether',
  'usd-coin',
  'dai',
  'first-digital-usd',
  'ethena-usde',
  'usdd',
  'true-usd',
  'paxos-standard',
  'binance-usd',
  'frax'
];

const FIAT_OPTIONS = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', flag: '🇻🇳' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' }
];

export default function App() {
  const [fiatCurrency, setFiatCurrency] = useState(FIAT_OPTIONS[0]);
  const [fiatAmount, setFiatAmount] = useState('1000');
  const [cryptos, setCryptos] = useState([]);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch crypto data from CoinGecko
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetching top 120 to ensure we have 80 left after filtering stablecoins
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${fiatCurrency.code.toLowerCase()}&order=market_cap_desc&per_page=120&page=1&sparkline=false`
      );

      if (!response.ok) {
        throw new Error('Rate limit exceeded. Please wait a moment.');
      }

      const data = await response.json();

      // Filter out stablecoins
      const filteredData = data
        .filter((coin) => !STABLECOINS.includes(coin.id))
        .slice(0, 80);

      setCryptos(filteredData);
      
      // If no crypto is currently selected, or the selected one isn't in the new list (rare), default to BTC
      if (!selectedCrypto && filteredData.length > 0) {
        setSelectedCrypto(filteredData[0]);
      } else if (selectedCrypto) {
        // Update the price of the currently selected crypto with the new data
        const updatedCrypto = filteredData.find(c => c.id === selectedCrypto.id);
        if (updatedCrypto) setSelectedCrypto(updatedCrypto);
      }

      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when fiat currency changes
  useEffect(() => {
    fetchData();
  }, [fiatCurrency]);

  const handleSwap = () => {
    // Just a visual function since flow is strict Fiat -> Crypto
  };

  const calculateConversion = () => {
    if (!fiatAmount || !selectedCrypto) return '0.00';
    const amount = parseFloat(fiatAmount.replace(/,/g, ''));
    if (isNaN(amount)) return '0.00';
    
    // Calculate crypto amount: Fiat / Price
    const value = amount / selectedCrypto.current_price;
    
    // Smart formatting for decimals based on value size
    if (value < 0.00001) return value.toFixed(8);
    if (value < 0.01) return value.toFixed(6);
    if (value < 1) return value.toFixed(4);
    return value.toFixed(2);
  };

  const handleFiatAmountChange = (e) => {
    const val = e.target.value;
    // Allow only numbers and one decimal
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setFiatAmount(val);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans p-4">
      
      {/* Main Card Container */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative border border-gray-100">
        
        {/* Header - Absolute to float over */}
        <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-2 text-gray-600 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
            <TrendingUp size={14} />
            <span>Live Rates</span>
          </div>
          <button 
            onClick={fetchData}
            disabled={loading}
            className={`p-2 rounded-full bg-white/80 backdrop-blur-md shadow-sm hover:bg-white transition-all ${loading ? 'animate-spin' : ''}`}
          >
            <RefreshCcw size={16} className="text-gray-600" />
          </button>
        </div>

        {/* TOP HALF: FIAT (Input) */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-8 pt-16 pb-12 flex flex-col justify-center relative">
          <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">You Pay</label>
          
          <div className="flex items-end justify-between gap-4 mb-2">
            <input
              type="text"
              inputMode="decimal"
              value={fiatAmount}
              onChange={handleFiatAmountChange}
              className="w-full bg-transparent text-4xl font-bold text-indigo-950 placeholder-indigo-200 outline-none border-none p-0"
              placeholder="0"
            />
            <div className="relative group shrink-0">
              <select
                value={fiatCurrency.code}
                onChange={(e) => setFiatCurrency(FIAT_OPTIONS.find(f => f.code === e.target.value))}
                className="appearance-none bg-white py-2 pl-3 pr-8 rounded-xl shadow-sm font-bold text-gray-700 cursor-pointer focus:ring-2 focus:ring-indigo-200 focus:outline-none border border-indigo-100"
              >
                {FIAT_OPTIONS.map((f) => (
                  <option key={f.code} value={f.code}>
                    {f.code}
                  </option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <ArrowDown size={14} strokeWidth={3} />
              </div>
            </div>
          </div>

          <div className="text-sm text-indigo-400 font-medium flex items-center gap-2">
            <span>{fiatCurrency.flag} {fiatCurrency.name}</span>
          </div>

          {/* DIVIDER / CONNECTOR - Anchored to bottom of top section */}
          <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 z-20">
            <div className="bg-white p-2 rounded-full shadow-lg border-4 border-gray-50 text-indigo-600">
              <ArrowDown size={20} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* BOTTOM HALF: CRYPTO (Output) */}
        <div className="bg-indigo-950 p-8 pb-10 pt-16 text-white min-h-[340px] flex flex-col justify-between">
          
          <div>
            <label className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2 block">You Receive</label>
            
            {loading && !selectedCrypto ? (
              <div className="animate-pulse space-y-4">
                <div className="h-12 bg-indigo-900/50 rounded w-2/3"></div>
                <div className="h-8 bg-indigo-900/50 rounded w-1/3"></div>
              </div>
            ) : error ? (
               <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                 <AlertCircle className="text-red-400 shrink-0" size={20} />
                 <div>
                   <p className="text-sm text-red-200 font-medium">{error}</p>
                   <button onClick={fetchData} className="text-xs text-white underline mt-1">Try again</button>
                 </div>
               </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="text-4xl font-bold tracking-tight text-white truncate max-w-[200px] sm:max-w-xs">
                    {calculateConversion()}
                  </div>
                </div>

                {/* Crypto Selector */}
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    {selectedCrypto?.image ? (
                        <img src={selectedCrypto.image} alt={selectedCrypto.name} className="w-6 h-6 rounded-full" />
                    ) : (
                        <Wallet size={20} className="text-indigo-400" />
                    )}
                  </div>
                  
                  <select
                    value={selectedCrypto?.id || ''}
                    onChange={(e) => {
                        const coin = cryptos.find(c => c.id === e.target.value);
                        setSelectedCrypto(coin);
                    }}
                    className="w-full appearance-none bg-indigo-900/50 hover:bg-indigo-900 transition-colors border border-indigo-800 text-white py-4 pl-12 pr-10 rounded-2xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    {cryptos.map((coin) => (
                      <option key={coin.id} value={coin.id} className="bg-indigo-950 text-white">
                        {coin.name} ({coin.symbol.toUpperCase()})
                      </option>
                    ))}
                  </select>
                  
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400">
                    <ArrowDown size={16} />
                  </div>
                </div>

                {/* Market Info */}
                {selectedCrypto && (
                  <div className="mt-6 flex items-center justify-between text-xs font-medium text-indigo-300 bg-indigo-900/30 p-3 rounded-xl border border-indigo-800/50">
                    <div className="flex items-center gap-1">
                       <Info size={12} />
                       <span>Current Price</span>
                    </div>
                    <div className="text-white">
                      1 {selectedCrypto.symbol.toUpperCase()} = {fiatCurrency.symbol}{selectedCrypto.current_price.toLocaleString(undefined, {maximumFractionDigits: 2})}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Info */}
          <div className="text-center">
             <p className="text-[10px] text-indigo-400/60">
                {lastUpdated ? `Rates updated: ${lastUpdated.toLocaleTimeString()}` : 'Connecting to market...'}
             </p>
             <p className="text-[10px] text-indigo-400/40 mt-1">
                Data provided by CoinGecko API • Top 80 Cryptos (Excl. Stablecoins)
             </p>
          </div>
        </div>

      </div>
    </div>
  );
}