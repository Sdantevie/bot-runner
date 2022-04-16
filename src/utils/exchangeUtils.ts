import BinanceBroker from "./binanceConnector";
import HuobiBroker from "./houbiConnector";

export type buyData = {
    coin_id: string,
    margin_call_number: number,
    amount: number,
    user_id: number
}

export type buyResponse = {
    success: boolean,
    entryPrice?: number,
    quantity?: number,
}

export interface IExchange {
    createBuyOrder(buyData: buyData): Promise<buyResponse>;
    createSellOrder(sellData: any): any;
}

export class ExchangeFactory {
    static getExchangeBroker(exchange: string, connectionDetails: { binance?: any, huobi?: any }): IExchange {
        exchange = exchange.toLowerCase();
        if(exchange == 'binance'){
            return new BinanceBroker(connectionDetails.binance);
        }

        if(exchange == 'huobi') {
            return new HuobiBroker(connectionDetails.huobi)
        }
    }
}