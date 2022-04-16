"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.takeProfitCallbackPrice = exports.botActionPricePoints = exports.nextMarginCallPrice = exports.takeProfitRatioPrice = void 0;
const takeProfitRatioPrice = (config, entryPrice) => {
    const ratio = config.whole_position_take_profit_ratio;
    const increase = (ratio / 100) * entryPrice;
    return (increase + entryPrice).toFixed(4);
};
exports.takeProfitRatioPrice = takeProfitRatioPrice;
const nextMarginCallPrice = (config, entryPrice, margin_call) => {
    const margin_config = config.margin_config[margin_call];
    if (margin_config) {
        const ratio = margin_config.margin_call_drop;
        const decrease = (ratio / 100) * entryPrice;
        return (entryPrice - decrease).toFixed(4);
    }
    else {
        return -1;
    }
};
exports.nextMarginCallPrice = nextMarginCallPrice;
const botActionPricePoints = (config, entryPrice, margin_call = 0) => {
    const whole_position_take_profit_ratio_price = (0, exports.takeProfitRatioPrice)(config, entryPrice);
    const next_margin_call_price = (0, exports.nextMarginCallPrice)(config, entryPrice, margin_call);
    return {
        whole_position_take_profit_ratio_price,
        next_margin_call_price
    };
};
exports.botActionPricePoints = botActionPricePoints;
const takeProfitCallbackPrice = (callbackRatio, referencePrice) => {
    const decrease = (callbackRatio / 100) * referencePrice;
    return (referencePrice - decrease);
};
exports.takeProfitCallbackPrice = takeProfitCallbackPrice;
