
interface AuthResponse {
  ai_id: string;
}

interface SuggestionResponse {
  image_id: string;
  url: string;
  exploration_phase: boolean;
}

interface FeedbackResponse {
  status: string;
}

interface ProfileResponse {
  ai_id: string;
  created_at: string;
  last_active: string;
  preferences: {
    Classic: number;
    Creative: number;
    Fashionista: number;
    Sophisticated: number;
    Romantic: number;
    Natural: number;
    Modern: number;
    Glam: number;
    Streetstyle: number;
  };
}

interface SaveProfileResponse {
  status: string;
}

class StyleApiClient {
  private apiBaseUrl: string;
  private aiId: string | null;

  constructor(baseUrl: string = "https://haider.techrealm.online") {
    this.apiBaseUrl = baseUrl;
    this.aiId = localStorage.getItem("style_ai_id");
  }

  get isAuthenticated(): boolean {
    return !!this.aiId;
  }

  setAiId(aiId: string) {
    this.aiId = aiId;
    localStorage.setItem("style_ai_id", aiId);
  }

  clearAiId() {
    this.aiId = null;
    localStorage.removeItem("style_ai_id");
  }

  getAiId(): string | null {
    return this.aiId;
  }

  async authenticate(accessId: string, gender: string): Promise<string> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/authenticate`, {
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
      this.setAiId(data.ai_id);
      return data.ai_id;
    } catch (error) {
      console.error("Authentication error:", error);
      throw error;
    }
  }

  async getSuggestion(imageId: string, gender: string): Promise<SuggestionResponse> {
    if (!this.aiId) {
      throw new Error("Not authenticated. Please authenticate first.");
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/suggestion/${imageId}?gender=${gender}`, {
        method: "GET",
        headers: {
          "AI-ID": this.aiId,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get suggestion: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting suggestion:", error);
      throw error;
    }
  }

  async submitFeedback(imageId: string, feedback: "like" | "dislike"): Promise<FeedbackResponse> {
    if (!this.aiId) {
      throw new Error("Not authenticated. Please authenticate first.");
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "AI-ID": this.aiId,
        },
        body: JSON.stringify({
          ai_id: this.aiId,
          image_id: imageId,
          feedback,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit feedback: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      throw error;
    }
  }

  async getProfile(): Promise<ProfileResponse> {
    if (!this.aiId) {
      throw new Error("Not authenticated. Please authenticate first.");
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/profile`, {
        method: "GET",
        headers: {
          "AI-ID": this.aiId,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get profile: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting profile:", error);
      throw error;
    }
  }

  async saveProfile(): Promise<SaveProfileResponse> {
    if (!this.aiId) {
      throw new Error("Not authenticated. Please authenticate first.");
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/save_profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "AI-ID": this.aiId,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to save profile: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error saving profile:", error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const styleApiClient = new StyleApiClient();
export default styleApiClient;
