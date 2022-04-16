import { createClient } from 'redis';
import { redisUrl } from "./constants";
import { binanceCurrencyPair } from "./currencyPairs";
import { binancePriceStream, unsubscribeStream } from "./binanceConnector";

export default class PriceStore {
    _redisClient: any
    private static _instance: PriceStore;
    private constructor() {
        this._redisClient = createClient({
            url: redisUrl
        });

    }

    public static get Instance() {
        if (!this._instance) {
            this._instance = new PriceStore();
            this._instance.initPriceStore();
        }
        return this._instance;
    }

    async initPriceStore(){
        await this._redisClient.connect();
    }

    async getPrice(exchange: string, coin_id: string) {
        const priceKey = `${exchange.toLowerCase()}:${coin_id}:price`;
        return await this._redisClient.get(priceKey);
    }

    async getChange(exchange: string, coin_id: string) {
        const changeKey = `${exchange.toLowerCase()}:${coin_id}:change`;
        return await this._redisClient.get(changeKey);
    }

    async binanceDataStore() {
        const parsedSymbols = binanceCurrencyPair.map(pair => `${pair}@ticker`);

        const callbacks = {
            message: async (data: any) => {
                const parsedData = JSON.parse(data);
                const stream = parsedData[Object.keys(parsedData)[0]].split('@')[0];
                const price = parsedData[Object.keys(parsedData)[1]].c
                const change = parsedData[Object.keys(parsedData)[1]].P;
                const key = `binance:${stream}:price`;
                const changeKey = `binance:${stream}:change`;
                this._redisClient.set(key, price);
                this._redisClient.set(changeKey, change);
            }
        }

        const streamReference = await binancePriceStream(parsedSymbols, callbacks);

        setTimeout(() => {
            unsubscribeStream(streamReference)
        }, 5000);
        return true
    }
}

