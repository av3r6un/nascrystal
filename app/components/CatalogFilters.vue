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
      <CatalogFilter
        v-for="filter in visibleFilters"
        :key="filter.propertyIndex"
        :model-value="filter.modelValue"
        :name="filter.name"
        :options="filters[filter.propertyIndex] ?? []"
        :single="filter.single"
        :framed="filter.framed"
        :initial-state="filter.initialState"
        @update:model-value="updateState(filter, $event)"
      />
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
  showForm: {
    type: Boolean,
    default: false,
  },
});
const { t } = useI18n();

const localValue = computed({
  get: () => { return props.modelValue; },
  set: (val) => { emit('update:modelValue', val); },
});

const showFilters = ref(true);

type FilterDefinition = {
  name: string;
  propertyIndex: string;
  initialState: boolean;
  single: boolean;
  framed?: boolean;
  modelValue: string[];
};

onMounted(() => {
  if (document.documentElement.scrollWidth < 630) {
    showFilters.value = false;
  }
});

const filtersMap = ref<FilterDefinition[]>([
  {
    name: 'catalog.filters.category',
    propertyIndex: 'category',
    initialState: false,
    single: true,
    modelValue: [],
  },
  {
    name: 'catalog.filters.cuts',
    propertyIndex: 'cuts',
    initialState: false,
    single: true,
    framed: true,
    modelValue: [],
  },
  {
    name: 'catalog.filters.form',
    propertyIndex: 'form',
    initialState: false,
    single: false,
    modelValue: [],
  },
  {
    name: 'catalog.filters.color',
    propertyIndex: 'color',
    initialState: false,
    single: false,
    modelValue: [],
  },
  {
    name: 'catalog.filters.size',
    propertyIndex: 'size',
    initialState: false,
    single: false,
    modelValue: [],
  },
]);

const visibleFilters = computed(() => filtersMap.value.filter((filter) => {
  if (filter.propertyIndex === 'form') return props.showForm;
  if (filter.propertyIndex === 'cuts') return !props.showForm;
  return true;
}));

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
};

const filtersQuery = computed(() => {
  const query: Record<string, string> = {};
  if (typeof props.modelValue.fixation === 'string' && props.modelValue.fixation) {
    query.fixation = props.modelValue.fixation;
  }

  visibleFilters.value.forEach((filter) => {
    if (!filter.modelValue.length) return;
    if (filter.single) {
      const value = filter.modelValue[0];
      if (value) query[filter.propertyIndex] = value;
    }
    else {
      query[filter.propertyIndex] = filter.modelValue.join(',');
    }
  });
  return query;
});

const updateState = (filter: FilterDefinition, val: string[]) => {
  filter.modelValue = val;
  localValue.value = filtersQuery.value;
};

const filtersApplied = computed(() => {
  return Boolean(props.modelValue.fixation) || visibleFilters.value.some(filter => filter.modelValue.length);
});

const clearFilters = () => {
  filtersMap.value.forEach((filter) => {
    filter.modelValue = [];
  });
  localValue.value = {};
};

watch(
  () => props.modelValue,
  modelValue => syncFiltersFromModelValue(modelValue as Record<string, unknown>),
  { immediate: true, deep: true },
);

watch(
  () => props.showForm,
  (showForm) => {
    const hiddenFilter = filtersMap.value.find(filter => filter.propertyIndex === (showForm ? 'cuts' : 'form'));
    if (!hiddenFilter?.modelValue.length) return;
    hiddenFilter.modelValue = [];
    localValue.value = filtersQuery.value;
  },
  { immediate: true },
);

const resetFilterScroll = () => {
  document.querySelectorAll<HTMLElement>('.filters .filter_options')
    .forEach(element => element.scrollTo({ top: 0 }));
};

const toggleFilters = () => {
  resetFilterScroll();
  showFilters.value = !showFilters.value;
  nextTick(resetFilterScroll);
};
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
  .btn_add{
    justify-content: center;
  }
}
</style>
