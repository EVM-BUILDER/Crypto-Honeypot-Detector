import cron from "node-cron";
import HandleLockLP from '../controllers/HandleLockLP';

cron.schedule('* */14 * * * *', () => {
    HandleLockLP.index().then();
});

