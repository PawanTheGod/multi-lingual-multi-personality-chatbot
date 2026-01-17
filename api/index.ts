import serverless from 'serverless-http';
import app from '../server/app.js';

// Vercel Serverless Function Config
export const config = {
    api: {
        bodyParser: false,
        externalResolver: true,
    },
};

export default serverless(app);
