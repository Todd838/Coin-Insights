import { createContext, useEffect, useState} from 'react';

export const CoinContext = createContext();

const CoinContextProvider = (props) => {

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

        fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency.name}&order=market_cap_desc&per_page=10&page=1&price_change_percentage=1h`, options)
        .then(res => res.json())
        .then(res => {
            console.log('API response:', res);
            setAllCoin(res)
        })
        .catch(err => console.error('API error:', err));
    
    }

useEffect(()=>{
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