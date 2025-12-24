import { validatePaymentConfig } from '@/config/payment.config'

export const methodIcons = {
    bank: 'Banknote',
    transfer: 'Smartphone'
} as const

export interface PaymentMethod {
    type: 'bank' | 'transfer'
    name: string
    details: Record<string, string>
    icon: keyof typeof methodIcons
    color: string
}

export const PAYMENT_METHODS = (): PaymentMethod[] => {
    const config = validatePaymentConfig()

    return [
        {
            type: 'bank',
            name: 'Compte Bancaire',
            icon: 'bank',
            color: 'primary',
            details: {
                'Nom de la banque': config.bankAccount.bankName,
                'IBAN': config.bankAccount.iban,
                'RIB': config.bankAccount.rib,
                'Titulaire': config.bankAccount.accountHolder
            }
        },
        {
            type: 'transfer',
            name: 'WafaCash',
            icon: 'transfer',
            color: 'primary',
            details: {
                'Bénéficiaire': config.wafaCash.beneficiary,
                'Numéro': config.wafaCash.phoneNumber
            }
        },
        {
            type: 'transfer',
            name: 'Cash Plus',
            icon: 'transfer',
            color: 'primary',
            details: {
                'Bénéficiaire': config.cashPlus.beneficiary,
                'Numéro': config.cashPlus.phoneNumber
            }
        }
    ]
}


export interface PaymentMethodDetails {
  number?: string;
  beneficiary?: string;
  account_holder?: string;
  iban?: string;
  bank_name?: string;
  rib?: string;
}

export interface PaymentMethod {
  image_url: string;
  name: string;
  description: string;
  details: PaymentMethodDetails;
  type: 'Virement' | 'Bank';
}

export interface PaymentMethodsResponse {
  success: boolean;
  message?: string;
  data: PaymentMethod[];
}

export interface ReceiptSubmissionResponse {
  success: boolean;
  message: string;
}

export interface PaymentMethodsApiResponse {
  payment_methods: PaymentMethod[];
}