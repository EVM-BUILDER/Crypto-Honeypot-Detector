import cron from "node-cron";
import UnlockLPController from '../controllers/UnlockLP';

cron.schedule('* * */24 * * *', () => {
    UnlockLPController.index().then();
});
