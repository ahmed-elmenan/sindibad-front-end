"use client"

import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Upload, CreditCard, CheckCircle, Wallet } from 'lucide-react'
import { PaymentMethodCard } from '@/components/learners/PaymentMethodCard'
import { PaymentInstructionsSection } from '@/components/learners/PaymentInstructionsSection'
import { submitPaymentReceipt, getPaymentMethods, type PaymentMethod } from '@/services/payment.service'

export default function PaymentDetailsPage() {
    const { t } = useTranslation()
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [file, setFile] = useState<File | null>(null)
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)
    const [selectedMethod, setSelectedMethod] = useState<number | null>(null)
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const methodsResponse = await getPaymentMethods()

                if (!methodsResponse.success) {
                    throw new Error(methodsResponse.message)
                }

                setPaymentMethods(methodsResponse.data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load payment data')
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0]
        if (!selectedFile) return

        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
        if (!validTypes.includes(selectedFile.type)) {
            setStatus({
                type: 'error',
                message: t('payment.error.invalid_file_type')
            })
            return
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            setStatus({
                type: 'error',
                message: t('payment.error.file_too_large')
            })
            return
        }

        setFile(selectedFile)
        setStatus(null)
        setCurrentStep(3)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) {
            setStatus({
                type: 'error',
                message: t('payment.error.no_file')
            })
            return
        }

        setIsSubmitting(true)
        setStatus(null)

        try {
            const result = await submitPaymentReceipt(file, selectedMethod || 0)

            setStatus({
                type: result.success ? 'success' : 'error',
                message: result.success ? t('payment.success.receipt_submitted') : t('payment.error.submission_failed')
            })

            if (result.success) {
                setFile(null)
                const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
                if (fileInput) fileInput.value = ''
            }
        } catch (error) {
            setStatus({
                type: 'error',
                message: t('payment.error.submission_failed')
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const selectMethod = (index: number) => {
        setSelectedMethod(index)
        setCurrentStep(2)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Alert variant="destructive" className="max-w-lg">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b   py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto space-y-10">
                    {/* Progress Steps */}
                    <div className="flex items-center justify-center px-4 sm:px-0">
                        <div className="flex items-center space-x-2 sm:space-x-6">
                            {[
                                { step: 1, label: t('progress.choose') },
                                { step: 2, label: t('progress.pay') },
                                { step: 3, label: t('progress.confirm') }
                            ].map(({ step, label }, index) => (
                                <div key={step} className="flex items-center">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-sm sm:text-base font-semibold transition-all duration-300 ${currentStep >= step
                                            ? 'bg-primary text-white shadow-lg ring-2 sm:ring-4 ring-primary/20'
                                            : 'bg-gray-100 text-gray-400 border-2 border-gray-200'}`}>
                                            {currentStep > step ? (
                                                <CheckCircle className="h-5 w-5 sm:h-7 sm:w-7" />
                                            ) : (
                                                step
                                            )}
                                        </div>
                                        <span className={`mt-2 sm:mt-3 text-xs sm:text-sm font-medium ${currentStep >= step ? 'text-primary' : 'text-gray-400'}`}>
                                            {label}
                                        </span>
                                    </div>
                                    {index < 2 && (
                                        <div className={`h-1 w-12 sm:w-24 mx-2 sm:mx-4 rounded-full transition-all duration-300 ${currentStep > step ? 'bg-primary' : 'bg-gray-200'}`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Header Card */}
                    <Card className="border-none shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
                        <CardHeader className="text-center space-y-4 bg-gradient-to-r from-primary/5 to-primary/10 p-8 rounded-t-xl">
                            <CardTitle className="text-3xl font-bold flex items-center justify-center gap-4 text-primary">
                                <div className="flex items-center gap-2">
                                    <CreditCard className="h-10 w-10" />
                                </div>
                                {t('payment.title')}
                            </CardTitle>
                            <CardDescription className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                {t('payment.description')}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-8 p-8">
                            {/* Payment Methods */}
                            <div className="space-y-8">
                                <h3 className="text-2xl font-bold flex items-center gap-4 text-gray-800 border-b pb-4">
                                    <Wallet className="h-7 w-7 text-primary" />
                                    {t('payment.methods.title')}
                                </h3>
                                <div className="grid md:grid-cols-2 gap-8">
                                    {paymentMethods.map((method, index) => (
                                        <PaymentMethodCard
                                            key={index}
                                            method={method}
                                            isSelected={selectedMethod === index}
                                            onSelect={() => selectMethod(index)}
                                        />
                                    ))}
                                </div>
                            </div>

                            

                            {/* Receipt Upload */}
                            <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="receipt" className="text-xl font-semibold flex items-center gap-3">
                                                <Upload className="h-6 w-6 text-primary" />
                                                {t('payment.receipt.label')}
                                            </Label>
                                            {file && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setFile(null)
                                                        if (fileInputRef.current) fileInputRef.current.value = ''
                                                    }}
                                                    className="text-gray-500 hover:text-gray-700"
                                                >
                                                    {t('payment.receipt.remove')}
                                                </Button>
                                            )}
                                        </div>

                                        <div
                                            className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${file ? 'bg-primary/5 border-primary/30' : 'border-gray-200 hover:border-primary/20 bg-gray-50/50'}`}
                                            onDragOver={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                            }}
                                            onDrop={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                const droppedFile = e.dataTransfer.files?.[0]
                                                if (!droppedFile) return
                                                
                                                // Validate by mimicking the input's accept filter
                                                const allowed = /^(image\/.*|application\/pdf)$/i.test(droppedFile.type) || /\.(png|jpe?g|pdf)$/i.test(droppedFile.name)
                                                const withinSize = droppedFile.size <= 5 * 1024 * 1024
                                                
                                                if (!allowed || !withinSize) {
                                                    setStatus({
                                                        type: 'error',
                                                        message: !allowed ? t('payment.error.invalid_file_type') : t('payment.error.file_too_large')
                                                    })
                                                    return
                                                }
                                                
                                                const event = { target: { files: [droppedFile] } } as unknown as React.ChangeEvent<HTMLInputElement>
                                                handleFileChange(event)
                                            }}
                                        >
                                            <Input
                                                id="receipt"
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*,.pdf"
                                                onChange={handleFileChange}
                                                disabled={isSubmitting}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div className="text-center space-y-4">
                                                {file ? (
                                                    <div className="space-y-4">
                                                        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                                                            <CheckCircle className="h-8 w-8 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="text-lg font-semibold text-gray-700">{file.name}</p>
                                                            <p className="text-sm text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                                                            <Upload className="h-8 w-8 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="text-lg font-semibold text-gray-700">{t('payment.receipt.dropzone')}</p>
                                                            <p className="text-sm text-gray-500">{t('payment.receipt.help')}</p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {status && (
                                        <Alert
                                            variant={status.type === 'error' ? 'destructive' : 'default'}
                                            className={`animate-in slide-in-from-top-2 ${status.type === 'error' ? 'bg-destructive/5' : 'bg-primary/5'}`}
                                        >
                                            {status.type === 'error' ? (
                                                <AlertCircle className="h-4 w-4" />
                                            ) : (
                                                <CheckCircle className="h-4 w-4" />
                                            )}
                                            <AlertDescription>{status.message}</AlertDescription>
                                        </Alert>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={!file || isSubmitting}
                                        className={`w-full h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ${!file ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                                                {t('payment.receipt.submitting')}
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-2">
                                                <Upload className="h-5 w-5" />
                                                {t('payment.receipt.submit')}
                                            </div>
                                        )}
                                    </Button>
                                </form>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}