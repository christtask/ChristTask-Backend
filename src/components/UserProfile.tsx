
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const UserProfile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You've been signed out successfully."
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!user) return null;

  return (
    <div className="flex items-center space-x-4 bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center space-x-3">
        <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-full">
          <User className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {user.email}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Signed in
          </p>
        </div>
      </div>
      <Button
        onClick={handleSignOut}
        variant="outline"
        size="sm"
        className="flex items-center space-x-2"
      >
        <LogOut className="h-4 w-4" />
        <span>Sign Out</span>
      </Button>
    </div>
  );
};
