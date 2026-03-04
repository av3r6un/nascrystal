import { bootstrapNitroAuth } from '../services/auth.service';

export default defineNitroPlugin(() => {
  void bootstrapNitroAuth().catch((error) => {
    console.error('Nitro service auth bootstrap failed', error);
  });
});
