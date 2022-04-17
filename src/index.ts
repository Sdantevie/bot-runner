import { botRunner } from './bot-engine/tradeManager';
import { priceStoreRunner } from './bot-engine/priceStoreManager';
import mongoose from 'mongoose';
import { devDbUrl } from './utils/constants';

const port = process.env.PORT || 3515;

(async () => {

  await mongoose.connect(devDbUrl);
  botRunner();
  priceStoreRunner();

})();
