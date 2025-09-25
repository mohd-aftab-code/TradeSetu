import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory cache for market data
const marketDataCache = new Map<string, { data: MarketData[]; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds cache

// Enhanced Market Data interface
interface MarketData {
  symbol: string;
  price: number;
  change: number;
  change_percent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  timestamp: Date;
  type?: 'index' | 'stock' | 'option' | 'sector';
  strike?: number;
  optionType?: 'CE' | 'PE';
  oi?: number;
  oiChange?: number;
  sector?: string;
  tradingViewUrl?: string; // Added for TradingView integration
}

// Function to check cache and return cached data if valid
function getCachedData(cacheKey: string): MarketData[] | null {
  const cached = marketDataCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`Returning cached data for ${cacheKey}`);
    return cached.data;
  }
  return null;
}

// Function to set cache data
function setCachedData(cacheKey: string, data: MarketData[]): void {
  marketDataCache.set(cacheKey, { data, timestamp: Date.now() });
  console.log(`Cached data for ${cacheKey}`);
}

// Function to fetch real-time market data with improved timeout handling
async function fetchRealTimeMarketData(): Promise<MarketData[]> {
  try {
    // Reduced list of key symbols to minimize API calls and timeout issues
    const symbols = [
      // Major Indices
      { symbol: 'NIFTY50', apiSymbol: '^NSEI', type: 'index' },
      { symbol: 'BANKNIFTY', apiSymbol: '^NSEBANK', type: 'index' },
      { symbol: 'SENSEX', apiSymbol: '^BSESN', type: 'index' },
      
      // Top 10 Major Stocks only
      { symbol: 'RELIANCE', apiSymbol: 'RELIANCE.NS', type: 'stock', sector: 'Oil & Gas' },
      { symbol: 'TCS', apiSymbol: 'TCS.NS', type: 'stock', sector: 'IT' },
      { symbol: 'HDFCBANK', apiSymbol: 'HDFCBANK.NS', type: 'stock', sector: 'Banking' },
      { symbol: 'ICICIBANK', apiSymbol: 'ICICIBANK.NS', type: 'stock', sector: 'Banking' },
      { symbol: 'HINDUNILVR', apiSymbol: 'HINDUNILVR.NS', type: 'stock', sector: 'FMCG' },
      { symbol: 'ITC', apiSymbol: 'ITC.NS', type: 'stock', sector: 'FMCG' },
      { symbol: 'SBIN', apiSymbol: 'SBIN.NS', type: 'stock', sector: 'Banking' },
      { symbol: 'BHARTIARTL', apiSymbol: 'BHARTIARTL.NS', type: 'stock', sector: 'Telecom' },
      { symbol: 'ASIANPAINT', apiSymbol: 'ASIANPAINT.NS', type: 'stock', sector: 'Consumer Durables' },
      { symbol: 'MARUTI', apiSymbol: 'MARUTI.NS', type: 'stock', sector: 'Auto' }
    ];
    
    const marketData: MarketData[] = [];
    let realDataCount = 0;

    // Process symbols in parallel with timeout
    const fetchPromises = symbols.map(async (symbol) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

        const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol.apiSymbol}?interval=1m&range=1d`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          
          if (data.chart && data.chart.result && data.chart.result[0]) {
            const result = data.chart.result[0];
            const meta = result.meta;
            const indicators = result.indicators.quote[0];
            
            if (meta && indicators) {
              const currentPrice = meta.regularMarketPrice || meta.previousClose || 0;
              const previousClose = meta.previousClose || currentPrice;
              const change = currentPrice - previousClose;
              const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;
              
              return {
                symbol: symbol.symbol,
                price: currentPrice,
                change: change,
                change_percent: changePercent,
                volume: indicators.volume ? indicators.volume[indicators.volume.length - 1] || 0 : 0,
                high: meta.regularMarketDayHigh || currentPrice,
                low: meta.regularMarketDayLow || currentPrice,
                open: meta.regularMarketOpen || currentPrice,
                timestamp: new Date(),
                type: symbol.type as 'index' | 'stock',
                sector: symbol.sector
              };
            }
          }
        }
        return null;
      } catch (error) {
        console.log(`Error fetching real data for ${symbol.symbol}:`, error instanceof Error ? error.message : 'Unknown error');
        return null;
      }
    });

    // Wait for all promises with a global timeout
    const results = await Promise.allSettled(fetchPromises);
    
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        marketData.push(result.value);
        realDataCount++;
      }
    });

    // Add mock data for missing symbols
    const existingSymbols = marketData.map(item => item.symbol);
    const missingSymbols = symbols.filter(s => !existingSymbols.includes(s.symbol));
    
    for (const missingSymbol of missingSymbols) {
      marketData.push(generateMockData(missingSymbol.symbol, missingSymbol.type, missingSymbol.sector));
    }

    // Add OI data for options (with timeout)
    try {
      const oiData = await Promise.race([
        fetchRealTimeOptionChain(),
        new Promise<MarketData[]>((resolve) => {
          setTimeout(() => resolve(generateRealisticOIData()), 2000);
        })
      ]);
      marketData.push(...oiData);
    } catch (error) {
      console.log('Option chain fetch failed, using fallback data');
      marketData.push(...generateRealisticOIData());
    }

    // Add sector performance data (with timeout)
    try {
      const sectorDataWithRealTime = await Promise.race([
        generateSectorData(),
        new Promise<MarketData[]>((resolve) => {
          setTimeout(() => resolve(generateSectorFallbackData()), 3000);
        })
      ]);
      marketData.push(...sectorDataWithRealTime);
    } catch (error) {
      console.log('Sector data fetch failed, using fallback data');
      marketData.push(...generateSectorFallbackData());
    }

    return marketData;
    
  } catch (error) {
    console.error('Error in fetchRealTimeMarketData:', error);
    // Return comprehensive mock data as fallback
    return generateComprehensiveMockData();
  }
}

// Function to generate realistic mock data
function generateMockData(symbol: string, type: string = 'stock', sector?: string): MarketData {
  const basePrices: { [key: string]: number } = {
    'NIFTY50': 21500,
    'BANKNIFTY': 46800,
    'SENSEX': 71200,
    'FINNIFTY': 20100,
    'RELIANCE': 2450,
    'TCS': 3890,
    'INFY': 1567,
    'HDFCBANK': 1650,
    'ICICIBANK': 950,
    'HINDUNILVR': 2450,
    'ITC': 420,
    'SBIN': 650,
    'BHARTIARTL': 1100,
    'AXISBANK': 1050,
    'KOTAKBANK': 1800,
    'ASIANPAINT': 3200,
    'MARUTI': 10500,
    'SUNPHARMA': 1200,
    'TATAMOTORS': 750,
    'WIPRO': 450,
    'ULTRACEMCO': 8500,
    'TITAN': 3500,
    'BAJFINANCE': 7200,
    'NESTLEIND': 2500,
    'POWERGRID': 220,
    'TECHM': 1200,
    'BAJAJFINSV': 1600,
    'NTPC': 320,
    'HCLTECH': 1200,
    'JSWSTEEL': 850,
    'ONGC': 180,
    'COALINDIA': 450,
    'TATASTEEL': 140,
    'INDUSINDBK': 1400,
    'CIPLA': 1200,
    'DRREDDY': 5800,
    'SHREECEM': 25000,
    'BRITANNIA': 4800,
    'EICHERMOT': 3800,
    'HEROMOTOCO': 4500,
    'DIVISLAB': 3800,
    'ADANIENT': 2800,
    'ADANIPORTS': 1200,
    'ADANIPOWER': 450,
    'VEDL': 250,
    'GRASIM': 2200,
    'HINDALCO': 500,
    'MM': 850,
    'SBILIFE': 1400,
    'HDFCLIFE': 650,
    'ICICIPRULI': 1100,
    'BAJAJ-AUTO': 7500,
    'TATACONSUM': 850,
    'APOLLOHOSP': 5800,
    'M&M': 1800,
    'UPL': 550,
    'BPCL': 450,
    'IOC': 150,
    'HINDCOPPER': 180,
    'NATIONALUM': 120
  };

  const basePrice = basePrices[symbol] || 1000;
  const volatility = type === 'index' ? 0.015 : 0.025; // Lower volatility for indices
  
  // Generate realistic price movement
  const timeFactor = Date.now() / 1000000;
  const randomFactor = Math.sin(timeFactor) * Math.cos(timeFactor * 0.5);
  const priceChange = basePrice * volatility * randomFactor;
  const currentPrice = basePrice + priceChange;
  
  const change = priceChange;
  const changePercent = (change / basePrice) * 100;
  const volume = type === 'index' ? 
    Math.floor(Math.random() * 10000000) + 5000000 : 
    Math.floor(Math.random() * 5000000) + 1000000;
  const high = currentPrice + Math.abs(priceChange) * 0.5;
  const low = currentPrice - Math.abs(priceChange) * 0.5;
  const open = basePrice + priceChange * 0.3;

  return {
    symbol,
    price: Math.round(currentPrice * 100) / 100,
    change: Math.round(change * 100) / 100,
    change_percent: Math.round(changePercent * 100) / 100,
    volume,
    high: Math.round(high * 100) / 100,
    low: Math.round(low * 100) / 100,
    open: Math.round(open * 100) / 100,
    timestamp: new Date(),
    type: type as 'index' | 'stock',
    sector
  };
}

// Function to fetch real-time option chain data with improved timeout handling
async function fetchRealTimeOptionChain(): Promise<MarketData[]> {
  const oiData: MarketData[] = [];
  
  // Reduced option symbols to minimize API calls
  const optionSymbols = [
    // NIFTY Options (near strikes only)
    { symbol: 'NIFTY25081522000CE.NS', displayName: 'NIFTY 22000 CE', strike: 22000, optionType: 'CE' },
    { symbol: 'NIFTY25081522000PE.NS', displayName: 'NIFTY 22000 PE', strike: 22000, optionType: 'PE' },
    
    // BANKNIFTY Options (near strikes only)
    { symbol: 'BANKNIFTY25081555000CE.NS', displayName: 'BANKNIFTY 55000 CE', strike: 55000, optionType: 'CE' },
    { symbol: 'BANKNIFTY25081555000PE.NS', displayName: 'BANKNIFTY 55000 PE', strike: 55000, optionType: 'PE' }
  ];

  // Fetch real-time data for each option with timeout
  const fetchPromises = optionSymbols.map(async (option) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

      const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${option.symbol}?interval=1m&range=1d`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        
        if (data.chart && data.chart.result && data.chart.result[0]) {
          const result = data.chart.result[0];
          const meta = result.meta;
          const indicators = result.indicators.quote[0];
          
          if (meta && indicators) {
            const currentPrice = meta.regularMarketPrice || meta.previousClose || 0;
            const previousClose = meta.previousClose || currentPrice;
            const change = currentPrice - previousClose;
            const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;
            
            // Generate realistic OI data based on price
            const baseOI = Math.floor(currentPrice * 1000) + Math.floor(Math.random() * 50000);
            const oiChange = Math.floor(Math.random() * 20000) - 10000;
            
            console.log(`Fetched real data for ${option.displayName}: ₹${currentPrice}`);
            
            return {
              symbol: option.displayName,
              price: currentPrice,
              change: change,
              change_percent: changePercent,
              volume: indicators.volume ? indicators.volume[indicators.volume.length - 1] || 0 : 0,
              high: meta.regularMarketDayHigh || currentPrice,
              low: meta.regularMarketDayLow || currentPrice,
              open: meta.regularMarketOpen || currentPrice,
              timestamp: new Date(),
              type: 'option' as const,
              strike: option.strike,
              optionType: option.optionType as 'CE' | 'PE',
              oi: baseOI,
              oiChange: oiChange
            };
          }
        }
      }
      return null;
    } catch (error) {
      console.log(`Error fetching ${option.displayName}:`, error);
      return null;
    }
  });

  // Wait for all option fetches with timeout
  const results = await Promise.allSettled(fetchPromises);
  
  results.forEach((result) => {
    if (result.status === 'fulfilled' && result.value) {
      oiData.push(result.value);
    }
  });
  
  console.log(`Total real option records fetched: ${oiData.length}`);
  return oiData.length > 0 ? oiData : generateRealisticOIData();
}

// Fallback function for realistic OI data
function generateRealisticOIData(): MarketData[] {
  const oiData: MarketData[] = [];
  const strikes = [21000, 21200, 21400, 21600, 21800, 22000];
  const symbols = ['NIFTY', 'BANKNIFTY'];
  
  symbols.forEach(symbol => {
    strikes.forEach(strike => {
      ['CE', 'PE'].forEach(optionType => {
        const basePrice = strike * 0.05; // 5% of strike price
        const priceChange = basePrice * (Math.random() - 0.5) * 0.1;
        const currentPrice = basePrice + priceChange;
        const oi = Math.floor(Math.random() * 1000000) + 100000;
        const oiChange = Math.floor(Math.random() * 200000) - 100000;
        
        oiData.push({
          symbol: `${symbol} ${strike} ${optionType}`,
          price: Math.round(currentPrice * 100) / 100,
          change: Math.round(priceChange * 100) / 100,
          change_percent: Math.round((priceChange / basePrice) * 10000) / 100,
          volume: Math.floor(Math.random() * 500000) + 50000,
          high: currentPrice + Math.abs(priceChange) * 0.3,
          low: currentPrice - Math.abs(priceChange) * 0.3,
          open: basePrice + priceChange * 0.2,
          timestamp: new Date(),
          type: 'option',
          strike,
          optionType: optionType as 'CE' | 'PE',
          oi,
          oiChange
        });
      });
    });
  });
  
  return oiData;
}



// Function to generate sector performance data with simplified API calls
async function generateSectorData(): Promise<MarketData[]> {
  // Reduced list of key sectors to minimize API calls
  const sectorData = [
    {
      symbol: 'Nifty Bank Index',
      symbolCode: 'NIFTY_BANK',
      tradingViewUrl: 'https://www.tradingview.com/symbols/NSE-NIFTY_BANK/'
    },
    {
      symbol: 'Nifty IT Index',
      symbolCode: 'CNXIT',
      tradingViewUrl: 'https://www.tradingview.com/symbols/NSE-CNXIT/'
    },
    {
      symbol: 'Nifty FMCG Index',
      symbolCode: 'NIFTY_FMCG',
      tradingViewUrl: 'https://www.tradingview.com/symbols/NSE-NIFTY_FMCG/'
    },
    {
      symbol: 'Nifty Pharma Index',
      symbolCode: 'CNXPHARMA',
      tradingViewUrl: 'https://www.tradingview.com/symbols/NSE-CNXPHARMA/'
    },
    {
      symbol: 'Nifty Auto Index',
      symbolCode: 'NIFTY_AUTO',
      tradingViewUrl: 'https://www.tradingview.com/symbols/NSE-NIFTY_AUTO/'
    }
  ];

  // Fetch real-time data for each sector with simplified approach
  const sectorDataWithRealTime = await Promise.all(
    sectorData.map(async (sector) => {
      try {
        // Map symbol codes to Yahoo Finance symbols
        const symbolMap: { [key: string]: string } = {
          'NIFTY_BANK': 'NIFTY_BANK.NS',
          'CNXIT': 'CNXIT.NS',
          'NIFTY_FMCG': 'NIFTY_FMCG.NS',
          'CNXPHARMA': 'CNXPHARMA.NS',
          'NIFTY_AUTO': 'NIFTY_AUTO.NS'
        };

        const yahooSymbol = symbolMap[sector.symbolCode];
        if (!yahooSymbol) {
          console.error(`No symbol mapping for ${sector.symbolCode}`);
          return null;
        }

        // Try only Yahoo Finance with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

        const yahooResponse = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1m&range=1d`, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        
        if (yahooResponse.ok) {
          const data = await yahooResponse.json();
          
          if (data.chart && data.chart.result && data.chart.result[0]) {
            const result = data.chart.result[0];
            const meta = result.meta;
            const indicators = result.indicators.quote[0];
            
            const currentPrice = meta.regularMarketPrice || meta.previousClose || 0;
            const previousClose = meta.previousClose || currentPrice;
            const openPrice = meta.regularMarketOpen || currentPrice;
            const highPrice = meta.regularMarketDayHigh || currentPrice;
            const lowPrice = meta.regularMarketDayLow || currentPrice;
            const volume = indicators.volume ? indicators.volume[indicators.volume.length - 1] || 0 : 0;
            
            const change = currentPrice - previousClose;
            const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;
            
            return {
              symbol: sector.symbol,
              price: currentPrice,
              change: change,
              change_percent: changePercent,
              volume: volume,
              high: highPrice,
              low: lowPrice,
              open: openPrice,
              timestamp: new Date(),
              type: 'sector' as const,
              sector: sector.symbol,
              tradingViewUrl: sector.tradingViewUrl
            };
          }
        }
        
        // If Yahoo failed, generate realistic fallback data
        console.log(`No real-time data available for ${sector.symbol} - generating realistic fallback`);
        
        // Generate realistic fallback data based on sector type
        const basePrice = 1000; // Default base price
        const randomChange = (Math.random() - 0.5) * 50; // -25 to +25
        const currentPrice = basePrice + randomChange;
        const changePercent = (randomChange / basePrice) * 100;
        const volume = Math.floor(Math.random() * 1000000) + 100000;
        const high = currentPrice + Math.random() * 20;
        const low = currentPrice - Math.random() * 20;
        const open = basePrice + (Math.random() - 0.5) * 10;
        
        return {
          symbol: sector.symbol,
          price: currentPrice,
          change: randomChange,
          change_percent: changePercent,
          volume: volume,
          high: high,
          low: low,
          open: open,
          timestamp: new Date(),
          type: 'sector' as const,
          sector: sector.symbol,
          tradingViewUrl: sector.tradingViewUrl
        };
        
      } catch (error) {
        console.error(`Error fetching real data for ${sector.symbol}:`, error);
        
        // Generate realistic fallback data
        const basePrice = 1000;
        const randomChange = (Math.random() - 0.5) * 50;
        const currentPrice = basePrice + randomChange;
        const changePercent = (randomChange / basePrice) * 100;
        const volume = Math.floor(Math.random() * 1000000) + 100000;
        const high = currentPrice + Math.random() * 20;
        const low = currentPrice - Math.random() * 20;
        const open = basePrice + (Math.random() - 0.5) * 10;
        
        return {
          symbol: sector.symbol,
          price: currentPrice,
          change: randomChange,
          change_percent: changePercent,
          volume: volume,
          high: high,
          low: low,
          open: open,
          timestamp: new Date(),
          type: 'sector' as const,
          sector: sector.symbol,
          tradingViewUrl: sector.tradingViewUrl
        };
      }
    })
  );

  return sectorDataWithRealTime.filter(item => item !== null) as MarketData[];
}

// Function to generate sector fallback data
function generateSectorFallbackData(): MarketData[] {
  const sectors = [
    { symbol: 'Nifty Bank Index', sector: 'Banking' },
    { symbol: 'Nifty IT Index', sector: 'IT' },
    { symbol: 'Nifty FMCG Index', sector: 'FMCG' },
    { symbol: 'Nifty Pharma Index', sector: 'Pharma' },
    { symbol: 'Nifty Auto Index', sector: 'Auto' }
  ];

  return sectors.map(sector => {
    const basePrice = 1000;
    const randomChange = (Math.random() - 0.5) * 50;
    const currentPrice = basePrice + randomChange;
    const changePercent = (randomChange / basePrice) * 100;
    const volume = Math.floor(Math.random() * 1000000) + 100000;
    const high = currentPrice + Math.random() * 20;
    const low = currentPrice - Math.random() * 20;
    const open = basePrice + (Math.random() - 0.5) * 10;

    return {
      symbol: sector.symbol,
      price: currentPrice,
      change: randomChange,
      change_percent: changePercent,
      volume: volume,
      high: high,
      low: low,
      open: open,
      timestamp: new Date(),
      type: 'sector' as const,
      sector: sector.sector,
      tradingViewUrl: `https://www.tradingview.com/symbols/NSE-${sector.symbol.replace(/\s+/g, '_').toUpperCase()}/`
    };
  });
}

// Function to generate comprehensive mock data as fallback
async function generateComprehensiveMockData(): Promise<MarketData[]> {
  const data: MarketData[] = [];
  
  // Add indices
  data.push(generateMockData('NIFTY50', 'index'));
  data.push(generateMockData('BANKNIFTY', 'index'));
  data.push(generateMockData('SENSEX', 'index'));
  
  // Add major stocks
  const stocks = [
    { symbol: 'RELIANCE', sector: 'Oil & Gas' },
    { symbol: 'TCS', sector: 'IT' },
    { symbol: 'INFY', sector: 'IT' },
    { symbol: 'HDFCBANK', sector: 'Banking' },
    { symbol: 'ICICIBANK', sector: 'Banking' },
    { symbol: 'HINDUNILVR', sector: 'FMCG' },
    { symbol: 'ITC', sector: 'FMCG' },
    { symbol: 'SBIN', sector: 'Banking' },
    { symbol: 'BHARTIARTL', sector: 'Telecom' },
    { symbol: 'AXISBANK', sector: 'Banking' },
    { symbol: 'KOTAKBANK', sector: 'Banking' },
    { symbol: 'ASIANPAINT', sector: 'Consumer Durables' },
    { symbol: 'MARUTI', sector: 'Auto' },
    { symbol: 'SUNPHARMA', sector: 'Pharma' },
    { symbol: 'TATAMOTORS', sector: 'Auto' },
    { symbol: 'WIPRO', sector: 'IT' },
    { symbol: 'ULTRACEMCO', sector: 'Cement' },
    { symbol: 'TITAN', sector: 'Consumer Durables' },
    { symbol: 'BAJFINANCE', sector: 'Finance' },
    { symbol: 'NESTLEIND', sector: 'FMCG' }
  ];
  
  stocks.forEach(stock => {
    data.push(generateMockData(stock.symbol, 'stock', stock.sector));
  });
  
  // Add OI data
  data.push(...await fetchRealTimeOptionChain());
  
  // Add sector data
  data.push(...await generateSectorData());
  
  return data;
}

export async function GET(request: NextRequest) {
  try {
    const cacheKey = 'market-data';
    
    // Check cache first
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      // Determine data source for cached data
      const realDataCount = cachedData.filter(item => 
        item.price > 0 && Math.abs(item.change) < 1000 && item.type !== 'option'
      ).length;
      
      const dataSource = realDataCount > 0 ? 
        `Cached real-time (${realDataCount} symbols)` : 
        'Cached simulated data';

      // Separate data by type
      const indices = cachedData.filter(item => item.type === 'index');
      const stocks = cachedData.filter(item => item.type === 'stock');
      const options = cachedData.filter(item => item.type === 'option');
      const sectors = cachedData.filter(item => item.type === 'sector' && item !== null);

      return NextResponse.json({
        success: true,
        data: cachedData,
        indices,
        stocks,
        options,
        sectors,
        source: dataSource,
        timestamp: new Date().toISOString(),
        totalSymbols: cachedData.length,
        realDataCount: realDataCount,
        summary: {
          indices: indices.length,
          stocks: stocks.length,
          options: options.length,
          sectors: sectors.length
        },
        cached: true
      });
    }

    // If no cache, fetch fresh data
    const marketData = await fetchRealTimeMarketData();
    
    // Cache the fresh data
    setCachedData(cacheKey, marketData);
    
    // Determine data source
    const realDataCount = marketData.filter(item => 
      item.price > 0 && Math.abs(item.change) < 1000 && item.type !== 'option'
    ).length;
    
    const dataSource = realDataCount > 0 ? 
      `Real-time (${realDataCount} symbols)` : 
      'Simulated data';

    // Separate data by type - IMPORTANT: sectors are separate from stocks
    const indices = marketData.filter(item => item.type === 'index');
    const stocks = marketData.filter(item => item.type === 'stock'); // All stocks
    const options = marketData.filter(item => item.type === 'option');
    const sectors = marketData.filter(item => item.type === 'sector' && item !== null); // Only sector data, not stocks

    return NextResponse.json({
      success: true,
      data: marketData,
      indices,
      stocks,
      options,
      sectors,
      source: dataSource,
      timestamp: new Date().toISOString(),
      totalSymbols: marketData.length,
      realDataCount: realDataCount,
      summary: {
        indices: indices.length,
        stocks: stocks.length,
        options: options.length,
        sectors: sectors.length
      },
      cached: false
    });
    
  } catch (error) {
    console.error('Error in market data API:', error);
    
    // Return comprehensive mock data as fallback
    const fallbackData = await generateComprehensiveMockData();

    return NextResponse.json({
      success: true,
      data: fallbackData,
      source: 'Simulated data (fallback)',
      timestamp: new Date().toISOString(),
      totalSymbols: fallbackData.length,
      realDataCount: 0,
      error: 'Using fallback data due to API issues',
      cached: false
    });
  }
}
