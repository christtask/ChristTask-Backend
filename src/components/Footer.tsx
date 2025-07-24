import { Button } from "@/components/ui/button";
import { 
  Cross, 
  ExternalLink, 
  Heart, 
  Globe, 
  Book, 
  Video, 
  Mic, 
  MessageSquare,
  Users,
  CheckCircle,
  Zap
} from "lucide-react";

interface FooterProps {
  onLogoClick?: () => void;
  onHowItWorks?: () => void;
  onAuthAction?: (action: 'signin' | 'signup') => void;
  variant?: 'landing' | 'app';
}

export const Footer = ({ 
  onLogoClick, 
  onHowItWorks, 
  onAuthAction, 
  variant = "landing" 
}: FooterProps) => {
  const christianResources = [
    {
      name: "Bible Gateway",
      url: "https://www.biblegateway.com",
      icon: Book,
      description: "Multiple Bible translations and study tools"
    },
    {
      name: "Got Questions",
      url: "https://www.gotquestions.org",
      icon: MessageSquare,
      description: "Biblical answers to theological questions"
    },
    {
      name: "Desiring God",
      url: "https://www.desiringgod.org",
      icon: Heart,
      description: "John Piper's ministry resources"
    },
    {
      name: "Ligonier Ministries",
      url: "https://www.ligonier.org",
      icon: Video,
      description: "Reformed theology and teaching"
    },
    {
      name: "Reasonable Faith",
      url: "https://www.reasonablefaith.org",
      icon: Users,
      description: "William Lane Craig's apologetics ministry"
    },
    {
      name: "Stand to Reason",
      url: "https://www.str.org",
      icon: CheckCircle,
      description: "Christian apologetics training"
    }
  ];

  const quickLinks = [
    {
      name: "How It Works",
      action: onHowItWorks,
      icon: Zap
    },
    {
      name: "Sign In",
      action: () => onAuthAction?.('signin'),
      icon: Users
    },
    {
      name: "Get Started",
      action: () => onAuthAction?.('signup'),
      icon: CheckCircle
    },
    {
      name: "Contact Us",
      action: () => window.location.href = '#contact',
      icon: Mic
    }
  ];

  return (
    <footer className={`py-16 border-t border-white/10 ${
      variant === 'landing' 
        ? 'bg-black/20 backdrop-blur-sm' 
        : 'bg-slate-50 dark:bg-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center">
                <Cross className="w-4 h-4 text-white" />
              </div>
              <h3 className={`text-xl font-bold ${
                variant === 'landing' ? 'text-white' : 'text-slate-900 dark:text-white'
              }`}>
                ChristTask
              </h3>
            </div>
            <p className={`mb-4 max-w-md ${
              variant === 'landing' ? 'text-blue-200' : 'text-slate-600 dark:text-slate-400'
            }`}>
              Empowering Christians with AI-powered apologetics. Defend your faith with confidence 
              using Scripture-backed responses to challenging questions.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="sm" className={
                variant === 'landing' 
                  ? 'text-blue-200 hover:text-white' 
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }>
                <Heart className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className={
                variant === 'landing' 
                  ? 'text-blue-200 hover:text-white' 
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }>
                <Globe className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={`text-lg font-semibold mb-4 ${
              variant === 'landing' ? 'text-white' : 'text-slate-900 dark:text-white'
            }`}>
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <button 
                    onClick={link.action}
                    className={`resource-link flex items-center ${
                      variant === 'landing' 
                        ? 'text-blue-200 hover:text-white' 
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    <link.icon className="w-4 h-4 mr-2" />
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 mt-8 pt-8 text-center">
          <p className={
            variant === 'landing' ? 'text-blue-200' : 'text-slate-600 dark:text-slate-400'
          }>
            © 2024 ChristTask. Empowering Christians with AI-powered apologetics. 
            Made with <Heart className="w-4 h-4 inline text-red-400" /> for the Kingdom.
          </p>
        </div>
      </div>
    </footer>
  );
}; 