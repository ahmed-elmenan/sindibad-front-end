import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'

interface CopyButtonProps {
    text: string
}

export function CopyButton({ text }: CopyButtonProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy text: ', err)
        }
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-6 w-6 p-0 hover:bg-gray-100"
        >
            {copied ? (
                <Check className="h-3 w-3 text-green-600" />
            ) : (
                <Copy className="h-3 w-3 text-gray-500" />
            )}
        </Button>
    )
}