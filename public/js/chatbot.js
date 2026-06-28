// Chatbot functionality
let chatOpen = false;
let currentListingId = null;

// DOM Elements
const chatToggle = document.getElementById('chatToggle');
const chatContainer = document.querySelector('.chatbot-container');
const closeChat = document.getElementById('closeChat');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const chatMessages = document.getElementById('chatMessages');
const quickActions = document.getElementById('quickActions');

// Initialize chatbot
document.addEventListener('DOMContentLoaded', function() {
    // Get listing ID from URL if on a listing page
    const path = window.location.pathname;
    const listingMatch = path.match(/\/listings\/([a-f0-9]{24})/);
    if (listingMatch) {
        currentListingId = listingMatch[1];
    }

    // Event Listeners
    chatToggle.addEventListener('click', toggleChat);
    closeChat.addEventListener('click', closeChatPanel);
    chatForm.addEventListener('submit', handleSubmit);

    // Feature buttons
    document.querySelectorAll('.feature-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const feature = this.dataset.feature;
            let message = '';
            
            switch(feature) {
                case 'trip':
                    message = 'Plan a 3-day trip';
                    break;
                case 'review':
                    message = 'Summarize reviews';
                    break;
                case 'price':
                    message = 'Is this price fair?';
                    break;
            }
            
            messageInput.value = message;
            handleSubmit(new Event('submit'));
        });
    });

    // Quick action buttons (if they exist)
    const quickActions = document.getElementById('quickActions');
    if (quickActions) {
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const message = this.dataset.message;
                messageInput.value = message;
                handleSubmit(new Event('submit'));
            });
        });
    }

    // Close chat when clicking outside
    document.addEventListener('click', function(e) {
        if (chatOpen && 
            !chatContainer.contains(e.target) && 
            !chatToggle.contains(e.target)) {
            closeChatPanel();
        }
    });
});

// Toggle chat panel
function toggleChat() {
    if (chatOpen) {
        closeChatPanel();
    } else {
        openChat();
    }
}

// Open chat
function openChat() {
    chatOpen = true;
    chatContainer.style.display = 'flex';
    chatToggle.classList.add('hidden');
    messageInput.focus();
}

// Close chat
function closeChatPanel() {
    chatOpen = false;
    chatContainer.style.display = 'none';
    chatToggle.classList.remove('hidden');
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();
    
    const message = messageInput.value.trim();
    if (!message) return;

    // Add user message to chat
    addMessage(message, 'user');
    messageInput.value = '';

    // Show typing indicator
    showTypingIndicator();

    try {
        const response = await sendMessage(message);
        removeTypingIndicator();
        addMessage(response, 'bot');
    } catch (error) {
        removeTypingIndicator();
        addMessage('Sorry, I encountered an error. Please try again.', 'bot');
        console.error('Chat error:', error);
    }
}

// Send message to backend
async function sendMessage(message) {
    const requestData = {
        message: message
    };
    
    if (currentListingId) {
        requestData.listingId = currentListingId;
    }

    const response = await fetch('/api/chatbot/message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(requestData)
    });

    const data = await response.json();
    
    if (data.success) {
        return data.response;
    } else {
        throw new Error(data.response || 'Failed to get response');
    }
}

// Add message to chat
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    // Parse markdown-like formatting
    const formattedText = formatMessage(text);
    
    messageDiv.innerHTML = `
        <div class="message-content">
            ${formattedText}
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Format message (simple markdown parsing)
function formatMessage(text) {
    // Convert markdown headers
    text = text.replace(/^### (.*$)/gim, '<h6>$1</h6>');
    text = text.replace(/^## (.*$)/gim, '<h5>$1</h5>');
    text = text.replace(/^# (.*$)/gim, '<h4>$1</h4>');
    
    // Convert bold
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert italic
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert line breaks
    text = text.replace(/\n/g, '<br>');
    
    // Convert bullet points
    text = text.replace(/^- (.*$)/gim, '<li>$1</li>');
    text = text.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    return text;
}

// Show typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <div class="message-content">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    scrollToBottom();
}

// Remove typing indicator
function removeTypingIndicator() {
    const typing = document.getElementById('typingIndicator');
    if (typing) {
        typing.remove();
    }
}

// Scroll to bottom of chat
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Hide quick actions after first message
function hideQuickActions() {
    if (quickActions) {
        quickActions.style.display = 'none';
    }
}

// Show quick actions
function showQuickActions() {
    if (quickActions) {
        quickActions.style.display = 'flex';
    }
}

// Override addMessage to hide quick actions
const originalAddMessage = addMessage;
addMessage = function(text, sender) {
    originalAddMessage(text, sender);
    if (sender === 'user') {
        hideQuickActions();
    }
};