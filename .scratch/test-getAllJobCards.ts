import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { JobcardService } from '../src/jobcard/jobcard.service';

async function bootstrap() {
    console.log("Creating Nest App context...");
    const app = await NestFactory.createApplicationContext(AppModule);
    const service = app.get(JobcardService);
    
    console.log("Measuring getAllJobCards...");
    const start = performance.now();
    const result = await service.getAllJobCards();
    const end = performance.now();
    
    console.log(`getAllJobCards took ${end - start}ms`);
    console.log(`Found ${result.meta.total} jobs`);
    
    await app.close();
}

bootstrap().catch(console.error);
