
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
    this.currentIteration = parseInt(localStorage.getItem("style_current_iteration") || "1");
  }

  get isAuthenticated(): boolean {
    return !!this.aiId && !!this.preferenceId;
  }

  setSessionData(aiId: string, preferenceId: string) {
    this.aiId = aiId;
    this.preferenceId = preferenceId;
    this.currentIteration = 1;
    localStorage.setItem("style_ai_id", aiId);
    localStorage.setItem("style_preference_id", preferenceId);
    localStorage.setItem("style_current_iteration", "1");
  }

  clearSessionData() {
    this.aiId = null;
    this.preferenceId = null;
    this.currentIteration = 1;
    localStorage.removeItem("style_ai_id");
    localStorage.removeItem("style_preference_id");
    localStorage.removeItem("style_current_iteration");
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

  incrementIteration() {
    this.currentIteration += 1;
    localStorage.setItem("style_current_iteration", this.currentIteration.toString());
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
      // If this is the first iteration or we're getting the first image
      if (!feedback) {
        // For the first iteration, we'll use a default feedback of "dislike"
        // This is because the API requires a valid feedback parameter
        const firstIterationId = 1;
        const response = await fetch(
          `${this.apiBaseUrl}/preference/${this.preferenceId}/iteration/${firstIterationId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "AI-ID": this.aiId,
            },
            body: JSON.stringify({ feedback: "dislike" }), // Changed from null to "dislike"
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to get first image: ${response.status}`);
        }

        const data: IterationResponse = await response.json();
        
        // Update current iteration
        this.currentIteration = data.iteration + 1;
        localStorage.setItem("style_current_iteration", this.currentIteration.toString());
        
        return data;
      } else {
        // For subsequent iterations, use the provided feedback
        const response = await fetch(
          `${this.apiBaseUrl}/preference/${this.preferenceId}/iteration/${this.currentIteration}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "AI-ID": this.aiId,
            },
            body: JSON.stringify({ feedback }),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to submit feedback: ${response.status}`);
        }

        const data: IterationResponse = await response.json();
        
        // Increment iteration for next time
        this.currentIteration = data.iteration + 1;
        localStorage.setItem("style_current_iteration", this.currentIteration.toString());
        
        return data;
      }
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
        throw new Error(`Failed to save profile: ${response.status}`);
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
        throw new Error(`Failed to get profile: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting profile:", error);
      throw error;
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

// Create and export a singleton instance
const styleApiClient = new StyleApiClient();
export default styleApiClient;
