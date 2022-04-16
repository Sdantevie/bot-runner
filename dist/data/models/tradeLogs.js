"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tradeLogModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const tradeLogSchema = new mongoose_1.default.Schema({
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
        get: function (data) {
            try {
                return JSON.parse(data);
            }
            catch (error) {
                return data;
            }
        },
        set: function (data) {
            return JSON.stringify(data);
        }
    }
});
const tradeLogModel = mongoose_1.default.model('tradeLog', tradeLogSchema);
exports.tradeLogModel = tradeLogModel;
