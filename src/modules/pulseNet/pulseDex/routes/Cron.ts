import cron from "node-cron";
// import HandleLockLP from '../controllers/HandleLockLP';

cron.schedule('* * */24 * * *', () => {
    // UnlockLPController.index().then();
});

// HandleLockLP.index().then();
