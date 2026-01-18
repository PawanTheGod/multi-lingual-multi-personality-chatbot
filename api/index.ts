import type { VercelRequest, VercelResponse } from '@vercel/node';
import serverless from 'serverless-http';

// Cache the handler to avoid re-initialization on every request
let cachedHandler: any = null;

async function getHandler() {
    if (cachedHandler) {
        return cachedHandler;
    }

    try {
        // Import the app module
        const appModule = await import('../server/app.js');

        // Wait for routes to be registered
        await appModule.serverPromise;

        // Create and cache the serverless handler
        cachedHandler = serverless(appModule.default, {
            binary: ['image/*', 'application/octet-stream']
        });

        return cachedHandler;
    } catch (error) {
        console.error('Failed to initialize handler:', error);
        throw error;
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const handlerFn = await getHandler();
        return await handlerFn(req, res);
    } catch (error) {
        console.error('Serverless handler error:', error);
        return res.status(500).json({
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
