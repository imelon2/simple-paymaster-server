
import express from 'express';
import { logger } from './config/winstom';
import { env } from './config/config';
import rpcRoutes from './routes/rpc.route';
import morgan from 'morgan';


const app = express();

app.use(express.json());

// const morganStream = {
//   write: (message:any) => logger.info(message.trim())
// };
// app.use(morgan('HTTP/:http-version :method :remote-addr :url :remote-user :status :res[content-length] :referrer :user-agent :response-time ms', { stream: morganStream }));

const morganCustomFormat = (tokens:any, req:any, res:any) => {
  // 객체로 직접 추출
  const logData = {
    httpVersion: tokens['http-version'](req, res),
    method: tokens.method(req, res),
    remoteAddr: tokens['remote-addr'](req, res),
    url: tokens.url(req, res),
    remoteUser: tokens['remote-user'](req, res),
    status: tokens.status(req, res),
    contentLength: tokens.res(req, res, 'content-length'),
    referrer: tokens.referrer(req, res),
    userAgent: tokens['user-agent'](req, res),
    responseTime: tokens['response-time'](req, res)
  };
  // winston에 key-value 구조화 로그로 전달
  logger.info('HTTP access log', logData);

  // morgan이 요구하는 return값(콘솔에 남길 내용) : 원하면 ''로 처리
  return null; // 또는 ''로 하면 콘솔에는 안 찍힘
};
app.use(morgan(morganCustomFormat));


app.use('/rpc',rpcRoutes)



app.listen(env.PORT, () => {
  logger.info(`Server listening on port ${env.PORT}`);
});
