
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface ModeSelectorProps {
  isDebateMode: boolean;
  onToggle: (enabled: boolean) => void;
}

export const ModeSelector = ({ isDebateMode, onToggle }: ModeSelectorProps) => {
  return (
    <Card className="p-4 mb-6 bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-800 mb-1">
            {isDebateMode ? "Muslim-Atheist Asks Mode" : "Personal Guidance Mode"}
          </h3>
          <p className="text-sm text-slate-600">
            {isDebateMode 
              ? "Challenging questions from different worldviews" 
              : "Gentle, personal theological guidance"
            }
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-slate-700">Debate Mode</span>
          <Switch 
            checked={isDebateMode} 
            onCheckedChange={onToggle}
          />
        </div>
      </div>
    </Card>
  );
};
