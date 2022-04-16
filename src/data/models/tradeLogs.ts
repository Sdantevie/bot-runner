import mongoose from 'mongoose';

const tradeLogSchema = new mongoose.Schema({
    user_id: {
        type: Number,
        required: true
    },
    coin_id: {
        type: String,
        required: true,
    },
    exchange: {
        type: String,
        required: true
    },
    profit: Number,
    margin_call_number: Number,
    average_price: Number,
    deal_amount: Number,
    filled_amount: String,
    order_type: String,
    order_number: Number,
    open_position_limit: String,
    api_response: {
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
    }
});

const tradeLogModel = mongoose.model('tradeLog', tradeLogSchema);

export { tradeLogModel }