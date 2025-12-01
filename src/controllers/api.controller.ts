import { Controller, Get } from '../decorators';

@Controller()
export class ApiController {
  @Get('/api')
  getApiInfo() {
    return {
      success: true,
      data: {
        message: 'API endpoint',
        version: '1.0.0',
        endpoints: {
          health: '/health',
          api: '/api',
          users: '/api/users',
        },
      },
    };
  }
}

