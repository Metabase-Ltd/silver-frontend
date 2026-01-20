'use client';

import { useState, useEffect, useCallback } from 'react';
import { SilverApiResponse, SilverPriceData } from '@/types/silver';

export const SilverPriceDisplay = () => {
  const [binanceData, setBinanceData] = useState<SilverPriceData | null>(null);
  const [ibData, setIbData] = useState<SilverPriceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrice = useCallback(async () => {
    try {
      // Fetch from both endpoints in parallel
      const [binanceRes, ibRes] = await Promise.all([
        fetch('/api/proxy/silver'),
        fetch('/api/proxy/ib/silver')
      ]);

      const binanceJson: SilverApiResponse = await binanceRes.json();
      const ibJson: SilverApiResponse = await ibRes.json();

      let hasError = false;
      let errorMsg = '';

      if (binanceJson.success) {
        setBinanceData(binanceJson.data);
      } else {
        console.error('Binance fetch failed:', binanceJson.message);
        // We don't fail completely if one source fails, but we might want to show a warning
        // For now, we'll just log it. If both fail, we set error.
      }

      if (ibJson.success) {
        setIbData(ibJson.data);
      } else {
        console.error('IB fetch failed:', ibJson.message);
      }

      if (!binanceJson.success && !ibJson.success) {
        setError('Failed to fetch data from both sources');
      } else {
        setError(null);
        setLastUpdated(new Date());
      }

    } catch (err) {
      setError('Connection error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchPrice();

    // Poll every 1 second
    const intervalId = setInterval(fetchPrice, 1000);

    return () => clearInterval(intervalId);
  }, [fetchPrice]);

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 3,
    }).format(price);
  };

  // Format time
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const spread = binanceData && ibData ? (binanceData.price - ibData.price) : null;
  const spreadAbs = spread !== null ? Math.abs(spread) : null;
  const spreadPercentage = spread !== null && ibData ? (spread / ibData.price) * 100 : null;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 32 32" className="inline-block">
                <defs>
                  <linearGradient id="silverIconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f0f0f0" />
                    <stop offset="50%" stopColor="#a0a0a0" />
                    <stop offset="100%" stopColor="#f0f0f0" />
                  </linearGradient>
                </defs>
                <circle cx="16" cy="16" r="14" stroke="#777" strokeWidth="1" fill="url(#silverIconGradient)" />
                <text x="16" y="18" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="12" fill="#444">Ag</text>
              </svg>
               Silver Prices
            </h2>
            <div className="flex items-center gap-2">
                {loading && !binanceData && !ibData && (
                <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full animate-pulse">
                  Connecting...
                </span>
              )}
              {!loading && !error && (
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              )}
            </div>
          </div>

          {error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm text-center">
              {error}
              <button 
                onClick={fetchPrice}
                className="block mx-auto mt-2 text-xs underline hover:text-red-800 dark:hover:text-red-300"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Binance Card */}
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4 border border-zinc-100 dark:border-zinc-700">
                   <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider flex justify-between">
                     <span>Binance Futures</span>
                     {binanceData && <span className="text-[10px]">{formatTime(binanceData.timestamp)}</span>}
                   </div>
                   {binanceData ? (
                     <div className="space-y-1">
                        <div className="text-3xl font-bold text-zinc-900 dark:text-white">
                          {formatPrice(binanceData.price)}
                        </div>
                        <div className="text-xs text-zinc-400">
                          {binanceData.symbol}
                        </div>
                     </div>
                   ) : (
                     <div className="animate-pulse space-y-2">
                        <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded w-2/3"></div>
                        <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3"></div>
                     </div>
                   )}
                </div>

                {/* IB Card */}
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4 border border-zinc-100 dark:border-zinc-700">
                   <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider flex justify-between">
                     <span>Interactive Brokers</span>
                     {ibData && <span className="text-[10px]">{formatTime(ibData.timestamp)}</span>}
                   </div>
                   {ibData ? (
                     <div className="space-y-1">
                        <div className="text-3xl font-bold text-zinc-900 dark:text-white">
                          {formatPrice(ibData.price)}
                        </div>
                        <div className="text-xs text-zinc-400">
                          {ibData.symbol} {ibData.conid ? `(ID: ${ibData.conid})` : ''}
                        </div>
                     </div>
                   ) : (
                     <div className="animate-pulse space-y-2">
                        <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded w-2/3"></div>
                        <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3"></div>
                     </div>
                   )}
                </div>
              </div>

              {/* Spread Display */}
              {binanceData && ibData && spread !== null && spreadAbs !== null && spreadPercentage !== null && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800 text-center">
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wider mb-1">
                    Price Spread (Binance - IB)
                  </div>
                  <div className={`text-2xl font-bold ${spread > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {spread > 0 ? '+' : ''}{formatPrice(spread)}
                  </div>
                  <div className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                    {Math.abs(spreadPercentage).toFixed(3)}% difference
                  </div>
                </div>
              )}

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 flex justify-between items-center text-xs text-zinc-400">
                 <span>Updated: {lastUpdated?.toLocaleTimeString()}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
