
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, Users } from "lucide-react";

interface NavigationProps {
  activeMode: string;
  onModeChange: (mode: string) => void;
}

export const Navigation = ({ activeMode, onModeChange }: NavigationProps) => {
  const modes = [
    {
      id: "chat",
      title: "AI Apologist",
      description: "Personal theological guidance",
      icon: MessageSquare,
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      id: "debate",
      title: "Muslim-Atheist Asks",
      description: "Challenging questions mode",
      icon: Users,
      gradient: "from-purple-500 to-pink-600"
    }
  ];

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {modes.map((mode) => (
          <Card 
            key={mode.id}
            className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 ${
              activeMode === mode.id 
                ? 'border-indigo-400 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50' 
                : 'border-transparent hover:border-slate-200'
            }`}
            onClick={() => onModeChange(mode.id)}
          >
            <div className="p-6 text-center">
              <div className={`mx-auto mb-4 p-4 rounded-xl bg-gradient-to-r ${mode.gradient} w-fit`}>
                <mode.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-lg text-slate-800 mb-2">{mode.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{mode.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
