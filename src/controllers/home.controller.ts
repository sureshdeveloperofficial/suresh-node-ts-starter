import { Controller, Get } from '../decorators';

@Controller()
export class HomeController {
  @Get('/')
  getHome() {
    return {
      success: true,
      data: {
        message: 'Welcome to Node.js TypeScript Server',
        version: '1.0.0',
      },
    };
  }
}

