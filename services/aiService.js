const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// AI Trip Planner - Generates itinerary
async function generateItinerary(destination, days, preferences = "") {
    try {
        const prompt = `You are a travel expert. Create a detailed ${days}-day itinerary for ${destination}. 
        ${preferences ? `User preferences: ${preferences}` : ''}
        Format the response as a day-by-day plan with:
        - Morning, Afternoon, Evening activities
        - Must-visit places
        - Local food recommendations
        - Travel tips
        
        Keep it concise and practical. Use markdown formatting.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error generating itinerary:", error);
        return getFallbackItinerary(destination, days);
    }
}

// AI Review Summarizer - Summarizes reviews
async function summarizeReviews(reviews) {
    try {
        if (!reviews || reviews.length === 0) {
            return "No reviews available to summarize.";
        }

        const reviewsText = reviews.map(r => `Rating: ${r.rating}/5 - ${r.comment}`).join('\n');
        
        const prompt = `You are a review analyst. Summarize these property reviews:
        
        ${reviewsText}
        
        Provide:
        1. Overall sentiment (positive/negative/mixed)
        2. Top 3 pros
        3. Top 3 cons (if any)
        4. Average rating context
        
        Keep it brief and helpful.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error summarizing reviews:", error);
        return getFallbackReviewSummary(reviews);
    }
}

// Smart Price Insights - Analyzes pricing
async function analyzePrice(listingPrice, similarListings) {
    try {
        if (!similarListings || similarListings.length === 0) {
            return "Not enough data for price comparison.";
        }

        const prices = similarListings.map(l => l.price).filter(p => p > 0);
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        
        const priceDiff = ((listingPrice - avgPrice) / avgPrice * 100).toFixed(1);
        let verdict = "";
        
        if (priceDiff > 20) verdict = "This property is priced higher than average.";
        else if (priceDiff < -20) verdict = "This property is priced lower than average - great value!";
        else verdict = "This property is fairly priced compared to similar listings.";

        const prompt = `You are a pricing analyst. Analyze this accommodation pricing:
        
        Current price: ₹${listingPrice}/night
        Average price of similar listings: ₹${avgPrice.toFixed(0)}/night
        Price range: ₹${minPrice} - ₹${maxPrice}
        Difference from average: ${priceDiff}%
        
        Verdict: ${verdict}
        
        Provide 2-3 sentences of actionable insights for the user.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error analyzing price:", error);
        return getFallbackPriceInsights(listingPrice, similarListings);
    }
}

// Fallback functions when AI fails
function getFallbackItinerary(destination, days) {
    return `## ${days}-Day Trip to ${destination}\n\n` +
           `**Day 1:**\n` +
           `- Morning: Arrival and local market exploration\n` +
           `- Afternoon: Visit main tourist attraction\n` +
           `- Evening: Local cuisine dinner\n\n` +
           `**Day 2:**\n` +
           `- Morning: Cultural/historical site visit\n` +
           `- Afternoon: Leisure activity or day trip\n` +
           `- Evening: Sunset viewpoint or local entertainment\n\n` +
           `*Note: AI service temporarily unavailable. This is a generic template.*`;
}

function getFallbackReviewSummary(reviews) {
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    return `## Review Summary\n\n` +
           `**Overall Rating:** ${avgRating.toFixed(1)}/5 (${reviews.length} reviews)\n\n` +
           `**Top Positive Themes:**\n` +
           `- Good location\n` +
           `- Clean accommodation\n` +
           `- Helpful host\n\n` +
           `*Note: AI service temporarily unavailable. Showing basic statistics.*`;
}

function getFallbackPriceInsights(currentPrice, similarListings) {
    if (!similarListings || similarListings.length === 0) {
        return "No comparable listings found for price analysis.";
    }
    
    const prices = similarListings.map(l => l.price).filter(p => p > 0);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    
    return `## Price Analysis\n\n` +
           `- Your price: ₹${currentPrice}/night\n` +
           `- Average price: ₹${avgPrice.toFixed(0)}/night\n` +
           `- This property is ${currentPrice > avgPrice ? 'above' : 'below'} average\n\n` +
           `*Note: AI service temporarily unavailable. Showing basic comparison.*`;
}

module.exports = {
    generateItinerary,
    summarizeReviews,
    analyzePrice
};