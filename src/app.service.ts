import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AppService {
  async getHello(): Promise<string> {
    const password = await bcrypt.hash('h22122002h', 10);
    console.log(password);
    return 'Hello World!';
  }
}
