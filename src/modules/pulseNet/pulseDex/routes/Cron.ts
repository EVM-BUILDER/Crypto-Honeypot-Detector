import cron from "node-cron";
import HandleLockLP from '../controllers/HandleLockLP';

cron.schedule('* */1 * * *', () => {
    HandleLockLP.index().then();
});

