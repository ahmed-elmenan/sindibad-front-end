import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  Key, 
  CheckCircle, 
  AlertCircle,
  Eye,
  EyeOff 
} from 'lucide-react';

interface Message {
  type: 'success' | 'error';
  text: string;
}

interface Step3Props {
  newPassword: string;
  confirmPassword: string;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  newPasswordError?: string;
  confirmPasswordError?: string;
  isLoading: boolean;
  message: Message | null;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  onToggleNewPassword: () => void;
  onToggleConfirmPassword: () => void;
}

const Step3: React.FC<Step3Props> = ({
  newPassword,
  confirmPassword,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  newPasswordError,
  confirmPasswordError,
  isLoading,
  message,
  showNewPassword,
  showConfirmPassword,
  onToggleNewPassword,
  onToggleConfirmPassword
}) => {
  const { t } = useTranslation();

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
          <Key className="w-6 h-6 text-secondary" />
        </div>
        <CardTitle className="text-2xl font-bold text-secondary">
          {t('forgetPassword.step3.title')}
        </CardTitle>
        <CardDescription>
          {t('forgetPassword.step3.description')}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">{t('forgetPassword.step3.new_password')}</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => onNewPasswordChange(e.target.value)}
                className={`h-11 ${newPasswordError ? 'border-destructive' : ''} rtl:pl-10 rtl:pr-3 ltr:pr-10 ltr:pl-3`}
                placeholder={t('forgetPassword.step3.password_placeholder')}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute top-0 h-full px-3 py-2 hover:bg-transparent rtl:left-0 ltr:right-0"
                onClick={onToggleNewPassword}
                disabled={isLoading}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {newPasswordError && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {newPasswordError}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('forgetPassword.step3.confirm_password')}</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => onConfirmPasswordChange(e.target.value)}
                className={`h-11 ${confirmPasswordError ? 'border-destructive' : ''} rtl:pl-10 rtl:pr-3 ltr:pr-10 ltr:pl-3`}
                placeholder={t('forgetPassword.step3.password_placeholder')}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute top-0 h-full px-3 py-2 hover:bg-transparent rtl:left-0 ltr:right-0"
                onClick={onToggleConfirmPassword}
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {confirmPasswordError && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {confirmPasswordError}
              </p>
            )}
          </div>

          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <p className="font-medium mb-1">{t('forgetPassword.step3.password_requirements.title')}</p>
            <ul className="space-y-1">
              <li className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`} />
                {t('forgetPassword.step3.password_requirements.min_length')}
              </li>
              <li className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`} />
                {t('forgetPassword.step3.password_requirements.uppercase')}
              </li>
              <li className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${/\d/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`} />
                {t('forgetPassword.step3.password_requirements.number')}
              </li>
              <li className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${/[@$!%*?&]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`} />
                {t('forgetPassword.step3.password_requirements.special')}
              </li>
            </ul>
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

          <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90 text-foreground" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner />
                {t('forgetPassword.step3.resetting')}
              </div>
            ) : (
              t('forgetPassword.step3.reset_button')
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default Step3;
