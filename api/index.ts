import type { VercelRequest, VercelResponse } from '@vercel/node';
import serverless from 'serverless-http';

// Dynamic import to handle the ES module properly
export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        // Import the app module which exports both serverPromise and the app
        const appModule = await import('../server/app.js');

        // Wait for the server promise to resolve (this registers routes)
        await appModule.serverPromise;

        // Wrap the express app with serverless-http
        const handler = serverless(appModule.default);

        // Execute the wrapped handler
        return await handler(req, res);
    } catch (error) {
        console.error('Serverless handler error:', error);
        return res.status(500).json({
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
