# AlmaGuide AI

AlmaGuide AI is your personal AI guide for exploring Astana. It's a web application built with Next.js that uses generative AI to provide personalized recommendations, create itineraries, and even conduct augmented reality (AR) quests.

## ✨ Key Features

This application is packed with features designed to make exploring Astana an interactive and personalized experience.

*   **🤖 AI Guide Chat**
    *   **Conversational Interface:** Chat with an intelligent avatar that can answer your questions about Astana's attractions, history, and culture.
    *   **Persona Customization:** Tailor the guide's communication style. Choose between a `formal` persona for straightforward, professional answers or a `humorous` one for a more friendly and engaging interaction.
    *   **Multi-language Support:** Interact with the guide in `English`, `Russian`, or `Kazakh`. The AI will respond in your selected language.
    *   **Voice Responses (Text-to-Speech):** Hear the guide's responses spoken aloud. The avatar's lips even move in sync with the audio, creating a more immersive experience.

*   **🗺️ Personalized Itinerary Planning**
    *   **AI-Powered Recommendations:** On the "Plan" tab, describe your interests (e.g., "I love history and quiet cafes"), budget, and available time. The AI will generate a unique travel route tailored to your preferences.
    *   **Route Visualization:** The generated itinerary is not just text. The app automatically extracts key locations from the plan and plots them on an interactive map, giving you a clear visual of your trip.

*   **📍 Interactive Map & Nearby Search**
    *   **Route Plotting:** View your custom-generated route on a map in the "Plan" tab.
    *   **Custom Route Builder:** Use the "Nearby" tab to get directions between any two points in Astana.
    *   **Point of Interest Search:** Find interesting places near you or at any point on the map. Search for categories like `cafes`, `museums`, or `parks`, and see them marked on the map. Adjust the search radius to widen or narrow your results.

*   **📸 Augmented Reality (AR) Quests**
    *   **Interactive Quests:** Participate in scavenger hunt-style quests from the "Quests" tab. Each quest consists of tasks that guide you to specific locations in Astana.
    *   **AR Object Hunt:** Select a task to launch the AR view. Using your phone's camera and sensors, you'll search for a virtual object (a 2D coin) in the real world. The object is fixed in a specific geographic location, requiring you to physically move and point your camera to find it.
    *   **Real-time Guidance:** The on-screen display shows the distance to the object and your phone's compass heading to help you navigate.

*   **- QR Code Scanner**
    *   **Discover Hidden Information:** The "Scan" tab opens a QR code scanner. In a real-world scenario, these codes could be placed at attractions to unlock historical facts, special offers, or the next step in a quest.

## 🚀 Technologies

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **Artificial Intelligence:** [Google Genkit](https://firebase.google.com/docs/genkit)
*   **UI Components:** [ShadCN/UI](https://ui.shadcn.com/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Augmented Reality (AR):** Geolocation API, DeviceOrientation API
*   **Maps:** Google Maps Platform API (Places, Directions, Maps JavaScript)

## 🤖 How the AI Guide (Genkit) Works

The chat with the AI guide is built on the Google Genkit framework. This allows for the creation of robust and structured AI functions (flows).

The main flow for communicating with the avatar is `generateAvatarResponseFlow`. Here's how it's designed:

1.  **Receiving the Request:** The flow accepts the user's query, selected language (`English`, `Russian`, `Kazakh`), and communication style (`formal`, `humorous`).
2.  **Using a Tool:** Instead of directly answering the question, the language model uses a special "tool" — `askAstanaGuideTool`. This tool makes a request to your custom API (`ASTANA_GUIDE_API_URL`), passing it the query text, language, and style.
3.  **Reliable Answers:** This approach (RAG — Retrieval-Augmented Generation) ensures that the model's responses are based **only** on verified data from your API, rather than "inventing" facts.
4.  **Text-to-Speech (TTS):** After receiving a text response from the API, a second flow, `generateTts`, is triggered. It converts this text into an audio file (speech).
5.  **Final Result:** The frontend receives a complete object containing the text response, the audio file for playback, and, if necessary, any citations returned by the API.

This architecture makes the AI guide not just a "chatbot," but a reliable source of information with a voice interface.

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
