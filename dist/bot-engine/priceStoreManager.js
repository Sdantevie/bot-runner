"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.priceStoreRunner = void 0;
const worker_threads_1 = require("worker_threads");
const priceStore_1 = __importDefault(require("../utils/priceStore"));
const priceStoreRunner = () => {
    if (worker_threads_1.isMainThread) {
        const worker = new worker_threads_1.Worker(__filename);
    }
    else {
        const priceStore = priceStore_1.default.Instance;
        setInterval(() => {
            priceStore.binanceDataStore();
        }, 3000);
    }
};
exports.priceStoreRunner = priceStoreRunner;
(0, exports.priceStoreRunner)();
