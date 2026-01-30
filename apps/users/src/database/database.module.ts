import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async () => {
        const uri = process.env.MONGODB_CONNECTION;
        if (!uri) {
          throw new Error('MONGODB_CONNECTION is not set');
        }
        return { uri };
      },
    }),
  ],
})
export class DatabaseModule {}
