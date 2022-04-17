"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tradeManager_1 = require("./bot-engine/tradeManager");
const priceStoreManager_1 = require("./bot-engine/priceStoreManager");
const mongoose_1 = __importDefault(require("mongoose"));
const constants_1 = require("./utils/constants");
const port = process.env.PORT || 3515;
(async () => {
    await mongoose_1.default.connect(constants_1.devDbUrl);
    (0, tradeManager_1.botRunner)();
    (0, priceStoreManager_1.priceStoreRunner)();
})();
