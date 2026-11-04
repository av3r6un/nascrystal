<template>
  <div class="input" :class="{ valid: isValid }">
    <div v-if="name" class="input_name" :class="{ required }">
      {{ te(name) ? t(name) : name }}
    </div>
    <div class="input_field">
      <transition name="fade-slide">
        <div v-show="dialCode" class="input_country">
          <span class="flag">{{ countryFlag }}</span>
          <span class="code">{{ dialCode }}</span>
        </div>
      </transition>
      <input
        type="tel"
        class="input_wide"
        :value="nationalNumber"
        placeholder="+0 000 000-00-00"
        @input="onInput"
      >
    </div>
  </div>
</template>

<script lang="ts" setup>
import { AsYouType } from 'libphonenumber-js';

const props = defineProps({
  name: {
    type: String,
    required: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: [String, null] as PropType<string | null | undefined>,
    default: undefined,
  },
});

const { te, t } = useI18n();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const nationalNumber = ref('');
const countryFlag = ref<string | null>(null);
const dialCode = ref('');
const isValid = ref(true);

const formatInput = (value: string) => {
  const formatter = new AsYouType();
  const formatted = formatter.input(value);
  const country = formatter.getCountry();
  const callingCode = formatter.getCallingCode();
  countryFlag.value = country
    ? String.fromCodePoint(...[...country].map(char => 0x1F1E6 + char.charCodeAt(0) - 65))
    : null;
  dialCode.value = callingCode ? `+${callingCode}` : '';
  nationalNumber.value = callingCode
    ? formatted.slice(dialCode.value.length).trimStart()
    : formatted;
  isValid.value = value === '' ? !props.required : formatter.isValid();
  return formatter.getChars();
};

watch(() => props.modelValue, (value) => {
  formatInput(value ?? '');
}, { immediate: true });

const onInput = (e: Event) => {
  const target = e.target;
  if (!(target instanceof HTMLInputElement)) return;

  const value = target.value;
  const internationalValue = value === '' || value.startsWith('+')
    ? value
    : `${dialCode.value}${value}`;
  const normalized = formatInput(internationalValue);
  target.value = nationalNumber.value;
  emit('update:modelValue', normalized);
};
</script>

<style lang="scss" scoped>
.input{
  &_name{
    color: $brown;
    font-size: 16px;
    margin-bottom: 10px;
    font-weight: 600;
    &.required{
      position: relative;
      &:after{
        position: relative;
        content: '*';
        right: -2px;
        color: red;
        font-size: 11px;
        top: -5px;
      }
    }
  }
  &.valid{
    .input_field{
      border-color: $semi-grey;
    }
  }
  &_field{
    display: flex;
    align-items: center;
    border: 1px solid $light-red;
    background: $white;
    padding: 0 12px;
    border-radius: 6px;
    transition: border-color .2s ease;
  }
  &_country{
    display: flex;
    align-items: center;
    padding: 0 5px;
    color: $brown;
    font-size: 14px;
    .flag{
      margin-right: 5px;
      font-size: 16px;
    }
  }
  .input_wide{
    width: 100%;
    background: transparent;
    border: none;
    padding: 0;
  }
}
.fade-slide-enter-active,
.fade-slide-leave-active{
  transition: all .25s ease, transform .25s ease, margin-right .25s ease, width .25s ease,;
}
.fade-slide-enter-from{
  opacity: 0;
  transform: translateX(-12px);
  width: 0;
  margin-right: 0;
}
.fade-slide-enter-to{
  opacity: 1;
  transform: translateX(0);
  width: auto;
  margin-right: 8px;
}
.fade-slide-leave-from{
  opacity: 1;
  transform: translateX(0);
  width: auto;
  margin-right: 8px;
}
.fade-slide-leave-to{
  opacity: 0;
  transform: translateX(12px);
  width: 0;
  margin-right: 0;
}
</style>
