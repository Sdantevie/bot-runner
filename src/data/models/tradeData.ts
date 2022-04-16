import mongoose from 'mongoose';

const tradeDataSchema = new mongoose.Schema({
    user_id: {
        type: Number,
        required: true
    },
    coin_id: {
        type: String,
        required: true,
    },
    api_connection: {
        type: String,
        get: function(data: any) {
            try { 
                return JSON.parse(data);
            } catch(error) { 
                return data;
            }
        },
        set: function(data: any) {
            return JSON.stringify(data);
        }
    },
    exchange: {
        type: String,
        required: true
    },

    first_buy_amount: {
        type: Number,
        required: true,
    },

    entry_price: Number,
    closing_price: Number,

    has_closed_trade: Boolean,

    has_passed_take_profit_ratio: Boolean,

    open_position_doubled: {
        type: Boolean
    },

    is_trading: {
        type: Boolean
    },

    is_running_margin_call: {
        type: Boolean
    },

    margin_call_limit: {
        type: Number
    },

    whole_position_take_profit_ratio: {
        type: Number
    },

    whole_position_take_profit_callback: {
        type: Number
    },

    buy_in_callback: {
        type: Number
    },

    margin_config: {
        type: Array
    },

    trade_type: {
        type: String,
    },

    sub_position_take_profit_callback: {
        type: Number
    },

    whole_position_take_profit_ratio_price: {
        type: Number
    },

    is_paused: {
        type: Boolean
    },

    current_price_after_take_profit_ratio: {
        type: Number
    },

    next_margin_call_price: {
        type: Number
    },

    close_trade_price: {
        type: Number
    },

    current_margin: {
        type: Number
    },

    current_quantity: {
        type: Number
    },

    current_buy_amount: {
        type: Number
    },

    current_buy_price: Number,

    trade_history: {
        type: Array
    }
});



const tradeDataModel = mongoose.model('TradeData', tradeDataSchema);

export { tradeDataModel }