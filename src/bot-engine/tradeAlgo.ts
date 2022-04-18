import { tradeDataModel } from "../data/models/tradeData";
import { tradeLogModel } from "../data/models/tradeLogs";
import { botActionPricePoints, nextMarginCallPrice, takeProfitCallbackPrice, takeProfitRatioPrice } from "../utils/botActionPricePoints";
import { buyData, ExchangeFactory } from "../utils/exchangeUtils";
import { comparePrices, differenceLevel } from "../utils/priceComparator";
import PriceStore from "../utils/priceStore";
import { workerData, parentPort } from 'worker_threads';
import mongoose from 'mongoose';
import { devDbUrl } from "../utils/constants";


const runTrade = async (tradeData: any) => {
    const currentPrice = await PriceStore.Instance.getPrice(tradeData.exchange, tradeData.coin_id);
    // console.log(currentPrice);
    // const currentPrice = 1.02

    if (tradeData.has_closed_trade && tradeData.trade_type == 'Cycle') {
        const buyBackPriceDifference = comparePrices(currentPrice, tradeData.closing_price);

        if ((buyBackPriceDifference.differenceLevel == differenceLevel.LESS)
            || buyBackPriceDifference.differenceLevel == differenceLevel.SAME) {

            //initiate buy back, recalculate actionPricePoints, clear history, set_current_margin -- (done)
            const exchange = ExchangeFactory.getExchangeBroker(tradeData.exchange, reinforcedParser(tradeData.api_connection));
            const buyBackData: buyData = {
                user_id: tradeData.user_id,
                coin_id: tradeData.coin_id,
                amount: tradeData.open_position_doubled ? tradeData.first_buy_amount * 2 : tradeData.first_buy_amount,
                margin_call_number: 0
            };

            const buyResponse = await exchange.createBuyOrder(buyBackData);
            if (buyResponse.success) {
                const priceActionPoints = botActionPricePoints(tradeData, buyResponse.entryPrice);
                const payload = {
                    ...tradeData,
                    ...priceActionPoints,
                    has_passed_take_profit_ratio: false,
                    has_closed_trade: false,
                    api_connection: JSON.parse(tradeData.api_connection),
                    trade_history: [],
                    current_margin: 0,
                    current_quantity: buyResponse.quantity,
                    current_buy_amount: buyBackData.amount,
                    entry_price: buyResponse.entryPrice,
                    current_buy_price: buyResponse.entryPrice,
                    closing_price: undefined,
                    current_price_after_take_profit_ratio: undefined
                }

                await tradeDataModel.updateOne({ coin_id: tradeData.coin_id, user_id: tradeData.user_id, exchange: tradeData.exchange }, payload)
            }
        }

        return;
    }

    if (tradeData.has_passed_take_profit_ratio) {

        //calculate the take_profit_callback_price -- (done)
        const newTakeProfitCallbackPrice = takeProfitCallbackPrice(tradeData.whole_position_take_profit_callback, tradeData.current_price_after_take_profit_ratio);
        const takeProfitCallbackCompare = comparePrices(currentPrice, newTakeProfitCallbackPrice);

        if ((takeProfitCallbackCompare.differenceLevel == differenceLevel.LESS)
            || (takeProfitCallbackCompare.differenceLevel == differenceLevel.SAME)) {

            // sell off -- (done)
            // set has_closed_trade && pause_trade if its oneshot && closing_price -- (done)

            let sellAmount = 0;
            tradeData.trade_history.forEach((entry: any) => {
                sellAmount += entry.buyAmount;
            });

            sellAmount += tradeData.current_buy_amount;
            const exchange = ExchangeFactory.getExchangeBroker(tradeData.exchange, reinforcedParser(tradeData.api_connection));
            const sellData = {
                user_id: tradeData.user_id,
                coin_id: tradeData.coin_id,
                amount: sellAmount,
                margin_call_number: tradeData.current_margin
            }

            const sellResponse = await exchange.createSellOrder(sellData);
            if (sellResponse.success) {
                const profit = calculateProfit(getAveragePrice(tradeData), currentPrice, tradeData);
                if (tradeData.trade_type == 'Cycle') {
                    const payload = {
                        has_closed_trade: true,
                        closing_price: currentPrice
                    }
                    await tradeDataModel.updateOne({ coin_id: tradeData.coin_id, user_id: tradeData.user_id, exchange: tradeData.exchange }, payload)

                } else {
                    await tradeDataModel.deleteOne({ coin_id: tradeData.coin_id, user_id: tradeData.user_id, exchange: tradeData.exchange });
                }

                await tradeLogModel.updateOne({ coin_id: tradeData.coin_id, user_id: tradeData.user_id, exchange: tradeData.exchange, order_type: 'SELL' }, { profit })
            }
        } else {
            //update only when price is going up
            if (currentPrice > tradeData.current_price_after_take_profit_ratio) {
                //update current_price_after_take_profit_ratio -- (done)
                await tradeDataModel.updateOne({ coin_id: tradeData.coin_id, user_id: tradeData.user_id, exchange: tradeData.exchange }, { current_price_after_take_profit_ratio: currentPrice });
            }
        }

        return;
    }

    const takeProfitPriceCompare = comparePrices(currentPrice, tradeData.whole_position_take_profit_ratio_price);
    if ((takeProfitPriceCompare.differenceLevel == differenceLevel.GREATER)
        || (takeProfitPriceCompare.differenceLevel == differenceLevel.SAME)) {

        //set has passed take_profit_ratio && current_price_after_take_profit_ratio -- (done)
        const payload = {
            has_passed_take_profit_ratio: true,
            current_price_after_take_profit_ratio: currentPrice
        }

        await tradeDataModel.updateOne({ coin_id: tradeData.coin_id, user_id: tradeData.user_id, exchange: tradeData.exchange }, payload)
        return;
    }

    if (tradeData.is_running_margin_call) {
        //greater than minues one implies that next margin exist.
        if (tradeData.next_margin_call_price > -1) {
            const nextMarginCallPriceCompare = comparePrices(currentPrice, tradeData.next_margin_call_price, 0.1);
            if ((nextMarginCallPriceCompare.differenceLevel == differenceLevel.SAME)
                || (nextMarginCallPriceCompare.differenceLevel == differenceLevel.LESS && nextMarginCallPriceCompare.actionable)) {

                //buy back,  recalculate take_profit and next_margin_Call price. -- (done)
                //move all details into history -- (done)


                const newMarginCallIndex = tradeData.current_margin; //due to first buy current margin index is the next margin
                const callMarginConfig = tradeData.margin_config[newMarginCallIndex];
                const newBuyAmount = tradeData.first_buy_amount * callMarginConfig.multiple_buy_in_ratio;
                const buyBackData: buyData = {
                    user_id: tradeData.user_id,
                    coin_id: tradeData.coin_id,
                    amount: newBuyAmount,
                    margin_call_number: newMarginCallIndex + 1
                };

                const exchange = ExchangeFactory.getExchangeBroker(tradeData.exchange, reinforcedParser(tradeData.api_connection));
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
                    tradeData.trade_history.forEach((entry: any) => {
                        totalPriceEntry += entry.buyPrice
                    });

                    totalPriceEntry += tradeData.current_buy_price;

                    totalPriceEntry += buyResponse.entryPrice; //newest buy.

                    let denominator = tradeData.trade_history.length + 2; //two accounts for current buy and inital buy
                    
                    const currentAveragePrice = totalPriceEntry / denominator;
                    const newTakeProfitRatioPrice = takeProfitRatioPrice(tradeData, currentAveragePrice);
                    const nexMarginCallTriggerPrice = nextMarginCallPrice(tradeData, tradeData.entry_price, newMarginCallIndex + 1);

                    const historyPayload = [...tradeData.trade_history,
                        {
                            buyAmount: tradeData.current_buy_amount,
                            buyPrice: tradeData.current_buy_price,
                            quantity: tradeData.current_quantity,
                            margin: tradeData.current_margin
                        }
                    ];
                    const payload = {
                        ...tradeData,
                        whole_position_take_profit_ratio_price: newTakeProfitRatioPrice, //  same thing here. bot will close trade a loss.
                        next_margin_call_price: nexMarginCallTriggerPrice,
                        api_connection: JSON.parse(tradeData.api_connection),
                        current_margin: newMarginCallIndex + 1,
                        trade_history: historyPayload,
                        current_buy_amount: newBuyAmount,
                        current_buy_price: buyResponse.entryPrice,
                        current_quantity: buyResponse.quantity
                    }

                    await tradeDataModel.updateOne({ coin_id: tradeData.coin_id, user_id: tradeData.user_id, exchange: tradeData.exchange }, payload)
                }
            }
        }

    }
}

const calculateProfit = (averagePrice: any, currentPrice: any, tradeData: any) => {
    let totalQuantity = 0;
    tradeData.trade_history.forEach((entry: any) => {
        totalQuantity += entry.quantity
    });
    totalQuantity += tradeData.current_quantity;

    const initialAmount = totalQuantity * averagePrice;

    const sellAmount = totalQuantity * currentPrice;

    return sellAmount - initialAmount;
}

const getAveragePrice = (tradeData: any) => {
    let totalPriceEntry = 0;
    tradeData.trade_history.forEach((entry: any) => {
        totalPriceEntry += entry.buyPrice
    });

    totalPriceEntry += tradeData.current_buy_price; //newest buy.

    const currentAveragePrice = totalPriceEntry / (tradeData.trade_history.length + 1);

    return currentAveragePrice;
}


const receiveTrade = async () => {
    await mongoose.connect(devDbUrl); //needed as this script runs in a worker_thread
    parentPort.on('message', (message) => {
        const trades = JSON.parse(message);
        for (let i = 0; i < trades.length; i++) {
            const trade = trades[i];
            runTrade(trade);
        }
    });
}

const reinforcedParser = (stringContent: string) => {
    let parsedStringContent = stringContent;
    while (typeof parsedStringContent == 'string') {
        parsedStringContent = JSON.parse(parsedStringContent);
    }

    return parsedStringContent;
}

receiveTrade();