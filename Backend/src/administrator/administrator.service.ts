import { Injectable } from '@nestjs/common';

@Injectable()
export class AdministratorService {
  getHello(): string {
    return 'Hello from Administrator Service';
  }
}
