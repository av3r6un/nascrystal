<template>
  <div class="selector">
    <div class="selector_existing">
      <div
        v-for="(title, slug) in items"
        :key="slug"
        class="selector_item"
        :class="{ active: slug === modelValue }"
        @click="selectSlug(slug)"
      >
        <span :title="title">{{ title }}</span>
      </div>
    </div>
    <div
      v-if="showAdd"
      class="selector_item new"
      :class="{ active: addSlug === modelValue }"
      @click="selectSlug(addSlug)"
    >
      <Icon name="nsc:plus-sign" :size="24" />
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  items: Record<string, string>;
  showAdd?: boolean;
  modelValue?: string | null;
  addSlug?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const {
  items,
  showAdd = false,
  modelValue = null,
  addSlug = 'new',
} = toRefs(props);

const selectSlug = (slug: string) => {
  emit('update:modelValue', slug);
};

watch(
  () => [Object.keys(items.value), modelValue.value, showAdd.value, addSlug.value] as const,
  ([keys, selected, canAdd, addValue]) => {
    if (selected && (keys.includes(selected) || (canAdd && selected === addValue))) return;

    if (keys.length > 0) {
      emit('update:modelValue', keys[0]);
      return;
    }

    if (canAdd) {
      emit('update:modelValue', addValue);
    }
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.selector{
  display: flex;
  gap: 12px;
  &_existing{
    display: flex;
    gap: 12px;
    max-width: calc(100% - 80px);
    overflow-x: auto;
    &::-webkit-scrollbar{
      -webkit-appearance: none;
      display: none;
    }
  }
  &_item{
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    color: $light-brown;
    border-radius: 6px;
    border: 1px solid $semi-grey;
    span{
      max-width: 155px;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      text-align: left;
    }
    cursor: pointer;
    &.active{
      text-shadow: 0px 0px 1px rgba($brown, .5);
      color: $brown;
      background: $light-pink;
      border-color: $light-pink;
    }
    &.new{
      margin-left: auto;
    }
  }
}
</style>
