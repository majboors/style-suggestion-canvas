
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import styleApiClient from "@/services/StyleApiClient";

interface ImageCardProps {
  imageUrl: string;
  iteration: number;
  isCompleted: boolean;
  onFeedbackSubmitted: () => void;
}

const ImageCard = ({ imageUrl, iteration, isCompleted, onFeedbackSubmitted }: ImageCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);

  const handleFeedback = async (type: 'like' | 'dislike') => {
    if (feedback) return; // Prevent multiple submissions
    
    try {
      setIsLoading(true);
      setFeedback(type);
      
      await styleApiClient.submitFeedbackAndGetNextImage(type);
      
      toast.success(`You ${type}d this style`, {
        description: "Your preferences have been updated.",
      });
      
      // Wait a bit for the API to process before getting the profile
      setTimeout(() => {
        // After successful feedback, notify parent component
        onFeedbackSubmitted();
      }, 500);
      
    } catch (error) {
      console.error(`Error submitting ${type}:`, error);
      setFeedback(null);
      toast.error(`Failed to submit feedback`, {
        description: "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg w-full max-w-md mx-auto animate-appear">
      <div className="relative w-full pb-[125%]">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-pulse flex space-x-2">
              <Loader2 className="h-8 w-8 text-apple-blue animate-spin" />
            </div>
          </div>
        )}
        
        <img 
          src={imageUrl} 
          alt="Style suggestion" 
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`} 
          onLoad={() => setImageLoaded(true)}
        />
        
        <div className="absolute top-2 right-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Iteration {iteration}/30
          </span>
        </div>
      </div>
      
      <div className="p-4 flex justify-center space-x-4">
        <Button 
          variant="outline" 
          size="sm" 
          className={`transition-all-200 ${feedback === 'dislike' ? 'bg-red-50 text-red-600 border-red-200' : ''}`}
          disabled={isLoading || !!feedback || isCompleted}
          onClick={() => handleFeedback('dislike')}
        >
          {isLoading && feedback === 'dislike' ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <ThumbsDown className="h-4 w-4 mr-1" />
          )}
          Dislike
        </Button>
        
        <Button 
          size="sm" 
          className={`transition-all-200 bg-apple-blue hover:bg-apple-blue-light text-white ${feedback === 'like' ? 'bg-green-600 hover:bg-green-700' : ''}`}
          disabled={isLoading || !!feedback || isCompleted}
          onClick={() => handleFeedback('like')}
        >
          {isLoading && feedback === 'like' ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <ThumbsUp className="h-4 w-4 mr-1" />
          )}
          Like
        </Button>
      </div>
    </Card>
  );
};

export default ImageCard;
