import { bootstrapNitroAuth } from '../services/auth.service';

export default defineNitroPlugin(async () => {
  try {
    await bootstrapNitroAuth();
  }
  catch (error) {
    console.error('Nitro service auth bootstrap failed', error);
  }
});
