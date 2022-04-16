"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tradeManager_1 = require("./bot-engine/tradeManager");
const priceStoreManager_1 = require("./bot-engine/priceStoreManager");
const port = process.env.PORT || 3515;
(async () => {
    // await mongoose.connect(devDbUrl);
    (0, tradeManager_1.botRunner)();
    (0, priceStoreManager_1.priceStoreRunner)();
})();
