'use client';

import { useState, useEffect, useCallback } from 'react';
import { SilverApiResponse, SilverPriceData } from '@/types/silver';

export const SilverPriceDisplay = () => {
  const [priceData, setPriceData] = useState<SilverPriceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrice = useCallback(async () => {
    try {
      // Fetch from our local proxy to avoid CORS issues
      const res = await fetch('/api/proxy/silver');
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      const json: SilverApiResponse = await res.json();

      if (json.success) {
        setPriceData(json.data);
        setError(null);
        setLastUpdated(new Date());
      } else {
        setError(json.message || 'Failed to fetch data');
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

    // Poll every 3 seconds
    const intervalId = setInterval(fetchPrice, 3000);

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

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-zinc-900 rounded-xl shadow-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
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
             Silver Price
          </h2>
          {loading && !priceData && (
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
            <div className="text-center py-4">
              {priceData ? (
                <>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1 font-medium tracking-wider">
                    {priceData.symbol} / {priceData.currency}
                  </div>
                  <div className="text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                    {formatPrice(priceData.price)}
                  </div>
                  <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    Source: {priceData.source}
                  </div>
                </>
              ) : (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3 mx-auto"></div>
                  <div className="h-12 bg-zinc-200 dark:bg-zinc-700 rounded w-2/3 mx-auto"></div>
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/4 mx-auto"></div>
                </div>
              )}
            </div>

            {priceData && (
              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 flex justify-between items-center text-xs text-zinc-400">
                <span>Data: {formatTime(priceData.timestamp)}</span>
                <span>Updated: {lastUpdated?.toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
