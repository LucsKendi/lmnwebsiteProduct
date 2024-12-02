function openFeedbackSurvey() {
    window.open("https://docs.google.com/forms/d/e/1FAIpQLScp_3-uN6IXkvuAT3xVL9aaVFmhlHVrRlvewZXB8Gnq1pgXgA/viewform?usp=sf_link", "_blank");
}

function openinviteSurvey() {
    window.open("https://docs.google.com/forms/d/e/1FAIpQLSeBSs64Qs2lhO8fQL8ah-bsg4KLKvXDWQQD9wP-pqn3tHsRRw/viewform?usp=sf_link", "_blank");
}


function comingSoonAlert() {
    alert("Pesquisa de satisfação do produto estará disponível em breve!");
}



const responses = {
    "oi": `Olá! Como posso te ajudar hoje? Digite 1 para COMANDOS`,
    "2": "A LMN é uma empresa nova no mercado que está lançando um produto incrível para gamers e pessoas que amam passar um tempinho com a família se divertindo. <br> Digite Apoiar para saber como nos ajudar!<br> <br> 1. Comandos <br> 3. Apoiar<br>4.Travando<br> 5. Ajuda ",
    "3": "Para apoiar nosso lançamento, você pode clicar no botão verde nessa mesma tela!<br> Assim você fará um cadastro para acessar as pesquisas de feedback que nos ajudarão a saber suas expectativas e aprender como satisfazê-las! <br> <br> 1. Comandos <br>2. Sobre LMN<br> 4. Travando<br> 5. Ajuda ",
    "1": "Os comandos são:<br>2. Sobre LMN<br> 3. Apoiar<br> 4. Travando<br> 5. Ajuda<br> Por favor digite apenas o número.",
    "default": "Entendi foi nada, por favor clique em sim para ver os comandos existentes.",
    "expert": "Os comandos são:<br>2. Sobre LMN<br> 3. Apoiar<br> 4. Travando<br> 5. Ajuda<br> Por favor digite apenas o número.",
    "não": "Tudo bem! Aperte 1 para rever os comandos.",
    "fdp": "Pra que isso? Vai levar logo um tapa na mente, filhão.",
    "4": "O site provavelmente está travando devido ao alto número de trafégo de usuários, por favor, aguarde alguns minutos antes de realizar alguma requisição.<br> Estamos resolvendo agora mesmo para você!<br> <br> 1. Comandos <br>2. Sobre LMN<br> 3. Apoiar<br> 5. Ajuda ",
    "5": "Se você deseja ajuda de alguma pessoa real urgentemente, ligue para o telefone (12) 99999-9999 e seja atendido por um dos nossos colaboradores.<br> Caso deseje nos contar sobre sua experiência ou algo do tipo, por favor utilize o formulário presente na página.<br> <br> 1. Comandos <br>2. Sobre LMN<br> 3. Apoiar<br> 4. Travando"
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
    
    // verifica se a largura da janela é menor que 576px
    const windowWidth = window.innerWidth;

    // esconde botão de abrir o chat se a largura for menor que 576px (aprender)
    if (windowWidth <= 576) {
        chatbotToggleBtn.style.display = 'none';
    }
    
    // visibilidade do chatbot
    if (chatbotPopup.style.display === 'none' || chatbotPopup.style.display === '') {
        chatbotPopup.style.display = 'block';
    }
}

function closeChatbot() {
    const chatbotPopup = document.getElementById('chatbot-popup');
    const chatbotToggleBtn = document.getElementById('chatbot-toggle-btn');
    
    // fecha
    chatbotPopup.style.display = 'none';
    
    // abrir chat aparece de novo
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
        buttonYes.style.borderRadius = '15px';
        buttonYes.style.padding = '10px 20px';

                const buttonNo = document.createElement('button');
        buttonNo.textContent = '✖ Não';
        buttonNo.onclick = function() {
            appendMessage('bot', responses["não"]);
        };
        buttonNo.style.borderRadius = '15px';
        buttonNo.style.padding = '10px 20px';  

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('button-container');
        buttonContainer.appendChild(buttonYes);
        buttonContainer.appendChild(buttonNo);
        chatBox.appendChild(buttonContainer);
    }
}
