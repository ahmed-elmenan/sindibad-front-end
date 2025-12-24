// Payment configuration
export const getPaymentConfig = () => ({
    // Static logo URLs for payment methods (to be replaced with backend URLs later)
    logos: {
        bankLogo: '/payment-logos/bank.png',
        wafaCashLogo: '/payment-logos/wafacash.png',
        cashPlusLogo: '/payment-logos/cashplus.png'
    },
    bankAccount: {
        bankName: import.meta.env.VITE_BANK_NAME || '',
        iban: import.meta.env.VITE_BANK_IBAN || '',
        rib: import.meta.env.VITE_BANK_RIB || '',
        accountHolder: import.meta.env.VITE_BANK_ACCOUNT_HOLDER || ''
    },
    wafaCash: {
        beneficiary: import.meta.env.VITE_WAFACASH_BENEFICIARY || '',
        phoneNumber: import.meta.env.VITE_WAFACASH_PHONE || ''
    },
    cashPlus: {
        beneficiary: import.meta.env.VITE_CASHPLUS_BENEFICIARY || '',
        phoneNumber: import.meta.env.VITE_CASHPLUS_PHONE || ''
    }
})

// Validate required payment configuration
export const validatePaymentConfig = () => {
    const config = getPaymentConfig()
    const requiredFields = [
        ['bankAccount.bankName', config.bankAccount.bankName],
        ['bankAccount.iban', config.bankAccount.iban],
        ['bankAccount.rib', config.bankAccount.rib],
        ['bankAccount.accountHolder', config.bankAccount.accountHolder],
        ['wafaCash.beneficiary', config.wafaCash.beneficiary],
        ['wafaCash.phoneNumber', config.wafaCash.phoneNumber],
        ['cashPlus.beneficiary', config.cashPlus.beneficiary],
        ['cashPlus.phoneNumber', config.cashPlus.phoneNumber]
    ]

    const missingFields = requiredFields.filter(([key, value]) => !value)
    if (missingFields.length > 0) {
        throw new Error(
            `Missing required payment configuration: ${missingFields
                .map(([key]) => key)
                .join(', ')}`
        )
    }

    return config
}