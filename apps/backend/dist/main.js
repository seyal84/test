import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
async function bootstrap() {
    const app = await NestFactory.create(AppModule, { bufferLogs: true });
    app.useLogger(app.get(Logger));
    app.use(helmet());
    app.enableCors({ origin: true, credentials: true });
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
    const port = process.env.PORT ? Number(process.env.PORT) : 3000;
    await app.listen(port);
    console.log(`API listening on port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map