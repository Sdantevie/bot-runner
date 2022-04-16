import { buyData, IExchange } from "./exchangeUtils";

export default class HuobiBroker implements IExchange {
    _houbi: any
    constructor(apiConnection: any) {

    }

    async createBuyOrder(buyData: buyData) {
        return {
            success: false
        };
    }
    createSellOrder() {
        throw new Error("Method not implemented.");
    }

}