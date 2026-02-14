import { createContext, useEffect, useState} from 'react';

export const CoinContext = createContext();

const CoinContextProvider = (props) => {

    console.log('🎬 CoinContextProvider initialized');

    const [allCoin, setAllCoin] = useState([]);
    const [currency, setCurrency] = useState({
        name: "usd",
        symbol: "$"
    })

    const fetchAllCoin = async() => {
        const options = {
            method: 'GET', 
            headers: {'x-cg-demo-api-key': 
            'CG-dGjsqM8SUfwusmz3fyf74kTc'}
        };

        console.log('🔄 Fetching coins from CoinGecko...');
        console.log('Currency:', currency.name);
        
        // Test with just first page
        try {
            const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency.name}&order=market_cap_desc&per_page=250&page=1&sparkline=false`;
            console.log('Test fetch URL:', url);
            
            const response = await fetch(url, options);
            console.log('Response status:', response.status, response.statusText);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ HTTP Error ${response.status}:`, errorText);
                alert(`CoinGecko API Error: ${response.status} ${response.statusText}\n\nThis might be due to:\n1. Invalid or expired API key\n2. Rate limiting\n3. Network/CORS issues\n\nCheck browser console for details.`);
                return;
            }
            
            const coins = await response.json();
            console.log('✅ First page loaded:', coins.length, 'coins');
            console.log('Sample coin:', coins[0]);
            
            if (coins.error) {
                console.error('❌ API Error:', coins.error);
                alert('API Error: ' + coins.error);
                return;
            }
            
            // For now, just load first page to test
            setAllCoin(coins);
            console.log('✅ Coins set in state:', coins.length);
            
            // Continue loading remaining pages
            let allCoins = [...coins];
            for (let page = 2; page <= 4; page++) {
                await new Promise(resolve => setTimeout(resolve, 1000));

                const pageUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency.name}&order=market_cap_desc&per_page=250&page=${page}&sparkline=false`;
                const pageResponse = await fetch(pageUrl, options);

                if (!pageResponse.ok) {
                    console.warn(`⚠️ Failed to load page ${page}, stopping here`);
                    break;
                }

                const pageCoins = await pageResponse.json();
                allCoins = [...allCoins, ...pageCoins];
                console.log(`✅ Page ${page}/4 loaded: ${pageCoins.length} coins (Total: ${allCoins.length})`);

                // Deduplicate by coin id after each page
                const seen = new Set();
                const uniqueCoins = allCoins.filter(coin => {
                    if (seen.has(coin.id)) {
                        console.log(`⚠️ Duplicate coin found: ${coin.id} (${coin.symbol})`);
                        return false;
                    }
                    seen.add(coin.id);
                    return true;
                });

                if (uniqueCoins.length !== allCoins.length) {
                    console.log(`🧹 Removed ${allCoins.length - uniqueCoins.length} duplicates (${allCoins.length} → ${uniqueCoins.length})`);
                    allCoins = uniqueCoins;
                }

                setAllCoin(allCoins);
            }

            console.log('✅ All coins loaded successfully:', allCoins.length);
        } catch (err) {
            console.error('❌ Error fetching coins:', err);
            console.error('Error details:', err.message);
            console.error('Error stack:', err.stack);
            alert('Failed to load coins from CoinGecko. Please check the console for details.\n\nError: ' + err.message);
        }
    }

useEffect(()=>{
    console.log('🔄 CoinContext useEffect triggered, currency:', currency.name);
    fetchAllCoin();
},[currency])

    const contextValue = {
        allCoin,
        currency,
        setCurrency
    }
    
    return (
    <CoinContext.Provider value={contextValue}>
        {props.children}
    </CoinContext.Provider>
    )
}

export default CoinContextProvider;