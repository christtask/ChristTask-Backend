import React, { useState } from 'react';
import { MessageSquare, Share2 } from 'lucide-react';

interface RedditTestimonialProps {
  username: string;
  timestamp: string;
  testimonial: string;
  initialVotes?: number;
  className?: string;
}

export const RedditTestimonial = ({
  username,
  timestamp,
  testimonial,
  initialVotes = 127,
  className = ""
}) => {
  const [votes, setVotes] = useState(initialVotes);
  const [userVote, setUserVote] = useState(null as 'up' | 'down' | null);

  const handleVote = (voteType: 'up' | 'down') => {
    if (userVote === voteType) {
      // Remove vote
      setUserVote(null);
      setVotes(prev => voteType === 'up' ? prev - 1 : prev + 1);
    } else {
      // Change vote or add new vote
      const voteChange = userVote ? 2 : 1;
      setVotes(prev => {
        if (voteType === 'up') {
          return prev + (userVote === 'down' ? voteChange : 1);
        } else {
          return prev - (userVote === 'up' ? voteChange : 1);
        }
      });
      setUserVote(voteType);
    }
  };

  return (
    <div className={className}>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex p-4">
          {/* Vote buttons */}
          <div className="flex flex-col items-center mr-3 space-y-1">
            <button
              onClick={() => handleVote('up')}
              className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                userVote === 'up' ? 'text-orange-500' : 'text-gray-400 hover:text-orange-500'
              }`}
            >
              ↑
            </button>
            <span className="text-sm font-medium text-gray-900 min-w-[2rem] text-center">
              {votes}
            </span>
            <button
              onClick={() => handleVote('down')}
              className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                userVote === 'down' ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'
              }`}
            >
              ↓
            </button>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm font-medium text-gray-900">
                {username}
              </span>
              <span className="text-xs text-gray-500">
                {timestamp}
              </span>
            </div>

            {/* Testimonial text */}
            <div className="text-sm text-gray-800 leading-relaxed mb-3">
              {testimonial}
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <button className="flex items-center space-x-1 hover:text-gray-700 transition-colors">
                <MessageSquare className="w-4 h-4" />
                <span>Reply</span>
              </button>
              <button className="flex items-center space-x-1 hover:text-gray-700 transition-colors">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
              <button className="flex items-center space-x-1 hover:text-gray-700 transition-colors">
                ⬆️
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Call to action outside the testimonial box */}
      <div className="mt-12 text-center">
        <p className="text-lg font-medium text-gray-300">
          Trying to tell people about Jesus?
        </p>
        <p className="text-lg font-medium text-gray-300 mt-6">
          Are they skeptical?
        </p>
        <p className="text-lg font-medium text-gray-300 mt-6">
          Are they offended?
        </p>
        <p className="text-lg font-medium text-gray-300 mt-6">
          Do they bring up objections?
        </p>
        <p className="text-2xl font-medium text-white mt-16">
          Simply ask ChristTask a question.
        </p>
        <div className="mt-4 text-center">
          <span className="text-3xl text-white">↓</span>
        </div>
        <p className="text-xl font-medium text-white mt-6 text-center">
          Responds with Scripture, Logic and Proof.
        </p>
      </div>
    </div>
  );
}; 