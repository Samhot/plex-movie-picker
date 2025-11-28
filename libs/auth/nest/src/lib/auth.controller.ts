import { Controller, All, Req, Res } from '@nestjs/common';
import { auth } from './config/better-auth.config';
import { Request, Response } from 'express';
import { toNodeHandler } from 'better-auth/node';

@Controller('auth')
export class AuthController {
  @All('*')
  async handleAuth(@Req() req: Request, @Res() res: Response) {
    return toNodeHandler(auth)(req, res);
  }
}
