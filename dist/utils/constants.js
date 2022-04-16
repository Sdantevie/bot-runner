"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultTradeSettings = exports.platformBinanceApiSecretKey = exports.platformBinanceApiKey = exports.redisUrl = exports.devDbUrl = void 0;
exports.devDbUrl = 'mongodb+srv://enodaniel:d4ni3l92@cluster0.on3tt.mongodb.net/markings?retryWrites=true&w=majority';
exports.redisUrl = 'rediss://default:MEAW6r8vsOR03vO9@db-redis-nyc3-50704-do-user-4312025-0.b.db.ondigitalocean.com:25061';
exports.platformBinanceApiKey = 'pxS1eusZnLrhMqfTvgSN8H6C6KTCyWT5HuDiW6umMjgdnFVJqd9zh6ahDkglSyyo';
exports.platformBinanceApiSecretKey = 'MMbYKIEgqL9c9eOcycPqgUBFmwJ1urEfR2RIavm7Ob2VWK6r1qt5Nfz0kZBon8FW';
exports.defaultTradeSettings = {
    trade_type: "Cycle",
    first_buy_amount: 10,
    open_position_doubled: false,
    margin_call_limit: 7,
    whole_position_take_profit_ratio: 1.3,
    whole_position_take_profit_callback: 0.8,
    buy_in_callback: 0.5,
    is_paused: true,
    is_running_margin_call: true,
    margin_config: [
        {
            margin_call_drop: 3.5,
            multiple_buy_in_ratio: 2,
        },
        {
            margin_call_drop: 4,
            multiple_buy_in_ratio: 4,
        },
        {
            margin_call_drop: 4.5,
            multiple_buy_in_ratio: 8,
        },
        {
            margin_call_drop: 5.2,
            multiple_buy_in_ratio: 16,
        },
        {
            margin_call_drop: 8,
            multiple_buy_in_ratio: 32,
        },
        {
            margin_call_drop: 10,
            multiple_buy_in_ratio: 64,
        },
        {
            margin_call_drop: 12,
            multiple_buy_in_ratio: 128,
        },
    ],
};
