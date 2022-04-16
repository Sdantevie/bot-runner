export type marginConfig = {
    margin_call_drop: number;
    multiple_buy_in_ratio: number
}
export interface startTradePayload {
    user_id: number,
    coin_id: string
    exchange: string,
    first_buy_amount: number,
    open_position_doubled: boolean
    margin_call_limit: number
    whole_position_take_profit_ratio: number
    whole_position_take_profit_callback: number
    buy_in_callback: number,
    margin_config: marginConfig[]
    trade_type: string,
    api_connection: {
        binance?: any,
        huobi?: any
    },
}

export interface stopTradePayload {
    user_id: number,
    coin_id: string
    exchange: string,
}

export interface getBotLogsPayload {
    user_id: number,
    coin_id: string
    exchange: string,
}

export interface coinListPayload  {
    user_id: number,
    exchange: string
}