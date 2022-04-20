"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.botRunner = void 0;
const tradeData_1 = require("../data/models/tradeData");
const path_1 = __importDefault(require("path"));
const worker_threads_1 = require("worker_threads");
let allLiveTrades = [];
const POOL_SIZE = 4;
const sliceIntoChunks = (arr, chunkSize) => {
    const chunkArray = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        const chunk = arr.slice(i, i + chunkSize);
        chunkArray.push(chunk);
    }
    return chunkArray;
};
const botRunner = async () => {
    allLiveTrades = await tradeData_1.tradeDataModel.find({ is_paused: false });
    tradeData_1.tradeDataModel.watch().on('change', async (data) => {
        if (data.operationType == 'insert') {
            allLiveTrades.push(data.fullDocument);
        }
        if (data.operationType == 'update') {
            if ('is_paused' in data.updateDescription.updatedFields) {
                allLiveTrades = await tradeData_1.tradeDataModel.find({ is_paused: false });
            }
        }
        if (data.operationType == 'delete') {
            allLiveTrades = await tradeData_1.tradeDataModel.find({ is_paused: false });
        }
    });
    const workerPool = Array(POOL_SIZE).fill(new worker_threads_1.Worker(path_1.default.resolve(`${__dirname}/tradeAlgo.js`)));
    setInterval(() => {
        const chunkSize = allLiveTrades.length / POOL_SIZE;
        const tradeChunks = sliceIntoChunks(allLiveTrades, chunkSize);
        for (let i = 0; i < tradeChunks.length; i++) {
            const chunk = tradeChunks[i];
            workerPool[i].postMessage(JSON.stringify(chunk));
        }
    }, 4000);
};
exports.botRunner = botRunner;
