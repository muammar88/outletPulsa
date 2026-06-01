import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: (req: any) => {
        let token = null;
        console.log("=== JWT EXTRACTOR ===");
        console.log("Cookies:", req?.cookies);
        if (req && req.cookies) {
          // Mengambil dari nama cookie yang benar
          token = req.cookies['access_token'];
          //console.log("Token Found:", token ? "YES (length: " + token.length + ")" : "NO");
        }
        return token;
      },
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'localenv',
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      kode: payload.kode,
      type: payload.type,
    };
  }
}
