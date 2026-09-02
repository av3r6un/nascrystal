<template>
  <div class="order_status">
    <div class="order_status-states">
      <div
        v-for="(phase, idx) in phases"
        :key="phase.key"
        class="order_status-state"
        :class="{
          active: idx <= currentStatusIdx,
          current: idx === currentStatusIdx,
        }"
      >
        <div class="order_status-bullet">
          <div
            class="order_status-bullet__content"
            :class="{ active: idx <= currentStatusIdx }"
          >
            <span v-if="idx < currentStatusIdx">&check;</span>
            <span v-else-if="idx === currentStatusIdx">&#9679;</span>
            <span v-else>&#9675;</span>
          </div>
        </div>
        <div class="order_status-text">
          {{ phase.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
});

const { tm } = useI18n();

const phasesObj = tm('panel.statuses');
const phases = computed(() => {
  return Object.entries(phasesObj)
    .filter(([key]) => key !== 'canceled')
    .map(([key, label]) => ({
      key,
      label: String(label),
    }));
});

const currentStatusIdx = computed(() => {
  return phases.value.findIndex(phase => phase.key === props.modelValue);
});
</script>

<style lang="scss" scoped>
.order_status{
  &-states{
    display: flex;
    gap: 30px;
    @media (max-width: 490px) {
      flex-direction: column;
    }
  }
  &-state{
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    &:last-child::after { display: none; }
    &:first-child::before { display: none; }
    &.active{
      .order_status-text{
        color: $brown;
      }
      &:after, &:before{
        background: $brown;
      }
    }
    &.current{
      .order_status-bullet {
        color: $brown;
        background: $semi-grey;
      }
      &:after{
        background: $light-brown;
      }
      .order_status-text{
        animation: light-blink infinite linear 3s;
      }
    }
    &:after,
    &:before{
      position: absolute;
      content: '';
      top: 25%;
      width: 20px;
      height: 3px;
      background: $light-brown;
      @media (max-width: 490px) {
        width: 3px;
        height: 10px;
        left: 16px;
      }
    }
    &:before{
      left: -15px;
      border-radius: 0 3px 3px 0;
      @media (max-width: 490px) {
        left: 16px;
        border-radius: 2px 2px 0 0;
        bottom: calc(100% + 15px);
        top: auto;
      }
    }
    &:after{
      right: -15px;
      border-radius: 3px 0 0 3px;
      @media (max-width: 490px) {
        right: auto;
        border-radius: 0 0 2px 2px;
        top: calc(100% + 15px);
      }
    }
    @media (max-width: 490px) {
      flex-direction: row;
      align-items: center;
      justify-items: flex-start;
      gap: 10px;
    }
  }
  &-bullet{
    border-radius: 50%;
    background: $pinky;
    width: 35px;
    aspect-ratio: 1 / 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba($brown, .6);
    margin-bottom: 10px;
    border: 1px solid transparent;
    @media (max-width: 490px) {
      margin-bottom: 0;
    }
    &:has(.active) {
      color: $white;
      background: $light-brown;
      border-color: $brown;
    }
  }
  &-text{
    font-size: 12px;
    width: 75px;
    text-align: center;
    color: rgba($brown, .6);
    @media (max-width: 490px) {
      text-align: left;
    }
  }
}
@keyframes light-blink {
  0% {
    opacity: .4;
  }
  50% {
    opacity: .9;
  }
  100% {
    opacity: .4;
  }
}
</style>
