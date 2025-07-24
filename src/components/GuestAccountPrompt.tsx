
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGuestAuth } from '@/hooks/useGuestAuth';
import { X, Shield, Clock } from 'lucide-react';

export const GuestAccountPrompt = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { promoteGuestToFullAccount, skipAccountCreation, guestUser } = useGuestAuth();

  const handleCreateAccount = async () => {
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { error: promotionError } = await promoteGuestToFullAccount(password);
    if (promotionError) {
      setError('Error creating account: ' + (promotionError.message || 'Unknown error'));
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="bg-amber-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-amber-600" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                Secure Your Account
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={skipAccountCreation}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-gray-600 text-sm">
            You're currently using a temporary account. Create a password to secure your subscription and data.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center text-blue-700 text-sm">
              <Clock className="h-4 w-4 mr-2" />
              <span>Email: {guestUser?.email}</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <Label htmlFor="password" className="text-sm font-medium">
                Choose Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (min 6 characters)"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              onClick={skipAccountCreation}
              variant="outline"
              className="flex-1"
            >
              Skip for Now
            </Button>
            <Button
              onClick={handleCreateAccount}
              disabled={loading || !password || password !== confirmPassword}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading ? 'Creating...' : 'Secure Account'}
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-3">
            Skip now and we'll remind you later. Your subscription remains active.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
