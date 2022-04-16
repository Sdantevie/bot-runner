import { isMainThread, Worker } from 'worker_threads';
import PriceStore from '../utils/priceStore';

export const priceStoreRunner = () => {
    if(isMainThread) {
        const worker = new Worker(__filename);
    } else {
        const priceStore = PriceStore.Instance;
        setInterval(() => {
            priceStore.binanceDataStore();
        }, 3000)
    }
}

priceStoreRunner();