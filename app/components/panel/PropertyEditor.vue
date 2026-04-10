<template>
  <div v-if="currentOptions.length >= 1" class="property panel_section">
    <div class="property_name panel_section-title">
      {{ name }}
    </div>
    <div class="property_body">
      <div v-for="o in currentOptions" :key="o.id" class="property_body-row">
        <div class="property_body-value">
          {{ o.value }}
        </div>
        <div class="property_body-name">
          <input
            v-model="o.name"
            type="text"
            :placeholder="t('panel.property_name')"
            autocomplete="off"
            class="input_wide"
            @input="updateVal($event)"
          >
        </div>
      </div>
    </div>
    <button
      type="button"
      class="btn btn_submit"
      :disabled="!isDirty"
      @click="saveDraft"
    >
      {{ t('panel.submit') }}
    </button>
  </div>
</template>

<script lang="ts" setup>
const emit = defineEmits(['submit']);
const { t } = useI18n();
const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  id: {
    type: Number,
    required: true,
  },
});

const initial = ref('[]');

const stringifyItems = (items: unknown) => JSON.stringify(items ?? []);

const currentOptions = computed(() => props.modelValue.filter(option => option.property_id === props.id));

onMounted(() => {
  initial.value = stringifyItems(currentOptions.value);
});
const isDirty = ref(false);

const updateVal = ({ target }) => {
  const newValue = target.value;
  if (!newValue || newValue === '') {
    const valueIndex = props.modelValue.find(option => option.id === props.id);
    valueIndex.name = null;
  };
  isDirty.value = stringifyItems(props.modelValue.filter(option => option.property_id === props.id)) !== initial.value;
};

const saveDraft = () => {
  const changes = [];
  const initialValue = JSON.parse(initial.value);
  currentOptions.value.forEach((option) => {
    const initialVal = initialValue.find(val => val.id === option.id);
    if (stringifyItems(option) !== stringifyItems(initialVal)) {
      changes.push(option);
    }
  });
  emit('submit', changes);
};
</script>

<style lang="scss" scoped>
.property{
  &_body{
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 320px;
    overflow: auto;
    padding-right: 5px;
    &::-webkit-scrollbar{
      -webkit-appearance: none;
      width: 6px;
      background: $pinky;
      border-radius: 6px;
      &-thumb{
        border-radius: 6px;
        background: $light-brown;
      }
    }
    &-row{
      display: flex;
      align-items: center;
      width: 100%;
      gap: 12px;
      .input_wide{
        margin-bottom: 0;
      }
    }
    &-name{
      width: 100%;
    }
    &-value{
      min-width: 70px;
    }
  }
}
</style>
