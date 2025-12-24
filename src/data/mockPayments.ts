import type { PaymentMethod } from '@/types/Payment';
import type { PaymentConfig } from '@/services/payment.service';

export const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 1,
    name: 'Bank Transfer',
    icon: 'https://cdn-icons-png.flaticon.com/512/2830/2830289.png',
    titleKey: 'payment.methods.bank.title',
    descriptionKey: 'payment.methods.bank.description',
    config: 'bankAccount'
  },
  {
    id: 2,
    name: 'WafaCash',
    icon: 'https://cdn-icons-png.flaticon.com/512/1019/1019607.png',
    titleKey: 'payment.methods.wafaCash.title',
    descriptionKey: 'payment.methods.wafaCash.description',
    config: 'wafaCash'
  },
  {
    id: 3,
    name: 'CashPlus',
    icon: 'https://cdn-icons-png.flaticon.com/512/2489/2489756.png',
    titleKey: 'payment.methods.cashPlus.title',
    descriptionKey: 'payment.methods.cashPlus.description',
    config: 'cashPlus'
  }
];

export const mockPaymentConfig: PaymentConfig = {
  bankAccount: {
    bankName: 'Bank Al-Maghrib',
    iban: 'MA00 1234 5678 9012 3456 7890',
    rib: '123456789012345678901234',
    accountHolder: 'Tech-57 Academy'
  },
  wafaCash: {
    beneficiary: 'Tech-57 Academy',
    phoneNumber: '+212 612345678'
  },
  cashPlus: {
    beneficiary: 'Tech-57 Academy',
    phoneNumber: '+212 698765432'
  }
};