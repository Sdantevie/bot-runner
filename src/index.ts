import { botRunner } from './bot-engine/tradeManager';
import { priceStoreRunner } from './bot-engine/priceStoreManager';

const port = process.env.PORT || 3515;

(async () => {

  // await mongoose.connect(devDbUrl);
  botRunner();
  priceStoreRunner();

})();
