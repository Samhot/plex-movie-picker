import { Controller, All, Req, Res, Logger } from '@nestjs/common';
import { auth } from './config/better-auth.config';
import { Request, Response } from 'express';
import { toNodeHandler } from 'better-auth/node';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  private readonly handler = toNodeHandler(auth);

  private handleRequest(req: Request, res: Response) {
    this.logger.log(`Auth request: ${req.method} ${req.url}`);
    return this.handler(req, res);
  }

  @All()
  async handleAuthRoot(@Req() req: Request, @Res() res: Response) {
    return this.handleRequest(req, res);
  }

  @All(':path')
  async handleAuthPath(@Req() req: Request, @Res() res: Response) {
    return this.handleRequest(req, res);
  }

  @All(':path/:subpath')
  async handleAuthSubPath(@Req() req: Request, @Res() res: Response) {
    return this.handleRequest(req, res);
  }
}
