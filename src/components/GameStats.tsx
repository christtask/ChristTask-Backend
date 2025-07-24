
import { Card } from "@/components/ui/card";
import { Trophy, Target, Zap } from "lucide-react";

interface GameStatsProps {
  score: number;
  streak: number;
  level: number;
}

export const GameStats = ({ score, streak, level }: GameStatsProps) => {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <Card className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-600">Score</p>
            <p className="text-xl font-bold text-slate-800">{score}</p>
          </div>
        </div>
      </Card>
      
      <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-600">Streak</p>
            <p className="text-xl font-bold text-slate-800">{streak}</p>
          </div>
        </div>
      </Card>
      
      <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <Target className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-600">Level</p>
            <p className="text-xl font-bold text-slate-800">{level}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
