export enum differenceLevel {
    LESS=-1,
    SAME=0,
    GREATER=1
}

export type comparatorResult = {
    difference: number,
    differenceLevel: differenceLevel,
    actionable: boolean,
}

export const comparePrices = (fluctuatingPrice: number, referencePrice: number, actionableRange = 0): comparatorResult => {
    const priceDifference = fluctuatingPrice - referencePrice;
    const sign = Math.sign(priceDifference);
    const absolutePriceDifference = Math.abs(priceDifference);

    return {
        difference: absolutePriceDifference,
        differenceLevel: sign,
        actionable: absolutePriceDifference <= actionableRange
    }
}