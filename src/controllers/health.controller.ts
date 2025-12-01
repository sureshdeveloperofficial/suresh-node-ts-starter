import { Controller, Get } from '../decorators';

@Controller()
export class HealthController {
  @Get('/health')
  getHealth() {
    return {
      success: true,
      data: {
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
      },
    };
  }
}

