import parsePhoneNumber from 'libphonenumber-js';

type PrettyPhoneFormat = 'national' | 'international';

export const usePrettyPhone = () => {
  return (phonenumber: string, format: PrettyPhoneFormat = 'national') => {
    let prPhone = phonenumber;

    try {
      const phoneNumber = parsePhoneNumber(phonenumber);
      if (phoneNumber && format === 'national') {
        prPhone = phoneNumber.formatNational();
      }
      if (phoneNumber && format === 'international') {
        prPhone = phoneNumber.formatInternational();
      }
    }
    catch {
      prPhone = phonenumber;
    }

    return prPhone;
  };
};
