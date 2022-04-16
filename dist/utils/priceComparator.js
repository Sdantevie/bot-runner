"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePrices = exports.differenceLevel = void 0;
var differenceLevel;
(function (differenceLevel) {
    differenceLevel[differenceLevel["LESS"] = -1] = "LESS";
    differenceLevel[differenceLevel["SAME"] = 0] = "SAME";
    differenceLevel[differenceLevel["GREATER"] = 1] = "GREATER";
})(differenceLevel = exports.differenceLevel || (exports.differenceLevel = {}));
const comparePrices = (fluctuatingPrice, referencePrice, actionableRange = 0) => {
    const priceDifference = fluctuatingPrice - referencePrice;
    const sign = Math.sign(priceDifference);
    const absolutePriceDifference = Math.abs(priceDifference);
    return {
        difference: absolutePriceDifference,
        differenceLevel: sign,
        actionable: absolutePriceDifference <= actionableRange
    };
};
exports.comparePrices = comparePrices;
