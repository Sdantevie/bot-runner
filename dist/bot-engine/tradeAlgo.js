"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tradeData_1 = require("../data/models/tradeData");
const tradeLogs_1 = require("../data/models/tradeLogs");
const botActionPricePoints_1 = require("../utils/botActionPricePoints");
const exchangeUtils_1 = require("../utils/exchangeUtils");
const priceComparator_1 = require("../utils/priceComparator");
const priceStore_1 = __importDefault(require("../utils/priceStore"));
const worker_threads_1 = require("worker_threads");
const mongoose_1 = __importDefault(require("mongoose"));
const constants_1 = require("../utils/constants");
const runTrade = async (tradeData) => {
    const currentPrice = await priceStore_1.default.Instance.getPrice(tradeData.exchange, tradeData.coin_id);
    // console.log(currentPrice);
    // const currentPrice = 1.02
    if (tradeData.has_closed_trade && tradeData.trade_type == 'Cycle') {
        const buyBackPriceDifference = (0, priceComparator_1.comparePrices)(currentPrice, tradeData.closing_price);
        if ((buyBackPriceDifference.differenceLevel == priceComparator_1.differenceLevel.LESS)
            || buyBackPriceDifference.differenceLevel == priceComparator_1.differenceLevel.SAME) {
            //initiate buy back, recalculate actionPricePoints, clear history, set_current_margin -- (done)
            const exchange = exchangeUtils_1.ExchangeFactory.getExchangeBroker(tradeData.exchange, reinforcedParser(tradeData.api_connection));
            const buyBackData = {
                user_id: tradeData.user_id,
                coin_id: tradeData.coin_id,
                amount: tradeData.open_position_doubled ? tradeData.first_buy_amount * 2 : tradeData.first_buy_amount,
                margin_call_number: 0
            };
            const buyResponse = await exchange.createBuyOrder(buyBackData);
            if (buyResponse.success) {
                const priceActionPoints = (0, botActionPricePoints_1.botActionPricePoints)(tradeData, buyResponse.entryPrice);
                const payload = Object.assign(Object.assign(Object.assign({}, tradeData), priceActionPoints), { has_passed_take_profit_ratio: false, has_closed_trade: false, api_connection: JSON.parse(tradeData.api_connection), trade_history: [], current_margin: 0, current_quantity: buyResponse.quantity, current_buy_amount: buyBackData.amount, entry_price: buyResponse.entryPrice, current_buy_price: buyResponse.entryPrice, closing_price: undefined, current_price_after_take_profit_ratio: undefined });
                await tradeData_1.tradeDataModel.updateOne({ coin_id: tradeData.coin_id, user_id: tradeData.user_id, exchange: tradeData.exchange }, payload);
            }
        }
        return;
    }
    if (tradeData.has_passed_take_profit_ratio) {
        //calculate the take_profit_callback_price -- (done)
        const newTakeProfitCallbackPrice = (0, botActionPricePoints_1.takeProfitCallbackPrice)(tradeData.whole_position_take_profit_callback, tradeData.current_price_after_take_profit_ratio);
        const takeProfitCallbackCompare = (0, priceComparator_1.comparePrices)(currentPrice, newTakeProfitCallbackPrice);
        if ((takeProfitCallbackCompare.differenceLevel == priceComparator_1.differenceLevel.LESS)
            || (takeProfitCallbackCompare.differenceLevel == priceComparator_1.differenceLevel.SAME)) {
            // sell off -- (done)
            // set has_closed_trade && pause_trade if its oneshot && closing_price -- (done)
            let sellAmount = 0;
            tradeData.trade_history.forEach((entry) => {
                sellAmount += entry.buyAmount;
            });
            sellAmount += tradeData.current_buy_amount;
            const exchange = exchangeUtils_1.ExchangeFactory.getExchangeBroker(tradeData.exchange, reinforcedParser(tradeData.api_connection));
            const sellData = {
                user_id: tradeData.user_id,
                coin_id: tradeData.coin_id,
                amount: sellAmount,
                margin_call_number: tradeData.current_margin
            };
            const sellResponse = await exchange.createSellOrder(sellData);
            if (sellResponse.success) {
                const profit = calculateProfit(getAveragePrice(tradeData), currentPrice, tradeData);
                if (tradeData.trade_type == 'Cycle') {
                    const payload = {
                        has_closed_trade: true,
                        closing_price: currentPrice
                    };
                    await tradeData_1.tradeDataModel.updateOne({ coin_id: tradeData.coin_id, user_id: tradeData.user_id, exchange: tradeData.exchange }, payload);
                }
                else {
                    await tradeData_1.tradeDataModel.deleteOne({ coin_id: tradeData.coin_id, user_id: tradeData.user_id, exchange: tradeData.exchange });
                }
                await tradeLogs_1.tradeLogModel.updateOne({ coin_id: tradeData.coin_id, user_id: tradeData.user_id, exchange: tradeData.exchange }, { profit });
            }
        }
        else {
            //update only when price is going up
            if (currentPrice > tradeData.current_price_after_take_profit_ratio) {
                //update current_price_after_take_profit_ratio -- (done)
                await tradeData_1.tradeDataModel.updateOne({ coin_id: tradeData.coin_id, user_id: tradeData.user_id, exchange: tradeData.exchange }, { current_price_after_take_profit_ratio: currentPrice });
            }
        }
        return;
    }
    const takeProfitPriceCompare = (0, priceComparator_1.comparePrices)(currentPrice, tradeData.whole_position_take_profit_ratio_price);
    if ((takeProfitPriceCompare.differenceLevel == priceComparator_1.differenceLevel.GREATER)
        || (takeProfitPriceCompare.differenceLevel == priceComparator_1.differenceLevel.SAME)) {
        //set has passed take_profit_ratio && current_price_after_take_profit_ratio -- (done)
        const payload = {
            has_passed_take_profit_ratio: true,
            current_price_after_take_profit_ratio: currentPrice
        };
        await tradeData_1.tradeDataModel.updateOne({ coin_id: tradeData.coin_id, user_id: tradeData.user_id, exchange: tradeData.exchange }, payload);
        return;
    }
    if (tradeData.is_running_margin_call) {
        //greater than minues one implies that next margin exist.
        if (tradeData.next_margin_call_price > -1) {
            const nextMarginCallPriceCompare = (0, priceComparator_1.comparePrices)(currentPrice, tradeData.next_margin_call_price, 0.1);
            if ((nextMarginCallPriceCompare.differenceLevel == priceComparator_1.differenceLevel.SAME)
                || (nextMarginCallPriceCompare.differenceLevel == priceComparator_1.differenceLevel.LESS && nextMarginCallPriceCompare.actionable)) {
                //buy back,  recalculate take_profit and next_margin_Call price. -- (done)
                //move all details into history -- (done)
                const newMarginCallIndex = tradeData.current_margin; //due to first buy current margin index is the next margin
                const callMarginConfig = tradeData.margin_config[newMarginCallIndex];
                const newBuyAmount = tradeData.first_buy_amount * callMarginConfig.multiple_buy_in_ratio;
                const buyBackData = {
                    user_id: tradeData.user_id,
                    coin_id: tradeData.coin_id,
                    amount: newBuyAmount,
                    margin_call_number: newMarginCallIndex
                };
                const exchange = exchangeUtils_1.ExchangeFactory.getExchangeBroker(tradeData.exchange, reinforcedParser(tradeData.api_connection));
                const buyResponse = await exchange.createBuyOrder(buyBackData);
                if (buyResponse.success) {
                    /**
                     * personally, i think this will make the bot always close off at  a loss
                     * average of margin call entryprices cannot be higher than the initial entry price. calculating take profit ratio on that basis
                     * will result in a lower value. no matter the multiple_buy_in_raio. bot will sell off all assets at a loss.
                     *
                     * leavng the original take profit ratio will result in bigger profit
                     */
                    // calculate average price
                    let totalPriceEntry = 0;
                    tradeData.trade_history.forEach((entry) => {
                        totalPriceEntry += entry.buyPrice;
                    });
                    totalPriceEntry += tradeData.current_buy_price;
                    totalPriceEntry += buyResponse.entryPrice; //newest buy.
                    const currentAveragePrice = totalPriceEntry / (tradeData.trade_history.length + 1);
                    const newTakeProfitRatioPrice = (0, botActionPricePoints_1.takeProfitRatioPrice)(tradeData, currentAveragePrice);
                    const nexMarginCallTriggerPrice = (0, botActionPricePoints_1.nextMarginCallPrice)(tradeData, tradeData.entry_price, newMarginCallIndex + 1);
                    const historyPayload = [...tradeData.trade_history,
                        {
                            buyAmount: tradeData.current_buy_amount,
                            buyPrice: tradeData.current_buy_price,
                            quantity: tradeData.current_quantity,
                            margin: tradeData.current_margin
                        }
                    ];
                    const payload = Object.assign(Object.assign({}, tradeData), { whole_position_take_profit_ratio_price: newTakeProfitRatioPrice, next_margin_call_price: nexMarginCallTriggerPrice, api_connection: JSON.parse(tradeData.api_connection), current_margin: newMarginCallIndex + 1, trade_history: historyPayload, current_buy_amount: newBuyAmount, current_buy_price: buyResponse.entryPrice, current_quantity: buyResponse.quantity });
                    await tradeData_1.tradeDataModel.updateOne({ coin_id: tradeData.coin_id, user_id: tradeData.user_id, exchange: tradeData.exchange }, payload);
                }
            }
        }
    }
};
const calculateProfit = (averagePrice, currentPrice, tradeData) => {
    let totalQuantity = 0;
    tradeData.trade_history.forEach((entry) => {
        totalQuantity += entry.quantity;
    });
    totalQuantity += tradeData.current_quantity;
    const initialAmount = totalQuantity * averagePrice;
    const sellAmount = totalQuantity * currentPrice;
    return sellAmount - initialAmount;
};
const getAveragePrice = (tradeData) => {
    let totalPriceEntry = 0;
    tradeData.trade_history.forEach((entry) => {
        totalPriceEntry += entry.buyPrice;
    });
    totalPriceEntry += tradeData.current_buy_price; //newest buy.
    const currentAveragePrice = totalPriceEntry / (tradeData.trade_history.length + 1);
    return currentAveragePrice;
};
const receiveTrade = async () => {
    await mongoose_1.default.connect(constants_1.devDbUrl); //needed as this script runs in a worker_thread
    worker_threads_1.parentPort.on('message', (message) => {
        const trades = JSON.parse(message);
        for (let i = 0; i < trades.length; i++) {
            const trade = trades[i];
            runTrade(trade);
        }
    });
};
const reinforcedParser = (stringContent) => {
    let parsedStringContent = stringContent;
    while (typeof parsedStringContent == 'string') {
        parsedStringContent = JSON.parse(parsedStringContent);
    }
    return parsedStringContent;
};
receiveTrade();
