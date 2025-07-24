
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Church, Book, Atom } from "lucide-react";

interface TopicCategoriesProps {
  onTopicSelect: (topic: string) => void;
}

export const TopicCategories = ({ onTopicSelect }: TopicCategoriesProps) => {
  const topics = [
    {
      title: "Jesus' Divinity",
      description: "Biblical evidence for Christ's deity",
      icon: Church,
      gradient: "from-purple-500 to-pink-600",
      questions: [
        "Is Jesus truly God?",
        "Trinity explanations",
        "Jesus' divine claims"
      ]
    },
    {
      title: "Biblical Reliability",
      description: "Manuscript evidence and accuracy",
      icon: Book,
      gradient: "from-blue-500 to-cyan-600",
      questions: [
        "Biblical contradictions",
        "Historical accuracy",
        "Manuscript evidence"
      ]
    },
    {
      title: "The Resurrection",
      description: "Historical evidence for Christ's victory",
      icon: BookOpen,
      gradient: "from-emerald-500 to-teal-600",
      questions: [
        "Resurrection evidence",
        "Empty tomb facts",
        "Eyewitness accounts"
      ]
    },
    {
      title: "Science & Faith",
      description: "Harmony between Christianity and science",
      icon: Atom,
      gradient: "from-orange-500 to-red-600",
      questions: [
        "Evolution debates",
        "Age of earth",
        "Intelligent design"
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Explore Topics</h3>
        <p className="text-slate-600">Click on any question to get started</p>
      </div>
      
      <div className="grid gap-6">
        {topics.map((topic, index) => (
          <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${topic.gradient} shadow-lg`}>
                  <topic.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-xl text-slate-800 mb-2">{topic.title}</h4>
                  <p className="text-slate-600 mb-4 leading-relaxed">{topic.description}</p>
                  <div className="space-y-2">
                    {topic.questions.map((question, qIndex) => (
                      <Button
                        key={qIndex}
                        variant="ghost"
                        className="w-full justify-start text-left h-auto p-3 rounded-lg hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 transition-all duration-200 text-slate-700 hover:text-slate-900 font-medium"
                        onClick={() => onTopicSelect(question)}
                      >
                        <span className="text-slate-400 mr-3">→</span>
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
