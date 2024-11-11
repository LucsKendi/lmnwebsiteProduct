const responses = {
    "oi": "Olá! Como posso te ajudar hoje? Digite LMN para obter informações sobre nós!",
    "lmn": "A LMN é uma empresa nova no mercado que está lançando um produto incrível para gamers e pessoas que amam passar um tempinho com a família se divertindo.\n Digite Apoiar para saber como nos ajudar!",
    "apoiar": "Para apoiar nosso lançamento, você pode clicar no botão verde nessa mesma tela! Assim você fará um cadastro para acessar as pesquisas de feedback que nos ajudarão a saber suas expectativas e aprender como satisfazê-las!",
    "comandos": "São: Oi, LMN, Apoiar, Tchau",
    "tchau": "Volte logo, vou sentir saudade!",
    "default": "Entendi foi nada, por favor clique em sim para ver os comandos existentes.",
    "expert": "Oi, LMN, Apoiar, Tchau",
    "não": "Beleza, fala sozinho aí filhão.",
    "fdp": "Pra que isso? Vai levar logo um tapa na mente, filhão."

};

document.getElementById('chatbot-toggle-btn').addEventListener('click', toggleChatbot);
document.getElementById('close-btn').addEventListener('click', closeChatbot);
document.getElementById('send-btn').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function toggleChatbot() {
    const chatbotPopup = document.getElementById('chatbot-popup');
    const chatbotToggleBtn = document.getElementById('chatbot-toggle-btn');
    
    // Verifica se a largura da janela é menor que 576px
    const windowWidth = window.innerWidth;

    // Esconde o botão de abrir o chat se a largura for menor que 576px
    if (windowWidth <= 576) {
        chatbotToggleBtn.style.display = 'none';
    }
    
    // Alterna a visibilidade do chatbot
    if (chatbotPopup.style.display === 'none' || chatbotPopup.style.display === '') {
        chatbotPopup.style.display = 'block';
    }
}

function closeChatbot() {
    const chatbotPopup = document.getElementById('chatbot-popup');
    const chatbotToggleBtn = document.getElementById('chatbot-toggle-btn');
    
    // Fecha o chat
    chatbotPopup.style.display = 'none';
    
    // Reexibe o botão de abrir o chat
    chatbotToggleBtn.style.display = 'block';
}

function sendMessage() {
    const userInput = document.getElementById('user-input').value.trim();
    if (userInput !== '') {
        appendMessage('user', userInput);
        respondToUser(userInput.toLowerCase());
        document.getElementById('user-input').value = '';
    }
}

function respondToUser(userInput) {
    const response = responses[userInput] || responses["default"];
    setTimeout(function() {
        appendMessage('bot', response);
    }, 500);
}

function appendMessage(sender, message) {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');
    messageElement.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
    messageElement.innerHTML = message;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
    if (sender === 'bot' && message === responses["default"]) {
        const buttonYes = document.createElement('button');
        buttonYes.textContent = '✔ Sim';
        buttonYes.onclick = function() {
            appendMessage('bot', responses["expert"]);
        };
        const buttonNo = document.createElement('button');
        buttonNo.textContent = '✖ Não';
        buttonNo.onclick = function() {
            appendMessage('bot', responses["não"]);
        };
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('button-container');
        buttonContainer.appendChild(buttonYes);
        buttonContainer.appendChild(buttonNo);
        chatBox.appendChild(buttonContainer);
    }
}
