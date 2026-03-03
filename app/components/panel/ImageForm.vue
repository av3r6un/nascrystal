<template>
  <div class="image_form">
    <div class="image_form-title">
      {{ name }}
    </div>
    <input
      ref="input"
      type="file"
      class="inv_input"
      accept="image/*"
      @change="onSelect"
    >
    <div
      v-if="!localUrl"
      ref="dragField"
      class="image_form-droparea"
      @dragover.prevent="dragOver"
      @dragenter.prevent="dragOver"
      @dragleave.prevent="dragLeave"
      @drop.prevent="onDrop"
    >
      <label class="image_form-droparea__caption" @click.prevent="openFilePicker">
        <Icon name="nsc:upload" :size="32" />
        <span class="caption">{{ caption }}</span>
      </label>
    </div>
    <div v-else class="image_form-preview" @click="clearFile">
      <img v-if="fileUrl" :src="fileUrl" alt="image" class="base_image">
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    required: false,
  },
  modelValue: {
    type: [String, null, File],
    required: true,
  },
});
const emit = defineEmits(['update:modelValue']);
const openFilePicker = () => input.value?.click();
const fileUrl = ref('');
const localUrl = computed({
  get() {
    fileUrl.value = props.modelValue;
    return props.modelValue;
  },
  set(val) {
    fileUrl.value = val !== '' ? URL.createObjectURL(val) : null;
    emit('update:modelValue', val);
  },
});
const dragOver = (e: unknown) => {
  e.dataTransfer.dropEffect = 'move';
  dragField.value?.classList.add('over');
};
const dragLeave = () => {
  dragField.value.classList.remove('over');
};
const onDrop = (e: unknown) => {
  const file = e.dataTransfer.files[0];
  if (file && /image\/*/.test(file.type)) {
    localUrl.value = file;
    dragField.value?.classList.remove('over');
  }
};
const onSelect = (e: unknown) => {
  const file = e.target.files[0];
  if (file) localUrl.value = file;
};
const clearFile = () => {
  input.value.value = null;
  localUrl.value = '';
};
const dragField = ref<HTMLDivElement | null>(null);
const input = ref<HTMLInputElement | null>(null);
</script>

<style lang="scss" scoped>
.image_form{
  &-title{
    margin-bottom: 10px;
    color: $brown;
    font-weight: 600;
  }
  &-droparea{
    border: 1px dashed $semi-grey;
    border-radius: 8px;
    height: 130px;
    &.over{
      border-color: $light-grey;
      border-style: solid;
    }
    &__caption{
      height: 100%;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      flex-direction: column;
      justify-content: center;
      color: $light-brown;
      cursor: pointer;
      .caption{
        max-width: 75%;
        text-align: center;
      }
    }
  }
  &-preview{
    border-radius: 8px;
    max-height: 130px;
    position: relative;
    &:hover:after{
      visibility: visible;
    }
    img{
      max-height: 130px;
      object-fit: contain;
    }
    &:after{
      position: absolute;
      visibility: hidden;
      content: 'x';
      font-size: 32px;
      background: rgba(#000, .4);
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: inherit;
      color: $white;
      top: 0;
      cursor: pointer;
      left: 0;
    }
  }
}
</style>
