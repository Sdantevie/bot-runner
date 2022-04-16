"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeFactory = void 0;
const binanceConnector_1 = __importDefault(require("./binanceConnector"));
const houbiConnector_1 = __importDefault(require("./houbiConnector"));
class ExchangeFactory {
    static getExchangeBroker(exchange, connectionDetails) {
        exchange = exchange.toLowerCase();
        if (exchange == 'binance') {
            return new binanceConnector_1.default(connectionDetails.binance);
        }
        if (exchange == 'huobi') {
            return new houbiConnector_1.default(connectionDetails.huobi);
        }
    }
}
exports.ExchangeFactory = ExchangeFactory;
