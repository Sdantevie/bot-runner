import { tradeDataModel } from "../data/models/tradeData";
import path from 'path';
import { Worker } from 'worker_threads'

let allLiveTrades = [];

const POOL_SIZE = 4;

const sliceIntoChunks = (arr: any[], chunkSize: number) =>{
    const chunkArray = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        const chunk = arr.slice(i, i + chunkSize);
        chunkArray.push(chunk);
    }
    return chunkArray;
}

export const botRunner = async () => {
    allLiveTrades = await tradeDataModel.find({ is_paused: false });
    tradeDataModel.watch().on('change', async (data) => {
        if(data.operationType == 'insert'){
            allLiveTrades.push(data.fullDocument);
        }

        if(data.operationType == 'update') {
            // if('is_paused' in data.updateDescription.updatedFields){
               
            // }
            allLiveTrades = await tradeDataModel.find({ is_paused: false });
        }

        if(data.operationType == 'delete') {
            allLiveTrades = await tradeDataModel.find({ is_paused: false });
        }
    });

    const workerPool = Array<Worker>(POOL_SIZE).fill(new Worker(path.resolve(`${__dirname}/tradeAlgo.js`)));

    setInterval(() => {
        const chunkSize = allLiveTrades.length / POOL_SIZE;
        const tradeChunks = sliceIntoChunks(allLiveTrades, chunkSize);
        
        for (let i = 0; i < tradeChunks.length; i++) {
            const chunk = tradeChunks[i];
            workerPool[i].postMessage(JSON.stringify(chunk))
        }
    }, 4000);
}