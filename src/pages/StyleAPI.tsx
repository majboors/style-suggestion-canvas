import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Key, 
  User, 
  ImageIcon, 
  BarChart4, 
  Loader2, 
  RefreshCw, 
  LogOut 
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import ApiStatusIndicator from "@/components/ApiStatusIndicator";
import ImageCard from "@/components/ImageCard";
import PreferenceChart from "@/components/PreferenceChart";
import styleApiClient from "@/services/StyleApiClient";

interface Preferences {
  Classic: number;
  Creative: number;
  Fashionista: number;
  Sophisticated: number;
  Romantic: number;
  Natural: number;
  Modern: number;
  Glam: number;
  Streetstyle: number;
}

const StyleAPI = () => {
  const [accessId, setAccessId] = useState("");
  const [gender, setGender] = useState("women");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  const [imageUrl, setImageUrl] = useState("");
  const [currentIteration, setCurrentIteration] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [selectionHistory, setSelectionHistory] = useState<any[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  
  useEffect(() => {
    if (styleApiClient.isAuthenticated) {
      loadProfile();
      getFirstSuggestion();
    }
  }, []);
  
  const handleAuthenticate = async () => {
    if (!accessId) {
      toast.error("Access ID is required");
      return;
    }
    
    try {
      setIsAuthenticating(true);
      await styleApiClient.authenticate(accessId, gender);
      toast.success("Authentication successful", {
        description: "You can now test the style API features.",
      });
      
      getFirstSuggestion();
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error("Authentication failed", {
        description: "Please check your access ID and try again.",
      });
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  const handleLogout = () => {
    styleApiClient.clearSessionData();
    setImageUrl("");
    setCurrentIteration(0);
    setIsCompleted(false);
    setPreferences(null);
    setSelectionHistory([]);
    toast.info("Logged out successfully", {
      description: "Your session has been cleared.",
    });
  };
  
  const getFirstSuggestion = async () => {
    if (!styleApiClient.isAuthenticated) {
      toast.error("Please authenticate first");
      return;
    }
    
    try {
      setIsLoadingSuggestion(true);
      const response = await styleApiClient.submitFeedbackAndGetNextImage();
      
      setImageUrl(response.image_url);
      setCurrentIteration(response.iteration);
      setIsCompleted(response.completed);
      
    } catch (error) {
      console.error("Error getting first suggestion:", error);
      toast.error("Failed to get suggestion", {
        description: "Please try again later.",
      });
    } finally {
      setIsLoadingSuggestion(false);
    }
  };
  
  const handleNextSuggestion = async () => {
    if (!styleApiClient.isAuthenticated) {
      toast.error("Please authenticate first");
      return;
    }
    
    try {
      setIsLoadingSuggestion(true);
      
      const response = await styleApiClient.submitFeedbackAndGetNextImage("dislike");
      
      setImageUrl(response.image_url);
      setCurrentIteration(response.iteration);
      setIsCompleted(response.completed);
      
      if (response.completed) {
        loadProfile();
      }
      
    } catch (error) {
      console.error("Error getting next suggestion:", error);
      toast.error("Failed to get next suggestion", {
        description: "Please try again later.",
      });
    } finally {
      setIsLoadingSuggestion(false);
    }
  };
  
  const loadProfile = async () => {
    if (!styleApiClient.isAuthenticated) return;
    
    try {
      setIsLoadingProfile(true);
      const profile = await styleApiClient.getProfile();
      
      if (profile.top_styles) {
        const typedPreferences: Preferences = {
          Classic: profile.top_styles.Classic || 0,
          Creative: profile.top_styles.Creative || 0,
          Fashionista: profile.top_styles.Fashionista || 0,
          Sophisticated: profile.top_styles.Sophisticated || 0,
          Romantic: profile.top_styles.Romantic || 0,
          Natural: profile.top_styles.Natural || 0,
          Modern: profile.top_styles.Modern || 0,
          Glam: profile.top_styles.Glam || 0,
          Streetstyle: profile.top_styles.Streetstyle || 0
        };
        setPreferences(typedPreferences);
      }
      
      setSelectionHistory(profile.selection_history);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile", {
        description: "Please try again later.",
      });
    } finally {
      setIsLoadingProfile(false);
    }
  };
  
  const handleSaveProfile = async () => {
    if (!styleApiClient.isAuthenticated) {
      toast.error("Please authenticate first");
      return;
    }
    
    try {
      const response = await styleApiClient.saveProfile();
      toast.success(response.message || "Profile saved successfully");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile", {
        description: "Please try again later.",
      });
    }
  };
  
  const handleFeedbackSubmitted = () => {
    loadProfile();
    setCurrentIteration(styleApiClient.getCurrentIteration() - 1);
  };
  
  return (
    <div className="min-h-screen bg-apple-gray">
      <header className="bg-white bg-opacity-90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <ImageIcon className="h-6 w-6 text-apple-blue" />
            <h1 className="text-2xl font-medium text-apple-black">Style API Tester</h1>
          </div>
          <ApiStatusIndicator />
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue={styleApiClient.isAuthenticated ? "suggestion" : "auth"} className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <TabsList className="glass-effect">
              <TabsTrigger value="auth" className="flex items-center space-x-1">
                <Key className="h-4 w-4" />
                <span>Authentication</span>
              </TabsTrigger>
              <TabsTrigger value="suggestion" className="flex items-center space-x-1">
                <ImageIcon className="h-4 w-4" />
                <span>Suggestions</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center space-x-1">
                <BarChart4 className="h-4 w-4" />
                <span>Profile</span>
              </TabsTrigger>
            </TabsList>
            
            {styleApiClient.isAuthenticated && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-destructive hover:text-destructive ml-auto"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            )}
          </div>
          
          <TabsContent value="auth" className="space-y-6 animate-fade-in">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Authentication</CardTitle>
                <CardDescription>Authenticate to use the Style API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="access-id">Access ID</Label>
                  <div className="flex space-x-2">
                    <Input 
                      id="access-id" 
                      value={accessId} 
                      onChange={(e) => setAccessId(e.target.value)} 
                      placeholder="Enter your access ID"
                      disabled={isAuthenticating || styleApiClient.isAuthenticated}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select 
                    value={gender} 
                    onValueChange={setGender}
                    disabled={isAuthenticating || styleApiClient.isAuthenticated}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="women">Women</SelectItem>
                      <SelectItem value="men">Men</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="bg-apple-blue hover:bg-apple-blue-light"
                  onClick={handleAuthenticate}
                  disabled={isAuthenticating || styleApiClient.isAuthenticated}
                >
                  {isAuthenticating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : styleApiClient.isAuthenticated ? (
                    <>
                      <User className="mr-2 h-4 w-4" />
                      Authenticated
                    </>
                  ) : (
                    "Authenticate"
                  )}
                </Button>
              </CardFooter>
            </Card>
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">API Endpoints</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Health Check</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs font-mono bg-gray-50 p-4 rounded">
                    <p>GET /api</p>
                    <p className="mt-2">Response:</p>
                    <p>{`{ "status": "ok" }`}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Create Preference</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs font-mono bg-gray-50 p-4 rounded">
                    <p>POST /api/preference</p>
                    <p className="mt-2">Headers:</p>
                    <p>Content-Type: application/json</p>
                    <p className="mt-2">Body:</p>
                    <p>{`{ "access_id": "string", "gender": "men|women" }`}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Process Iteration</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs font-mono bg-gray-50 p-4 rounded">
                    <p>POST /api/preference/{"{preference_id}"}/iteration/{"{iteration_id}"}</p>
                    <p className="mt-2">Headers:</p>
                    <p>Content-Type: application/json</p>
                    <p>AI-ID: string</p>
                    <p className="mt-2">Body:</p>
                    <p>{`{ "feedback": "like|dislike" }`}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Get/Save Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs font-mono bg-gray-50 p-4 rounded">
                    <p>GET/POST /api/preference/{"{preference_id}"}/profile</p>
                    <p className="mt-2">Headers:</p>
                    <p>AI-ID: string</p>
                    <p className="mt-2">Response:</p>
                    <p>User preferences and profile data</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="suggestion" className="animate-fade-in">
            {!styleApiClient.isAuthenticated ? (
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle>Authentication Required</CardTitle>
                  <CardDescription>Please authenticate to view and rate style suggestions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => {
                      const authTab = document.querySelector('[data-value="auth"]');
                      if (authTab) {
                        (authTab as HTMLElement).click();
                      }
                    }}
                    className="bg-apple-blue hover:bg-apple-blue-light"
                  >
                    Go to Authentication
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-medium">Style Suggestions</h2>
                  <Button
                    variant="outline"
                    onClick={handleNextSuggestion}
                    disabled={isLoadingSuggestion || isCompleted}
                    className="transition-all-200"
                  >
                    {isLoadingSuggestion ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    <span className="ml-2">Skip & Next</span>
                  </Button>
                </div>
                
                <Separator />
                
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center justify-center space-x-2 text-sm mb-4">
                      <span>Progress:</span>
                      <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-apple-blue" 
                          style={{ width: `${(currentIteration / 30) * 100}%` }}
                        ></div>
                      </div>
                      <span>{currentIteration}/30</span>
                    </div>
                  </div>
                </div>
                
                {isLoadingSuggestion ? (
                  <div className="py-12 flex justify-center">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-apple-blue" />
                      <p>Loading suggestion...</p>
                    </div>
                  </div>
                ) : imageUrl ? (
                  <div className="max-w-md mx-auto">
                    <ImageCard
                      imageUrl={imageUrl}
                      iteration={currentIteration}
                      isCompleted={isCompleted}
                      onFeedbackSubmitted={handleFeedbackSubmitted}
                    />
                    
                    {isCompleted && (
                      <div className="mt-6 text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h3 className="font-medium text-green-800">All iterations completed!</h3>
                        <p className="text-green-600 mt-1">Check the Profile tab to see your style preferences.</p>
                        <Button
                          onClick={() => {
                            const profileTab = document.querySelector('[data-value="profile"]');
                            if (profileTab) {
                              (profileTab as HTMLElement).click();
                            }
                          }}
                          className="mt-3 bg-green-600 hover:bg-green-700"
                        >
                          View My Profile
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-12 flex justify-center">
                    <div className="text-center">
                      <ImageIcon className="h-8 w-8 mx-auto mb-4 opacity-30" />
                      <p>No suggestion loaded</p>
                      <Button
                        onClick={getFirstSuggestion}
                        className="mt-4 bg-apple-blue hover:bg-apple-blue-light"
                      >
                        Get First Suggestion
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="profile" className="animate-fade-in">
            {!styleApiClient.isAuthenticated ? (
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle>Authentication Required</CardTitle>
                  <CardDescription>Please authenticate to view your style profile</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => {
                      const authTab = document.querySelector('[data-value="auth"]');
                      if (authTab) {
                        (authTab as HTMLElement).click();
                      }
                    }}
                    className="bg-apple-blue hover:bg-apple-blue-light"
                  >
                    Go to Authentication
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-medium">Your Style Profile</h2>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      onClick={loadProfile}
                      disabled={isLoadingProfile}
                    >
                      {isLoadingProfile ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-1" />
                      )}
                      Refresh
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      className="bg-apple-blue hover:bg-apple-blue-light"
                      disabled={isLoadingProfile}
                    >
                      Save Profile
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <PreferenceChart 
                  preferences={preferences} 
                  isLoading={isLoadingProfile} 
                />
                
                {selectionHistory && selectionHistory.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Selection History</CardTitle>
                      <CardDescription>Your style feedback history</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 max-h-96 overflow-y-auto p-2">
                        {selectionHistory.map((item, index) => (
                          <div key={index} className="flex items-center space-x-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                            <div className="w-16 h-16 overflow-hidden rounded">
                              <img src={item.image} alt={item.style} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{item.style}</div>
                              <div className="text-sm text-gray-500">
                                Score change: {item.score_change > 0 ? '+' : ''}{item.score_change}
                              </div>
                            </div>
                            <div>
                              <Badge variant={item.feedback === 'Like' ? 'default' : 'destructive'}>
                                {item.feedback}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                <Card className="glass-effect">
                  <CardHeader>
                    <CardTitle>How It Works</CardTitle>
                    <CardDescription>Understanding your style preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-medium">Style Learning</h3>
                      <p className="text-sm text-muted-foreground">
                        Over 30 iterations, the system learns your style preferences through your feedback.
                        Each "like" or "dislike" helps build a profile of your fashion taste.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium">Preference Building</h3>
                      <p className="text-sm text-muted-foreground">
                        Each time you like or dislike a style, your preferences are updated. The system
                        learns which style categories you prefer and recommends accordingly.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium">Save Your Profile</h3>
                      <p className="text-sm text-muted-foreground">
                        Saving your profile creates a snapshot of your current preferences. This can be
                        useful for tracking how your style evolves over time.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="border-t border-gray-200 py-6 mt-12">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground">
            Style API Tester • Created with Lovable • {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default StyleAPI;
