import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);

    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'development'
            ? err.message
            : 'Internal server error',
    });
};

export const notFound = (req: Request, res: Response): void => {
    res.status(404).json({
        success: false,
        error: `Route ${req.originalUrl} not found`,
    });
};
