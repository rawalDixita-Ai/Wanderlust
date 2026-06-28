const Listing = require("../models/listings.js");
const Review = require("../models/reviews.js");
const { generateItinerary, summarizeReviews, analyzePrice } = require("../services/aiService.js");

// Chatbot controller
module.exports.getChatbot = (req, res) => {
    res.render("chatbot/panel", {
        currentUser: req.user
    });
};

// API endpoint for chat messages
module.exports.chatMessage = async (req, res) => {
    try {
        const { message, listingId } = req.body || {};
        
        if (!message) {
            return res.status(400).json({
                success: false,
                response: "Please provide a message.",
                error: "Missing message parameter"
            });
        }
        
        const lowerMessage = message.toLowerCase();
        let response = "";

        // Detect intent and route to appropriate AI function
        if (lowerMessage.includes("trip") || lowerMessage.includes("itinerary") || lowerMessage.includes("plan") || lowerMessage.includes("days")) {
            // Extract destination and days from message
            const destination = extractDestination(message);
            const days = extractDays(message) || 3;
            const preferences = extractPreferences(message);
            
            response = await generateItinerary(destination, days, preferences);
            response = `## 🗺️ Trip Planner\n\n${response}`;
            
        } else if (lowerMessage.includes("review") || lowerMessage.includes("summary") || lowerMessage.includes("summarize")) {
            // Get listing reviews
            let reviews = [];
            if (listingId) {
                const listing = await Listing.findById(listingId).populate("reviews");
                if (listing && listing.reviews) {
                    reviews = listing.reviews;
                }
            }
            
            const summary = await summarizeReviews(reviews);
            response = `## 📊 Review Summary\n\n${summary}`;
            
        } else if (lowerMessage.includes("price") || lowerMessage.includes("cost") || lowerMessage.includes("fair") || lowerMessage.includes("expensive") || lowerMessage.includes("cheap")) {
            // Get current listing and similar listings
            let currentPrice = 0;
            let similarListings = [];
            
            if (listingId) {
                const listing = await Listing.findById(listingId);
                if (listing) {
                    currentPrice = listing.price;
                    // Find similar listings by category
                    similarListings = await Listing.find({
                        category: listing.category,
                        _id: { $ne: listingId }
                    }).limit(5);
                }
            }
            
            const insights = await analyzePrice(currentPrice, similarListings);
            response = `## 💰 Price Insights\n\n${insights}`;
            
        } else {
            // General chatbot response
            response = await generateGeneralResponse(message);
        }

        res.json({
            success: true,
            response: response,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("Chatbot error:", error);
        res.status(500).json({
            success: false,
            response: "Sorry, I'm having trouble processing your request. Please try again.",
            error: error.message
        });
    }
};

// Helper functions to extract information from user message
function extractDestination(message) {
    // Simple extraction - look for "to [destination]" pattern
    const toMatch = message.match(/to\s+([A-Za-z\s]+?)(?:\s+for|\s+in|\s+\d|$)/i);
    if (toMatch) return toMatch[1].trim();
    
    // Look for "plan a trip [destination]"
    const planMatch = message.match(/trip\s+(?:to\s+)?([A-Za-z\s]+?)(?:\s+for|\s+in|\s+\d|$)/i);
    if (planMatch) return planMatch[1].trim();
    
    return "this destination";
}

function extractDays(message) {
    const dayMatch = message.match(/(\d+)\s*day/i);
    return dayMatch ? parseInt(dayMatch[1]) : null;
}

function extractPreferences(message) {
    const preferences = [];
    if (message.toLowerCase().includes("budget")) preferences.push("budget-friendly");
    if (message.toLowerCase().includes("luxury")) preferences.push("luxury");
    if (message.toLowerCase().includes("family")) preferences.push("family-friendly");
    if (message.toLowerCase().includes("adventure")) preferences.push("adventure");
    if (message.toLowerCase().includes("romantic")) preferences.push("romantic");
    
    return preferences.join(", ");
}

async function generateGeneralResponse(message) {
    try {
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        const prompt = `You are a helpful travel assistant for Wanderlust, a property rental platform. 
        The user asked: "${message}"
        
        Provide a helpful, friendly response. If they're asking about:
        - Trip planning: Ask for destination and duration
        - Reviews: Ask which property they want reviews for
        - Pricing: Ask which property they want price analysis for
        - General questions: Provide helpful travel tips
        
        Keep responses concise (max 3 sentences). Be friendly and professional.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        return "I'm here to help! You can ask me to:\n\n" +
               "🗺️ **Plan a trip** - Say 'Plan a 3-day trip to Goa'\n" +
               "📊 **Summarize reviews** - Say 'Summarize reviews for this property'\n" +
               "💰 **Price insights** - Say 'Is this price fair?'\n\n" +
               "What would you like to know?";
    }
}