const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

sendBtn.addEventListener('click', handleSend);
userInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        handleSend();
    }
});

function handleSend() {
    const userMessage = userInput.value.trim();
    if (userMessage) {
        addMessage(`You: ${userMessage}`, 'user');
        const botResponse = getBotResponse(userMessage);
        setTimeout(() => {
            addMessage(`Bot: ${botResponse}`, 'bot');
            chatBox.scrollTop = chatBox.scrollHeight;
        }, 400);
        userInput.value = '';
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

function addMessage(text, sender) {
    const div = document.createElement('div');
    div.classList.add('message', sender);
    div.innerText = text;
    chatBox.appendChild(div);
}

// Basic AI-like logic for answering questions
function getBotResponse(message) {
    const msg = message.toLowerCase();

    if (msg.includes('hello') || msg.includes('hi')) {
        return 'Hello! How can I assist you today?';
    } else if (msg.includes('goodbye') || msg.includes('bye')) {
        return 'Goodbye! Have a nice day!';
    } else if (msg.includes('who are you')) {
        return 'I am your friendly AI chatbot assistant!';
    } else if (msg.includes('help')) {
        return 'You can ask me about uploading images, adding comments, or how to use the site.';
    } else if (msg.includes('image')) {
        return 'To upload an image, click the upload button. You can also download or delete images from the list.';
    } else if (msg.includes('comment')) {
        return 'To add a comment, type your message and click "Add Comment".';
    } else if (msg.includes('who is lekan girlfriend')) {
        return 'michelle';
    } else if (msg.includes('are you sure')) {
        return 'Ohh, sorry for my misunderstanding, you are his girlfriend. penda';
    } else if (msg.includes('how do i use this site')) {
        return 'You can upload, download, and delete images, as well as add comments. Just use the buttons and input fields provided!';
    } else {
        return "I'm not sure how to answer that. Try asking something else!";
    }
}






async function getBotResponse(message) {
    // Replace with your actual AI endpoint
    const apiUrl = 'https://your-ai-endpoint.com/v1/chat/completions';
    const apiKey = 'YOUR_API_KEY'; // If needed

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // If your API needs an API key:
            // 'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            // Adjust according to your API's expected format:
            messages: [{role: "user", content: message}]
        })
    });

    const data = await response.json();
    // Adjust this depending on your API's response structure
    return data.choices?.[0]?.message?.content || "Sorry, I couldn't get a response.";
}
