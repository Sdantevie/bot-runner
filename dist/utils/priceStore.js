"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const constants_1 = require("./constants");
const currencyPairs_1 = require("./currencyPairs");
const binanceConnector_1 = require("./binanceConnector");
class PriceStore {
    constructor() {
        this._redisClient = (0, redis_1.createClient)({
            url: constants_1.redisUrl
        });
    }
    static get Instance() {
        if (!this._instance) {
            this._instance = new PriceStore();
            this._instance.initPriceStore();
        }
        return this._instance;
    }
    async initPriceStore() {
        await this._redisClient.connect();
    }
    async getPrice(exchange, coin_id) {
        const priceKey = `${exchange.toLowerCase()}:${coin_id}:price`;
        return await this._redisClient.get(priceKey);
    }
    async getChange(exchange, coin_id) {
        const changeKey = `${exchange.toLowerCase()}:${coin_id}:change`;
        return await this._redisClient.get(changeKey);
    }
    async binanceDataStore() {
        const parsedSymbols = currencyPairs_1.binanceCurrencyPair.map(pair => `${pair}@ticker`);
        const callbacks = {
            message: async (data) => {
                const parsedData = JSON.parse(data);
                const stream = parsedData[Object.keys(parsedData)[0]].split('@')[0];
                const price = parsedData[Object.keys(parsedData)[1]].c;
                const change = parsedData[Object.keys(parsedData)[1]].P;
                const key = `binance:${stream}:price`;
                const changeKey = `binance:${stream}:change`;
                this._redisClient.set(key, price);
                this._redisClient.set(changeKey, change);
            }
        };
        const streamReference = await (0, binanceConnector_1.binancePriceStream)(parsedSymbols, callbacks);
        setTimeout(() => {
            (0, binanceConnector_1.unsubscribeStream)(streamReference);
        }, 5000);
        return true;
    }
}
exports.default = PriceStore;
