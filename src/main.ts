import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

function setupApplicationInsights() {
  const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
  if (!connectionString) {
    return;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const appInsights = require('applicationinsights');
    appInsights
      .setup(connectionString)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(true)
      .setUseDiskRetryCaching(true)
      .start();
  } catch {
    // Optional dependency in restricted environments.
  }
}

async function bootstrap() {
  setupApplicationInsights();
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
