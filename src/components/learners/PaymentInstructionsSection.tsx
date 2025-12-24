import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function PaymentInstructionsSection() {
    const { t } = useTranslation()

    return (
        <div className="space-y-4 bg-muted/5 p-6 rounded-xl border border-muted">
            <h3 className="text-lg font-semibold flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-primary" />
                {t('payment.instructions.title')}
            </h3>
            <ol className="list-decimal list-inside space-y-3 ml-4">
                <li className="text-gray-700 flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-muted text-primary rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                    <span>{t('payment.instructions.step1')}</span>
                </li>
                <li className="text-gray-700 flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-muted text-primary rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                    <span>{t('payment.instructions.step2')}</span>
                </li>
                <li className="text-gray-700 flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-muted text-primary rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                    <span>{t('payment.instructions.step3')}</span>
                </li>
            </ol>
        </div>
    )
}