# Baiterek Guide

Baiterek Guide is your personal AI guide for exploring Astana. It's a web application built with Next.js that uses generative AI to provide personalized recommendations, create itineraries, and even conduct augmented reality (AR) quests.

## Key Features

-   **AI-Powered Itinerary Planning**: Describe your interests, budget, and available time, and the AI will generate a personalized tour route for you. It suggests attractions and activities tailored to your preferences, complete with real-time data like weather and traffic considerations.

-   **Interactive AI Guide**: Chat with a friendly AI avatar that acts as your personal tour guide. You can ask questions about Astana's history, culture, and attractions. The guide can respond in English, Russian, or Kazakh and can adopt different personas (formal or humorous) to make the interaction more engaging. The responses are also available as audio.

-   **Interactive Map & Navigation**: The application includes a fully interactive map where you can:
    *   View your AI-generated routes.
    *   Build custom routes between two points.
    *   Search for nearby places like cafes, museums, and parks based on your current location on the map.

-   **AR & Recognition Quests**: Complete interactive quests that make exploring the city more fun.
    *   **Recognition Quests**: Use your phone's camera to photograph landmarks. The app's AI will identify the location to check off the task.
    *   **AR Quests**: Use an AR compass to find virtual items hidden at specific geographic coordinates.

-   **QR Code Scanner**: Scan QR codes placed at various points of interest to get more information or unlock parts of a quest.

## 🛠️ Installation and Startup

To run the project locally, follow these steps:

### 1. Prerequisites

*   Node.js (version 18 or higher)
*   npm or yarn

### 2. API Keys

Create a `.env` file in the root directory of the project and add the necessary API keys. Without them, the maps and AI features will not work.

```env
# Key for Google Maps Platform (Directions API, Places API, Maps JavaScript API)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_GOOGLE_MAPS_KEY"

# Key for Generative Language API (Google AI Studio)
GEMINI_API_KEY="YOUR_GEMINI_KEY"

# Keys for the Landmark Recognition API
RECOGNITION_API_URL="https://x7atk3se2g.execute-api.us-east-1.amazonaws.com/prod/recognize"
RECOGNITION_API_KEY="baiterek-key"

# Data for the custom guide API (if used)
ASTANA_GUIDE_API_URL="YOUR_API_URL"
ASTANA_GUIDE_API_KEY="YOUR_API_KEY"
```

### 3. Installing Dependencies

Run the following command in the terminal to install all required packages:

```bash
npm install
```

### 4. Running the Project

To start the local development server, use the command:

```bash
npm run dev
```

The application will be available at [http://localhost:9002](http://localhost:9002).

### 5. Running Genkit (for AI Development)

If you plan to modify or debug the AI flows, run Genkit in a separate terminal:

```bash
npm run genkit:watch
```

This will allow you to monitor the execution of AI functions in real-time.

