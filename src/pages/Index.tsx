
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-apple-gray">
      <div className="max-w-3xl w-full px-4 text-center animate-slide-down">
        <span className="px-3 py-1 text-sm font-medium bg-apple-blue bg-opacity-10 text-apple-blue rounded-full mb-4 inline-block">
          Style Preference API Test
        </span>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight text-apple-black">
          Discover Your <span className="text-apple-blue">Style Profile</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Explore and test our Style Preference API that learns your personal style
          preferences and delivers personalized recommendations.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link to="/style-api">
            <Button className="bg-apple-blue hover:bg-apple-blue-light text-white min-w-[180px] h-12 rounded-lg text-base transition-all-300 shadow-lg hover:shadow-xl">
              Test Style API
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="max-w-6xl w-full px-6 mt-16 md:mt-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-xl shadow-sm transition-all-300 hover:shadow-md">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-apple-blue">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">Authentication</h3>
            <p className="text-gray-600">
              Test the authentication flow and get your AI ID to access the Style API features.
            </p>
          </div>
          
          <div className="p-6 bg-white rounded-xl shadow-sm transition-all-300 hover:shadow-md">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-purple-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">Style Suggestions</h3>
            <p className="text-gray-600">
              View and rate style suggestions to help train the algorithm to your preferences.
            </p>
          </div>
          
          <div className="p-6 bg-white rounded-xl shadow-sm transition-all-300 hover:shadow-md">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">Style Profile</h3>
            <p className="text-gray-600">
              View your evolving style profile as you provide feedback on different styles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
