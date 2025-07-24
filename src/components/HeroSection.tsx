import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TypewriterEffect } from "@/components/TypewriterEffect";
import { 
  MessageSquare, 
  ArrowRight,
  Brain,
  Cross,
  Shield,
  BookOpen,
  Zap
} from "lucide-react";
import QnAChatBubble from "@/components/QnAChatBubble";

interface HeroSectionProps {
  onGetStarted: () => void;
  onHowItWorks: () => void;
  variant?: 'landing' | 'app';
  className?: string;
}

export const HeroSection = ({ 
  onGetStarted, 
  onHowItWorks, 
  variant = "landing",
  className = ""
}: HeroSectionProps) => {
  const isLanding = variant === 'landing';

  return (
    <section className={`relative pt-20 pb-16 min-h-screen bg-black ${className}`}>
      {/* Removed hero-particles and floating icons for static background */}


      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in-up">
          <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold mb-6 animate-fade-in ${
            isLanding 
              ? 'bg-blue-500/20 text-blue-200 border-blue-400/30' 
              : 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700/30'
          }`}>
            <Brain className="w-4 h-4 mr-2" />
            AI-Powered Christian Apologetics
          </div>
          
          <h1 className={`text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in-up ${
            isLanding ? 'text-white' : 'text-slate-900 dark:text-white'
          }`}>
            <TypewriterEffect 
              phrases={[
                'never claimed he was God',
                'is just a prophet',
                'is only human'
              ]}
              speed={30}
              deleteSpeed={15}
              pauseTime={1500}
              className="justify-center"
              jesusClassName={isLanding ? 'text-purple-400 font-bold' : 'text-slate-900 dark:text-white font-bold'}
              typewriterClassName={isLanding ? 'text-white' : 'text-slate-600 dark:text-slate-400'}
            />
          </h1>
          
          <p 
            className={`mb-6 max-w-3xl mx-auto leading-relaxed animate-fade-in ${
            isLanding ? 'text-blue-100' : 'text-slate-600 dark:text-slate-400'
            }`}
            style={{
              fontFamily: 'Inter, "Inter Regular", Arial, sans-serif',
              fontWeight: 400,
              fontSize: '20px',
              letterSpacing: '0.2px'
            }}
          >
            Simply ask it a question, and it counters with Scripture, morality, and proof.
          </p>
          
          <div className="flex flex-col gap-4 justify-center items-center mb-6 animate-fade-in-up">
            <Button
              onClick={onGetStarted}
              size="lg"
              className="debate-button"
            >
              Never lose a debate
            </Button>
            <div 
              className="text-gray-300 -mt-1"
              style={{
                fontFamily: 'Inter, "Inter Regular", Arial, sans-serif',
                fontWeight: 400,
                fontSize: '14px',
                letterSpacing: '0.2px'
              }}
            >
              (Instantly)
            </div>
          </div>
        </div>
                  
        {/* Stats */}
        <div className="flex justify-center mt-4">
          <QnAChatBubble />
        </div>
      </div>
    </section>
  );
}; 