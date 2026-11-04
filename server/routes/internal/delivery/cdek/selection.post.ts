import { callFastApiAsNitro } from '@@/server/services/auth.service';

export default defineEventHandler(async (event) => {
  try {
    const response = await callFastApiAsNitro<{ body: unknown }>(event, '/api/delivery/cdek/widget/selection', {
      method: 'POST', body: await readBody(event), timeout: 65000,
    });
    return response.body;
  }
  catch (error) {
    const failure = error as { statusCode?: number; data?: { data?: { message?: string }; message?: string; errors?: { message?: string }[] } };
    const reason = failure.data?.errors?.[0]?.message || failure.data?.data?.message || failure.data?.message;
    const message = typeof reason === 'string'
      ? reason.slice(0, 500)
      : 'Не удалось проверить адрес и рассчитать доставку СДЭК';
    throw createError({
      statusCode: [400, 409, 422].includes(failure.statusCode ?? 0) ? failure.statusCode : 502,
      statusMessage: 'CDEK delivery calculation failed',
      data: { message },
    });
  }
});
