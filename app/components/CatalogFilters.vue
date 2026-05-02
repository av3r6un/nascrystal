<template>
  <div class="filters">
    <div class="filters_header" @click="toggleFilters">
      <div class="filters_header-title">
        {{ t('catalog.filter') }}
      </div>
      <button type="button" class="btn filters_btn">
        <Icon name="nsc:filter" :size="24" />
      </button>
    </div>
    <div v-show="showFilters" class="filters_body">
      <div
        v-for="(filter, idx) in filtersMap"
        v-show="filter.alwaysDisplay || meetsCondition(filter.dependsOn, filter.displayCondition)"
        :key="idx"
      >
        <div class="filters_title" @click="toggleFilter(idx)">
          <span class="title">{{ t(filter.name) }}</span>
          <Icon v-if="!filter.framed" :name="`nsc:toggle-${filter.initialState ? 'up' : 'down'}`" />
        </div>
        <FilterOption v-if="filter" v-bind="filter" @update:model-value="(n) => updateState(idx, n)" />
      </div>
      <button v-show="filtersApplied" type="button" class="btn btn_add" @click="clearFilters">
        {{ t('catalog.clear_filters') }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
const emit = defineEmits(['update:modelValue']);

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  filters: {
    type: Object,
    required: true,
  },
});
const { t } = useI18n();

const localValue = computed({
  get: () => { return props.modelValue; },
  set: (val) => { emit('update:modelValue', val); },
});

const showFilters = ref(true);

onMounted(() => {
  if (document.documentElement.scrollWidth < 630) {
    showFilters.value = false;
  }
});

const filtersMap = ref([
  {
    name: 'catalog.filters.category',
    propertyIndex: 0,
    alwaysDisplay: true,
    initialState: true,
    options: computed(() => buildOptions(0, 'Стразы')),
    single: true,
    framed: true,
    modelValue: [],
  },
  {
    name: 'catalog.filters.cuts',
    propertyIndex: 1,
    initialState: false,
    alwaysDisplay: false,
    dependsOn: 0,
    displayCondition: {
      field: 'modelValue[0]',
      operator: 'in',
      value: ['Hot', 'Non'],
    },
    options: computed(() => buildOptions(1)),
    single: true,
    modelValue: [],
  },
  {
    name: 'catalog.filters.form',
    propertyIndex: 4,
    initialState: false,
    alwaysDisplay: false,
    dependsOn: 0,
    displayCondition: {
      field: 'modelValue[0]',
      operator: '===',
      value: 'K9',
    },
    options: computed(() => buildOptions(4)),
    single: false,
    modelValue: [],
  },
  {
    name: 'catalog.filters.color',
    propertyIndex: 3,
    initialState: false,
    alwaysDisplay: true,
    options: computed(() => buildOptions(3)),
    single: false,
    modelValue: [],
  },
  {
    name: 'catalog.filters.size',
    propertyIndex: 2,
    initialState: false,
    alwaysDisplay: true,
    options: computed(() => buildOptions(2)),
    single: false,
    modelValue: [],
  },
]);

const normalizeModelValue = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap(normalizeModelValue);
  }

  if (typeof value !== 'string') return [];

  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
};

const syncFiltersFromModelValue = (modelValue: Record<string, unknown>) => {
  filtersMap.value.forEach((filter) => {
    filter.modelValue = normalizeModelValue(modelValue[String(filter.propertyIndex)]);
  });

  filtersMap.value.forEach((_, idx) => resetInvalidDependents(idx));
};

const filtersQuery = computed(() => {
  const query: Record<string, string> = {};

  filtersMap.value.forEach((filter) => {
    if (!isFilterVisible(filter)) return;
    if (!filter.modelValue.length) return;
    if (filter.single) {
      query[filter.propertyIndex] = filter.modelValue[0];
    }
    else {
      query[filter.propertyIndex] = filter.modelValue.join(',');
    }
  });
  return query;
});

const updateState = (idx, val) => {
  filtersMap.value[idx].modelValue = val;
  resetInvalidDependents(idx);
  localValue.value = filtersQuery.value;
};

const filtersApplied = computed(() => {
  return filtersMap.value.some(filter => filter.modelValue.length);
});

const clearFilters = () => {
  filtersMap.value.forEach((filter) => {
    filter.modelValue = [];
  });
  localValue.value = {};
};

const toggleFilter = (idx: number) => {
  if (idx > filtersMap.value.length) return;
  filtersMap.value[idx].initialState = !filtersMap.value[idx]?.initialState;
};

const buildOptions = (idx: number, appendToStart: string | null = null) => {
  const someFilters = props.filters[idx];
  if (!someFilters) return [];
  return someFilters.map((option: object) => {
    const [key, value] = Object.entries(option)[0];
    return { [key]: appendToStart ? `${appendToStart} ${String(value).toLowerCase()}` : value };
  }).sort((a, b) => Number(Object.values(a)[0] === null) - Number(Object.values(b)[0] === null));
};

const getFieldValue = (obj, path: string) => {
  return path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .reduce((acc, key) => acc?.[key], obj);
};

const meetsCondition = (obj, cond) => {
  if (!cond) return false;
  const currentValue = getFieldValue(filtersMap.value[obj], cond.field);

  switch (cond.operator) {
    case '>': return currentValue > cond.value;
    case '===': return currentValue === cond.value;
    case '!==': return currentValue !== cond.value;
    case 'in': return cond.value.includes(currentValue);
    default: return false;
  }
};

const isFilterVisible = (filter) => {
  return filter.alwaysDisplay || meetsCondition(filter.dependsOn, filter.displayCondition);
};

const resetInvalidDependents = (idx: number) => {
  filtersMap.value.forEach((filter, filterIdx) => {
    if (filter.dependsOn !== idx) return;
    if (isFilterVisible(filter)) return;

    if (filter.modelValue.length) {
      filter.modelValue = [];
    }

    resetInvalidDependents(filterIdx);
  });
};

watch(
  () => props.modelValue,
  modelValue => syncFiltersFromModelValue(modelValue as Record<string, unknown>),
  { immediate: true, deep: true },
);

const toggleFilters = () => showFilters.value = !showFilters.value;
</script>

<style lang="scss" scoped>
.filters{
  position: relative;
  padding: 24px;
  background: $light-pink;
  min-width: 290px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  &_header{
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    &-title{
      color: $light-brown;
    }
  }
  &_body{
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  &_title{
    color: $light-brown;
    font-weight: 300;
    user-select: none;
    text-transform: uppercase;
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
  }
  .btn_add{
    justify-content: center;
  }
}
</style>
