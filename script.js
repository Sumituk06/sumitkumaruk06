const topButton = document.getElementById('topButton');
const botForm = document.getElementById('botForm');
const botInput = document.getElementById('botInput');
const botMessages = document.getElementById('botMessages');

function toggleTopButton() {
    if (!topButton) return;
    topButton.style.display = window.scrollY > 350 ? 'block' : 'none';
}

window.addEventListener('scroll', toggleTopButton);

if (topButton) {
    topButton.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

const botReplies = [
    {
        test: /skills?|tech|stack/i,
        reply: 'I work with HTML, CSS, JavaScript, Python, SQL, Git/GitHub, and deployment tools like Netlify and Vercel.'
    },
    {
        test: /project|work|build/i,
        reply: 'Featured projects include a college website and a country finder app with API integration and responsive design.'
    },
    {
        test: /resume|cv/i,
        reply: 'Use the Resume button in the hero section to open and view Sumit\'s latest resume.'
    },
    {
        test: /contact|email|reach/i,
        reply: 'You can use the contact form or email directly at work.sumitkumar47213@gmail.com.'
    }
];

function addMessage(type, text) {
    if (!botMessages) return;
    const p = document.createElement('p');
    p.className = type === 'user' ? 'user-msg' : 'bot-msg';
    p.textContent = `${type === 'user' ? 'You' : 'Bot'}: ${text}`;
    botMessages.appendChild(p);
    botMessages.scrollTop = botMessages.scrollHeight;
}

function getBotReply(input) {
    const matched = botReplies.find((item) => item.test.test(input));
    if (matched) return matched.reply;
    return 'Nice question. I can help with skills, projects, contact details, and resume information.';
}

if (botForm && botInput) {
    botForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const userText = botInput.value.trim();
        if (!userText) return;

        addMessage('user', userText);
        const reply = getBotReply(userText);

        setTimeout(() => {
            addMessage('bot', reply);
        }, 350);

        botInput.value = '';
    });
}