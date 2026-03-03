<template>
  <div class="panel_stat">
    <div class="panel_stat-wrapper">
      <div class="panel_stat-header">
        <div class="panel_stat-title">
          {{ title }}
        </div>
        <div class="panel_stat-icon">
          <Icon :name="`nsc:${icon}`" :size="24" />
        </div>
      </div>
      <div class="panel_stat-content">
        {{ contentToText }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  number: Number,
  date: Number,
});

const { locale, t } = useI18n();

const contentToText = computed(() => {
  let result = props.number?.toString();
  if (props.date) {
    result = formatSmartDate(props.date);
  }
  return result;
});

const formatSmartDate = (input: number) => {
  const date = new Date(input * 1000);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.round(
    (startOfDay(date).getTime() - startOfDay(now).getTime()) / dayMs,
  );
  if (diffDays === 0) return t('dates.today');
  if (diffDays === -1) return t('dates.yesterday');

  return new Intl.DateTimeFormat(locale.value, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};
</script>

<style lang="scss" scoped>
.panel_stat{
  width: 100%;
  display: flex;
  @media (max-width: 705px) {
    // flex-basis: 220px;
    flex: 1;
  }
  @media (max-width: 505px) {
    display: block;
    flex: 0;
  }
  &-wrapper{
    padding: 24px;
    background: $light-pink;
    border-radius: 8px;
    width: 100%;
    display: flex;
    flex-direction: column;
    border: 1px solid $semi-grey;
    gap: 12px;
    @media (max-width: 970px) {
      align-items: center;
      flex: 1;
      width: auto;
    }
    @media (max-width: 505px) {
      width: 220px;
    }
  }
  &-header{
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: $light-brown;
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    @media (max-width: 970px) {
      justify-content: center;
    }
    @media (max-width: 900px) {
      white-space: wrap;
      text-align: center;
    }
    @media (max-width: 768px) {
      white-space: nowrap;
    }
  }
  &-content{
    font-size: 24px;
    color: $brown;
    font-weight: 600;
  }
  &-icon{
    display: flex;
    @media (max-width: 970px) {
      display: none;
    }
  }
}
</style>
