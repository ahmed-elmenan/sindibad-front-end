import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  ArrowLeft, 
  Mail, 
  CheckCircle, 
  AlertCircle
} from 'lucide-react';

interface Step1Props {
  email: string;
  onEmailChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  emailError?: string;
  isLoading: boolean;
  message?: {
    type: 'success' | 'error';
    text: string;
  } | null;
}

const Step1: React.FC<Step1Props> = ({
  email,
  onEmailChange,
  onSubmit,
  emailError,
  isLoading,
  message
}) => {
  const { t } = useTranslation();

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Mail className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold text-primary">
          {t('forgetPassword.step1.title')}
        </CardTitle>
        <CardDescription>
          {t('forgetPassword.step1.description')}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('forgetPassword.step1.email')}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              className={`h-11 ${emailError ? 'border-destructive' : ''}`}
              placeholder={t('forgetPassword.step1.email_placeholder')}
              disabled={isLoading}
            />
            {emailError && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {emailError}
              </p>
            )}
          </div>

          {message && (
            <Alert className={message.type === 'error' ? 'border-destructive bg-destructive/10' : 'border-accent bg-accent/10'}>
              {message.type === 'error' ? (
                <AlertCircle className="h-4 w-4 text-destructive" />
              ) : (
                <CheckCircle className="h-4 w-4 text-accent" />
              )}
              <AlertDescription className="text-foreground">
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || (message?.type === 'success')}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner />
                {t('forgetPassword.step1.sending')}
              </div>
            ) : message?.type === 'success' ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                {t('forgetPassword.step1.email_sent')}
              </div>
            ) : (
              t('forgetPassword.step1.send_button')
            )}
          </Button>

          <div className="text-center pt-4">
            <Link 
              to="/signin" 
              className="text-sm text-primary hover:underline flex items-center justify-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('forgetPassword.step1.back_to_login')}
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default Step1;
