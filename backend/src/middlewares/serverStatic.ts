import { NextFunction, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'

export default function serveStatic(baseDir: string) {
    return (req: Request, res: Response, next: NextFunction) => {
        const resolvedBase = path.resolve(baseDir);
        const filePath = path.resolve(baseDir, req.path.slice(1) || '');
        if (!filePath.startsWith(resolvedBase + path.sep) && filePath !== resolvedBase) {
            return res.status(403).send('Forbidden');
        }

        return fs.access(filePath, fs.constants.F_OK, (accessErr) => {
            if (accessErr) {
                return next();
            }
        return res.sendFile(filePath, (sendErr) => {
                if (sendErr) {
                    next(sendErr);
                }
            })
        })
    }
}
