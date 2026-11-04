<template>
  <div
    ref="container"
    class="small_search"
    :class="{ opened, selected: modelValue != null }"
    @click.stop="opened = !opened"
    @keydown.esc.stop="opened = false"
  >
    <div v-show="opened" class="small_search-options" @click.stop>
      <input
        ref="searchInput"
        v-model="keyword"
        type="text"
        class="input_wide"
        :placeholder="searchPlaceholder"
      >
      <div v-if="loading">
        Поиск…
      </div>
      <div v-else-if="error" role="alert">
        Не удалось загрузить результаты.
      </div>
      <div v-else-if="keyword.trim() && !options.length">
        Ничего не найдено
      </div>
      <div class="small_search-options__scroll">
        <div v-for="(option, index) in options" :key="index" class="small_search-option">
          <div class="option" @click.stop="select(option)">
            {{ label(option) }}
          </div>
        </div>
      </div>
    </div>
    <div class="small_search-default" :class="{ selected: modelValue != null }">
      <div class="small_search-default__text">
        {{ modelValue != null ? label(modelValue) : placeholder }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
type Option = string | Record<string, unknown>;
withDefaults(defineProps<{
  modelValue?: Option | null;
  options?: Option[];
  placeholder?: string;
  searchPlaceholder?: string;
  loading?: boolean;
  error?: boolean;
}>(), { modelValue: null, options: () => [], placeholder: 'Выбрать опцию', searchPlaceholder: 'Поиск' });
const emit = defineEmits(['update:modelValue', 'search']);
const opened = ref(false);
const keyword = ref('');
const container = ref<HTMLElement>();
const searchInput = ref<HTMLInputElement>();
const label = (option: Option) => typeof option === 'string' ? option : String(option.name ?? '');
watch(keyword, value => emit('search', value));
function select(option: Option) {
  emit('update:modelValue', option);
  opened.value = false;
}
watch(opened, async (value) => {
  if (value) {
    await nextTick();
    searchInput.value?.focus();
  }
});
const closeOutside = (event: PointerEvent) => {
  if (!container.value?.contains(event.target as Node)) opened.value = false;
};
onMounted(() => document.addEventListener('pointerdown', closeOutside));
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', closeOutside);
});
</script>

<style lang="scss" scoped>
.small_search{
  user-select: none;
  height: 50px;
  border-radius: 8px;
  border: 1px solid $semi-grey;
  min-width: 120px;
  padding: 5px 12px;
  position: relative;
  background: $white;
  width: 100%;
  &.opened{
    z-index: 3;
    .small_search-default:after{
      transform: rotateX(180deg);
    }
  }
  &-options{
    position: absolute;
    width: 100%;
    top: 100%;
    left: 0;
    padding: 5px;
    margin-top: 5px;
    box-sizing: border-box;
    border: 1px solid $semi-grey;
    border-radius: 6px;
    background: $white;
    .input_wide{
      margin-bottom: 5px;
    }
    &__scroll{
      padding: 0 2px;
      max-height: 150px;
      overflow-y: auto;
      &::-webkit-scrollbar{
        width: 4px;
        background: $pinky;
        border-radius: 2px;
        &-thumb{
          background: $light-brown;
          border-radius: inherit;
        }
      }
    }
    .option{
      box-sizing: border-box;
      border-radius: 3px;
      min-height: 30px;
      padding: 2px 0;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      background: transparent;
      transition: all .4s ease;
      color: $light-brown;
      &:hover{
        background: $semi-grey;
        color: $brown;
      }
    }
  }
  &-default{
    color: $light-brown;
    z-index: 1;
    display: flex;
    align-items: center;
    font-size: 16px;
    height: 100%;
    width: 100%;
    position: relative;
    &__text{
      max-width: 340px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    &:after{
      position: absolute;
      content: '\f078';
      font-family: 'FontAwesome';
      width: 16px;
      height: 16px;
      top: calc(50% - 9px);
      right: 0;
      color: $brown;
      font-size: 16px;
      transition: all .4s ease;
      z-index: 1;
    }
  }
}
</style>
