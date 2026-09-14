<template>
  <div class="s3-image" :class="{ 's3-image_preview': previewUrl }" @click.stop>
    <img v-if="previewUrl" :src="previewUrl" :alt="alt" class="base_image">
    <label v-else class="s3-image_placeholder" :title="t('panel.stock.upload_image')">
      <Icon name="nsc:upload" :size="18" />
      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" @change="upload">
    </label>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  image?: string | { url?: string | null; object_key?: string | null } | null;
  uploadUrl: string;
  alt?: string;
}>();
const emit = defineEmits<{ uploaded: [result: { object_key: string; url: string }] }>();
const { t } = useI18n();
const auth = useAuthStore();
const uploading = ref(false);
const uploadedImage = ref('');
const previewUrl = computed(() => {
  if (uploadedImage.value) return uploadedImage.value;
  if (typeof props.image === 'string') return props.image.trim();
  return props.image?.url || '';
});

const upload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file || uploading.value) return;
  uploading.value = true;
  try {
    if (!await auth.ensureValidAccessToken()) throw new Error('Unauthorized');
    const body = new FormData();
    body.append('file', file);
    const result = await $fetch<{ object_key: string; url: string }>(props.uploadUrl, {
      method: 'POST', body, headers: auth.authHeader, retry: 0,
    });
    uploadedImage.value = result.url;
    emit('uploaded', result);
  }
  catch (error) {
    console.error('S3 image upload failed', error);
    window.alert(t('panel.stock.upload_error'));
  }
  finally {
    uploading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.s3-image{
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 40px;
  width: 40px;
  height: 40px;
  box-sizing: border-box;
  border-radius: 8px;
  background: $light-pink;
  color: $yellow-brown;
  overflow: hidden;
  &:has(.s3-image_placeholder) {
    border: 1px dashed $yellow-brown;
  }
  &_placeholder{
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    cursor: pointer;
    input{
      position: absolute;
      width: 1px;
      height: 1px;
      opacity: 0;
    }
  }
  .base_image{
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  > input{
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
  }
}
</style>
