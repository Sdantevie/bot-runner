export const binanceCurrencyPair = [
    '1inchusdt',
        'aaveusdt',
        'adausdt',
        'akrousdt',
        'antusdt',
        'atomusdt',
        'audiousdt',
        'batusdt',
        'bchusdt',
        'bnbusdt',
        'btcstusdt',
        'btcusdt',
        'cakeusdt',
        'compusdt',
        'cosusdt',
        'crvusdt',
        'dashusdt',
        'dogeusdt',
        'dotusdt',
        'eosusdt',
        'etcusdt',
        'filusdt',
        'fttusdt',
        'grtusdt',
        'iostusdt',
        'iotausdt',
        'jstusdt',
        'kavausdt',
        'linkusdt',
        'litusdt',
        'ltcusdt',
        'lunausdt',
        'manausdt',
        'maticusdt',
        'mdxusdt',
        'neousdt',
        'omgusdt',
        'ontusdt',
        'reefusdt',
        'rsrusdt',
        'sandusdt',
        'solusdt',
        'sushiusdt',
        'sxpusdt',
        'thetausdt',
        'trxusdt',
        'uniusdt',
        'vetusdt',
        'xemusdt',
        'xmrusdt',
        'xrpusdt',
        'xtzusdt',
        'yfiiusdt',
        'yfiusdt',
        'zecusdt',
        'zenusdt'
];

// moonsh0tCrytpo

export const coinList = (exchange: string) => {
    if(exchange.toLowerCase() == 'binance') return binanceCurrencyPair;
    if(exchange.toLowerCase() == 'huobi') return huobiCurrencyPair;
    return [];
}

export const huobiCurrencyPair = [
    '1inchusdt',
    'aaveusdt',
    'adausdt',
    'akrousdt',
    'antusdt',
    'atomusdt',
    'batusdt',
    'bchusdt',
    'bethusdt',
    'bsvusdt',
    'btcusdt',
    'compusdt',
    'crvusdt',
    'dashusdt',
    'dogeusdt',
    'dotusdt',
    'eosusdt',
    'etcusdt',
    'filusdt',
    'fttusdt',
    'grtusdt',
    'htusdt',
    'iostusdt',
    'iotausdt',
    'jstusdt',
    'kavausdt',
    'lunausdt',
    'linkusdt',
    'litusdt',
    'ltcusdt',
    'manausdt',
    'maticusdt',
    'mdxusdt',
    'neousdt',
    'omgusdt',
    'ontusdt',
    'reefusdt',
    'rsrusdt',
    'sandusdt',
    'solusdt',
    'sunusdt',
    'sushiusdt',
    'thetausdt',
    'trxusdt',
    'uniusdt',
    'xemusdt',
    'xmrusdt',
    'xrpusdt',
    'xtzusdt',
    'yfiiusdt',
    'yfiusdt',
    'zecusdt',
    'zenusdt'
]
