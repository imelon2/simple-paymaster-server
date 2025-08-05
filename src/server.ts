
import express from 'express';
import { logger } from './config/winstom';
import { env } from './config/config';
import rpcRoutes from './routes/rpc.route';

const app = express();

app.use(express.json());


app.use('/rpc',rpcRoutes)


app.listen(env.PORT, () => {
  logger.info(`Server listening on port ${env.PORT}`);
});
