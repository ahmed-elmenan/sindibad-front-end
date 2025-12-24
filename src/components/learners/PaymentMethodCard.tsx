import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CopyButton } from '@/components/ui/copy-button';
import type { PaymentMethodResponse } from '@/types/Payment';
import { useTranslation } from 'react-i18next';

interface PaymentMethodCardProps {
    method: PaymentMethodResponse;
    isSelected: boolean;
    onSelect: () => void;
}

export function PaymentMethodCard({ method, isSelected, onSelect }: PaymentMethodCardProps) {
    const { t } = useTranslation();

    return (
        <Card
            className={`group relative overflow-hidden transition-all duration-300 cursor-pointer h-full flex flex-col ${isSelected
                    ? 'ring-2 ring-primary shadow-lg bg-primary/5 scale-[1.02]'
                    : 'hover:border-primary/30 hover:scale-[1.01] hover:shadow-md'
                }`}
            onClick={onSelect}
        >
            <div
                className={`absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent 
        opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${isSelected ? 'opacity-100' : ''}`}
            />

            <CardHeader className="relative space-y-3 pb-4 flex-none">
                <CardTitle className="flex items-center gap-4 text-xl font-bold">
                    <div
                        className={`p-1 rounded-xl shadow-sm transition-all duration-300 flex-shrink-0 ${isSelected
                                ? 'bg-primary text-white shadow-md'
                                : 'bg-primary/10 text-primary group-hover:bg-primary/20'
                            }`}
                    >
                        <img 
                            src={method.image_url} 
                            alt={method.name} 
                            className="h-16 w-16 rounded-xl" 
                        />
                    </div>
                    {method.name}
                </CardTitle>
                <p className="text-sm text-gray-600 leading-relaxed">
                    {method.description}
                </p>
            </CardHeader>

            <CardContent className="relative pt-0 flex-grow">
                <dl className="grid gap-4">
                    {Object.entries(method.details).map(([key, value]) => (
                        <div key={key} className="space-y-1.5">
                            <dt className="text-sm font-semibold text-gray-800"> 
                                {t(`payment.methods.${method.type.toLowerCase()}.${key.toLowerCase()}`)}
                            </dt>
                            <dd className="font-mono text-sm bg-white p-3 rounded-lg flex items-start gap-2 shadow-sm border border-gray-100/80 hover:border-primary/20 transition-colors duration-200 w-full group/copy">
                                <span className="text-gray-700 flex-1 break-all leading-relaxed">
                                    {value}
                                </span>
                                <CopyButton
                                    text={value}
                                    className="opacity-40 group-hover/copy:opacity-100 transition-opacity duration-200 flex-shrink-0 hover:text-primary mt-0.5"
                                />
                            </dd>
                        </div>
                    ))}
                </dl>
            </CardContent>
        </Card>
    );
}