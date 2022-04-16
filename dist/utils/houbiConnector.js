"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HuobiBroker {
    constructor(apiConnection) {
    }
    async createBuyOrder(buyData) {
        return {
            success: false
        };
    }
    createSellOrder() {
        throw new Error("Method not implemented.");
    }
}
exports.default = HuobiBroker;
