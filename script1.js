const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

sendBtn.addEventListener('click', () => {
    const userMessage = userInput.value.trim();
    if (userMessage) {
        const userDiv = document.createElement('div');
        userDiv.classList.add('message');
        userDiv.innerText = `You: ${userMessage}`;
        chatBox.appendChild(userDiv);

        const botResponse = getBotResponse(userMessage);
        const botDiv = document.createElement('div');
        botDiv.classList.add('message');
        botDiv.innerText = `Bot: ${botResponse}`;
        chatBox.appendChild(botDiv);

        userInput.value = '';
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});

function getBotResponse(message) {
    if (message.toLowerCase().includes('hello')) {
        return 'Hello! How are you?';
    } else if (message.toLowerCase().includes('goodbye')) {
        return 'Goodbye! See you later.';
    } else {
        return 'I didn\'t understand that.';
    }
}


function getBotResponse(message) {
    if (message.toLowerCase().includes('who is lekan girlfriend')) {
        return 'michelle ';
    } else if (message.toLowerCase().includes('are you sure')) {
        return 'ohh, sorry for my mistake, i am not sure about that but l think it is penda because he talks about penda alot, i think his girfriend is penda.';
    } else {
        return 'I didn\'t understand that.';
    }
}


