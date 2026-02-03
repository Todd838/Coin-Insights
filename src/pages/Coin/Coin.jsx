import React from 'react'
import './Coin.css'
import { useParams } from 'react-router-dom'

const Coin = () => {

    const {coinId} = useParams();
    const [coinData, setCoinData] = useState();
    const {currency} = useContext(CoinContext);

    const fetchCoinData = async ()=>{
        const options = {
            method: 'GET', 
            headers: {'x-cg-demo-api-key': 'CG-dGjsqM8SUfwusmz3fyf74kTc'}
        };

        fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`, options)
            .then(res => res.json())
            .then(res => setCoinData(res))
            .catch(err => console.error(err));
}

useEffect(()=>{
    fetchCoinData();
},[currency])

if(coinData){
return (
    <div className='coin'>
        <div className="coin-namee">
            <img src={coinData.image.large} alt="" />
            <p><b>{coinData.name} ({coinData.symbol.toUpperCase()})</b></p>
        </div>
    </div>
  )
}else{
    return (
        <div className='spinner'>
            <div className="spin"></div>
        </div>
    )

}

}

export default Coin