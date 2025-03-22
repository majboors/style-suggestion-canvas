
interface AuthResponse {
  preference_id: string;
  ai_id: string;
}

interface IterationResponse {
  image_url: string;
  iteration: number;
  completed: boolean;
}

interface ProfileResponse {
  top_styles: {
    [key: string]: number;
  };
  selection_history: {
    image: string;
    style: string;
    feedback: "Like" | "Dislike";
    score_change: number;
    current_score: number;
    timestamp: number;
  }[];
}

interface SaveProfileResponse {
  message: string;
}

class StyleApiClient {
  private apiBaseUrl: string;
  private aiId: string | null;
  private preferenceId: string | null;
  private currentIteration: number;

  constructor(baseUrl: string = "https://haider.techrealm.online/api") {
    this.apiBaseUrl = baseUrl;
    this.aiId = localStorage.getItem("style_ai_id");
    this.preferenceId = localStorage.getItem("style_preference_id");
    
    // The iteration in local storage represents the LAST COMPLETED iteration
    // We'll start at 0 (or stored value) so the first API call will be iteration + 1
    this.currentIteration = parseInt(localStorage.getItem("style_current_iteration") || "0");
    console.log(`StyleApiClient initialized with iteration: ${this.currentIteration}`);
  }

  get isAuthenticated(): boolean {
    return !!this.aiId && !!this.preferenceId;
  }

  setSessionData(aiId: string, preferenceId: string) {
    this.aiId = aiId;
    this.preferenceId = preferenceId;
    this.currentIteration = 0; // Start at 0 so first iteration is 1
    localStorage.setItem("style_ai_id", aiId);
    localStorage.setItem("style_preference_id", preferenceId);
    localStorage.setItem("style_current_iteration", "0");
    console.log("Session data set, iteration reset to 0");
  }

  clearSessionData() {
    this.aiId = null;
    this.preferenceId = null;
    this.currentIteration = 0;
    localStorage.removeItem("style_ai_id");
    localStorage.removeItem("style_preference_id");
    localStorage.removeItem("style_current_iteration");
    console.log("Session data cleared");
  }

  getAiId(): string | null {
    return this.aiId;
  }

  getPreferenceId(): string | null {
    return this.preferenceId;
  }

  getCurrentIteration(): number {
    return this.currentIteration;
  }

  setCurrentIteration(iteration: number) {
    this.currentIteration = iteration;
    localStorage.setItem("style_current_iteration", this.currentIteration.toString());
    console.log(`Current iteration set to: ${this.currentIteration}`);
  }

  async authenticate(accessId: string, gender: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/preference`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ access_id: accessId, gender }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status}`);
      }

      const data: AuthResponse = await response.json();
      this.setSessionData(data.ai_id, data.preference_id);
      return data;
    } catch (error) {
      console.error("Authentication error:", error);
      throw error;
    }
  }

  async submitFeedbackAndGetNextImage(feedback?: "like" | "dislike"): Promise<IterationResponse> {
    if (!this.aiId || !this.preferenceId) {
      throw new Error("Not authenticated. Please authenticate first.");
    }

    try {
      // Calculate the next iteration (current + 1)
      const nextIteration = this.currentIteration + 1;
      
      // Default to dislike if no feedback provided (for first call)
      const feedbackValue = feedback || "dislike";
      
      console.log(`Submitting feedback for iteration ${nextIteration}: ${feedbackValue}`);
      
      // Make the API call for the NEXT iteration (current + 1)
      const response = await fetch(
        `${this.apiBaseUrl}/preference/${this.preferenceId}/iteration/${nextIteration}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "AI-ID": this.aiId,
          },
          body: JSON.stringify({ feedback: feedbackValue }),
        }
      );

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error(`API error ${response.status}:`, errorResponse);
        throw new Error(`Failed to submit feedback: ${response.status} - ${errorResponse.error || 'Unknown error'}`);
      }

      const data: IterationResponse = await response.json();
      console.log(`Response from API:`, data);
      
      // Update to the iteration we just completed
      this.setCurrentIteration(data.iteration);
      
      return data;
    } catch (error) {
      console.error("Error submitting feedback or getting next image:", error);
      throw error;
    }
  }

  async saveProfile(): Promise<SaveProfileResponse> {
    if (!this.aiId || !this.preferenceId) {
      throw new Error("Not authenticated. Please authenticate first.");
    }

    try {
      const response = await fetch(
        `${this.apiBaseUrl}/preference/${this.preferenceId}/profile`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "AI-ID": this.aiId,
          },
        }
      );

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(`Failed to save profile: ${response.status} - ${errorResponse.error || 'Unknown error'}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error saving profile:", error);
      throw error;
    }
  }

  async getProfile(): Promise<ProfileResponse> {
    if (!this.aiId || !this.preferenceId) {
      throw new Error("Not authenticated. Please authenticate first.");
    }

    try {
      // Add delay to ensure API has time to process recent feedback
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await fetch(
        `${this.apiBaseUrl}/preference/${this.preferenceId}/profile`,
        {
          method: "GET",
          headers: {
            "AI-ID": this.aiId,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 400) {
          console.log("Profile not available yet. Returning default empty profile.");
          return {
            top_styles: {},
            selection_history: []
          };
        }
        
        const errorResponse = await response.json();
        throw new Error(`Failed to get profile: ${response.status} - ${errorResponse.error || 'Unknown error'}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting profile:", error);
      
      return {
        top_styles: {},
        selection_history: []
      };
    }
  }

  async checkApiHealth(): Promise<{status: string}> {
    try {
      const response = await fetch(this.apiBaseUrl);
      if (!response.ok) {
        throw new Error("API health check failed");
      }
      return await response.json();
    } catch (error) {
      console.error("API health check failed:", error);
      throw error;
    }
  }
}

const styleApiClient = new StyleApiClient();
export default styleApiClient;

