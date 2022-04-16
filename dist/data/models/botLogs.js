"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.botLogModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const botLogSchema = new mongoose_1.default.Schema({
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
    action: String,
    message: String,
    info: {
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
const botLogModel = mongoose_1.default.model('botLog', botLogSchema);
exports.botLogModel = botLogModel;
