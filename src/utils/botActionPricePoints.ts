import { marginConfig } from "../@types/payloads";

export const takeProfitRatioPrice = (config: any, entryPrice: any) => {
    const ratio = config.whole_position_take_profit_ratio;
    const increase = (ratio / 100) * entryPrice;
    return (increase + entryPrice).toFixed(4);
}



export const  nextMarginCallPrice = (config: any, entryPrice: number, margin_call: number) => {
    const margin_config = config.margin_config[margin_call] as marginConfig;
    if(margin_config) {
        const ratio = margin_config.margin_call_drop;
        const decrease = (ratio / 100) * entryPrice;
        return (entryPrice - decrease).toFixed(4)
    } else {
        return -1;
    }
}

export const  botActionPricePoints = (config: any, entryPrice: number, margin_call = 0) => {
    const whole_position_take_profit_ratio_price = takeProfitRatioPrice(config, entryPrice);
    const next_margin_call_price = nextMarginCallPrice(config, entryPrice, margin_call);

    return {
        whole_position_take_profit_ratio_price,
        next_margin_call_price
    }
}

export const takeProfitCallbackPrice = (callbackRatio: number, referencePrice: number) => {
    const decrease = (callbackRatio / 100) * referencePrice;
    return (referencePrice - decrease)
}