import { getPaymentConfig } from './payment.config'
import { CreditCard, Banknote, Building } from 'lucide-react'

export interface PaymentMethod {
    id: string
    titleKey: string
    descriptionKey: string
    icon: typeof CreditCard | typeof Banknote | typeof Building
    instructions: string[]
    config: keyof ReturnType<typeof getPaymentConfig>
}

export const PAYMENT_METHODS: PaymentMethod[] = [
    {
        id: 'bank-transfer',
        titleKey: 'payment.methods.bank.title',
        descriptionKey: 'payment.methods.bank.description',
        icon: Building,
        instructions: [
            'Connectez-vous à votre compte bancaire',
            'Sélectionnez l\'option de virement',
            'Saisissez les informations bancaires ci-dessous',
            'Gardez une copie du reçu'
        ],
        config: 'bankAccount'
    },
    {
        id: 'wafacash',
        titleKey: 'payment.methods.wafaCash.title',
        descriptionKey: 'payment.methods.wafaCash.description',
        icon: Banknote,
        instructions: [
            'Rendez-vous dans une agence WafaCash',
            'Fournissez les informations du bénéficiaire',
            'Effectuez le paiement',
            'Conservez votre reçu'
        ],
        config: 'wafaCash'
    },
    {
        id: 'cashplus',
        titleKey: 'payment.methods.cashPlus.title',
        descriptionKey: 'payment.methods.cashPlus.description',
        icon: CreditCard,
        instructions: [
            'Rendez-vous dans une agence CashPlus',
            'Fournissez les informations du bénéficiaire',
            'Effectuez le paiement',
            'Conservez votre reçu'
        ],
        config: 'cashPlus'
    }
]