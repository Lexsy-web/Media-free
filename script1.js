const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

sendBtn.addEventListener('click', handleSend);
userInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        handleSend();
    }
});

async function handleSend() {
    const userMessage = userInput.value.trim();
    if (userMessage) {
        addMessage(`You: ${userMessage}`, 'user');
        const botResponse = await getBotResponse(userMessage);
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

// Async function to get response from your AI endpoint
async function getBotResponse(message) {
    const apiUrl = 'https://your-ai-endpoint.com/v1/chat/completions

