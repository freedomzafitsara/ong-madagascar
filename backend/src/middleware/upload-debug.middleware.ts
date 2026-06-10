// backend/src/middleware/upload-debug.middleware.ts
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class UploadDebugMiddleware implements NestMiddleware {
  private readonly logger = new Logger('UploadDebug');

  use(req: Request, res: Response, next: NextFunction) {
    if (req.url.includes('/upload/single')) {
      this.logger.log(`=== UPLOAD REQUEST ===`);
      this.logger.log(`Content-Type: ${req.headers['content-type']}`);
      this.logger.log(`Content-Length: ${req.headers['content-length']}`);
      
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        if (body) {
          this.logger.debug(`Body preview: ${body.substring(0, 200)}`);
        }
      });
    }
    next();
  }
}