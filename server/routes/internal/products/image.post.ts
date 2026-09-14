type UploadResponse = {
  status?: string;
  body?: { object_key: string; url: string };
};

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization');
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Authorization header is required' });
  }
  const variantId = getQuery(event).variant_id;
  const form = await readMultipartFormData(event);
  const file = form?.find(part => part.name === 'file');
  if (!variantId || !file?.data?.length || !file.type) {
    throw createError({ statusCode: 400, statusMessage: 'Variant and file are required' });
  }
  const payload = new FormData();
  payload.append('file', new Blob([file.data], { type: file.type }), file.filename || 'image');
  const baseUrl = useRuntimeConfig(event).fastApiBaseUrl.replace(/\/+$/, '');
  try {
    const response = await $fetch<UploadResponse>(`${baseUrl}/api/products/variants/${variantId}/image`, {
      method: 'POST', body: payload, headers: { Authorization: authHeader }, retry: 0, timeout: 120000,
    });
    if (response?.status !== 'success' || !response.body?.object_key) throw new Error('Invalid upload response');
    return response.body;
  }
  catch (error) {
    console.error('Variant image upload failed', error);
    throw createError({ statusCode: 502, statusMessage: 'Failed to upload variant image' });
  }
});
