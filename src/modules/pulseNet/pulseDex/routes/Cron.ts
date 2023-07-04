import cron from "node-cron";
import HandleLockLP from '../controllers/HandleLockLP';

cron.schedule('* */3 * * * *', () => {
    HandleLockLP.index().then();
});

