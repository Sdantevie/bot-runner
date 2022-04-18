"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unsubscribeStream = exports.binancePriceStream = void 0;
const botLogs_1 = require("../data/models/botLogs");
const tradeLogs_1 = require("../data/models/tradeLogs");
const constants_1 = require("./constants");
const { Spot } = require('@binance/connector');
const mockResponse = { "symbol": "ADAUSDT", "orderId": 3105145286, "orderListId": -1, "clientOrderId": "7UYdJlUiBAbRPiRNYcXkTn", "transactTime": 1649754391944, "price": "0.00000000", "origQty": "21.00000000", "executedQty": "21.00000000", "cummulativeQuoteQty": "19.90800000", "status": "FILLED", "timeInForce": "GTC", "type": "MARKET", "side": "BUY", "fills": [{ "price": "0.94800000", "qty": "21.00000000", "commission": "0.02100000", "commissionAsset": "ADA", "tradeId": 368211986 }] };
class BinanceBroker {
    constructor(apiConnection) {
        this._binanceClient = new Spot(apiConnection.api_key, apiConnection.api_secret);
    }
    async createBuyOrder(buyData) {
        // return {
        //     success: true,
        //     entryPrice: 150.69,
        //     quantity: 25
        // }
        try {
            const response = await this._binanceClient.newOrder(buyData.coin_id, "BUY", "MARKET", {
                quoteOrderQty: buyData.amount,
            });
            // const response = { data: mockResponse, message: 'bought' };
            if ('data' in response) {
                const binanceResponse = response.data;
                const entryPrice = Number.parseFloat(binanceResponse.price) > 0 ? Number.parseFloat(binanceResponse.price) : Number.parseFloat(binanceResponse.fills[0].price);
                const tradeLogPayload = {
                    coin_id: buyData.coin_id,
                    exchange: 'binance',
                    user_id: buyData.user_id,
                    order_type: 'BUY',
                    average_price: entryPrice,
                    margin_call_number: buyData.margin_call_number,
                    filled_quantity: binanceResponse.executedQty,
                    order_number: binanceResponse.orderId,
                    open_position_limit: 'MARKET',
                    api_response: binanceResponse
                };
                const tradeLog = new tradeLogs_1.tradeLogModel(tradeLogPayload);
                await tradeLog.save();
                return {
                    success: true,
                    entryPrice,
                    quantity: Number.parseFloat(binanceResponse.fills[0].qty)
                };
            }
            else {
                const botLogPayload = {
                    user_id: buyData.user_id,
                    coin_id: buyData.coin_id,
                    exchange: 'binance',
                    action: `Opening ${buyData.coin_id} trade with ${buyData.amount} usdt`,
                    message: response.message,
                    info: response.message
                };
                const botLog = new botLogs_1.botLogModel(botLogPayload);
                await botLog.save();
                return {
                    success: false
                };
            }
        }
        catch (e) {
            const botLogPayload = {
                user_id: buyData.user_id,
                coin_id: buyData.coin_id,
                exchange: 'binance',
                action: `Opening ${buyData.coin_id} trade with ${buyData.amount} usdt`,
                message: 'Failed to open position',
                info: e
            };
            const botLog = new botLogs_1.botLogModel(botLogPayload);
            await botLog.save();
            return {
                success: false
            };
        }
    }
    async createSellOrder(sellData) {
        // return {
        //     success: true
        // }
        try {
            const response = await this._binanceClient.newOrder(sellData.coin_id, "SELL", "MARKET", {
                quoteOrderQty: sellData.amount,
            });
            if ('data' in response) {
                const binanceResponse = response.data;
                const tradeLogPayload = {
                    coin_id: sellData.coin_id,
                    exchange: 'binance',
                    user_id: sellData.user_id,
                    order_type: 'SELL',
                    average_price: binanceResponse.price,
                    margin_call_number: sellData.margin_call_number,
                    filled_quantity: binanceResponse.executedQty,
                    order_number: binanceResponse.orderId,
                    open_position_limit: 'MARKET',
                    api_response: binanceResponse,
                };
                const tradeLog = new tradeLogs_1.tradeLogModel(tradeLogPayload);
                await tradeLog.save();
                return {
                    success: true,
                    entryPrice: binanceResponse.price
                };
            }
            else {
                const botLogPayload = {
                    user_id: sellData.user_id,
                    coin_id: sellData.coin_id,
                    exchange: 'binance',
                    action: `Opening ${sellData.coin_id} trade with ${sellData.amount} usdt`,
                    message: response.message,
                    info: response.message
                };
                const botLog = new botLogs_1.botLogModel(botLogPayload);
                await botLog.save();
                return {
                    success: false
                };
            }
        }
        catch (e) {
            const botLogPayload = {
                user_id: sellData.user_id,
                coin_id: sellData.coin_id,
                exchange: 'binance',
                action: `Opening ${sellData.coin_id} trade with ${sellData.amount} usdt`,
                message: 'Failed to open position',
                info: e
            };
            const botLog = new botLogs_1.botLogModel(botLogPayload);
            await botLog.save();
            return {
                success: false
            };
        }
    }
}
exports.default = BinanceBroker;
const binancePriceStream = async (symbols, callback) => {
    const platformClient = new Spot(constants_1.platformBinanceApiKey, constants_1.platformBinanceApiKey);
    return platformClient.combinedStreams(symbols, callback);
};
exports.binancePriceStream = binancePriceStream;
const unsubscribeStream = async (streamReference) => {
    const platformClient = new Spot(constants_1.platformBinanceApiKey, constants_1.platformBinanceApiKey);
    platformClient.unsubscribe(streamReference);
};
exports.unsubscribeStream = unsubscribeStream;
