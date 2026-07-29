const topButton = document.getElementById('topButton');
const botForm = document.getElementById('botForm');
const botInput = document.getElementById('botInput');
const botMessages = document.getElementById('botMessages');

// Enter your Google Gemini API Key here to enable full AI responses for all visitors:
const HARDCODED_GEMINI_API_KEY = ""; 

const GEMINI_API_KEY = HARDCODED_GEMINI_API_KEY || localStorage.getItem('gemini_api_key') || "";

// System instructions for Gemini API
const SYSTEM_INSTRUCTIONS = `You are a helpful AI assistant representing Sumit Kumar. Answer in a professional, polite, and helpful tone as his assistant.
Here is information about Sumit:
- Role: Frontend & Mobile App Developer.
- Education & Grades (strict details from certificate):
  1. B.Tech (Information Technology) at Rajshree Institute of Management & Technology, Affiliated to AKTU Lucknow (2023 - 2024, CGPA: 6/10).
  2. 12th (Intermediate) at Janta Inter College, Uttarakhand Board (2022 - 2023, Percentage: 58%).
  3. 10th (High School) at Janta Inter College, Uttarakhand Board (2020 - 2021, Percentage: 71.6%).
- Certifications: IIT Roorkee Certification through iHub Divyasampark program.
- Skills & Core tech: HTML, CSS, JavaScript, Git/GitHub, Netlify, Vercel, responsive design, AI tools integration.
- Current Learning: React Native (Mobile) and UI/UX design concepts, TypeScript.
- Coursework Focus: Data Structures & Algorithms (DSA), Object-Oriented Programming (OOPs), and Software Engineering.
- Featured Projects:
  1. College Website (Rajshree Institute): A responsive website built for his college. (Link: https://rajshree-institute-bareilly.netlify.app/)
  2. Country Finder: An API-driven web application to search country statistics and coordinates. (Link: https://countryfinder.edgeone.dev/)
  3. Country Finder APK: Android application package (APK) of the Country Finder app available for direct download on his portfolio.
- Contact Info: Email is work.sumitkumar47213@gmail.com.
- Social Links:
  * GitHub: https://github.com/Sumituk06
  * LinkedIn: https://www.linkedin.com/in/sumit-kumar-6442b8351
  * Instagram: official_sumit_k
  * Twitter: rimt789

Keep responses friendly, helpful, and concise (under 3 sentences unless asked for details). Do not talk about topics completely unrelated to Sumit or web development/IT unless it's basic conversation. If you don't know the answer, politely tell them to contact Sumit directly using the email or form.`;

// Local Regex fallback replies
const botReplies = [
    {
        test: /skills?|tech|stack/i,
        reply: 'Sumit works with HTML, CSS, JavaScript, Git/GitHub, and is currently learning React Native, TypeScript, and UI/UX design.'
    },
    {
        test: /project|work|build/i,
        reply: 'Featured projects include a responsive College Website (https://rajshree-institute-bareilly.netlify.app/) and a Country Finder app (https://countryfinder.edgeone.dev/) with API integration.'
    },
    {
        test: /resume|cv/i,
        reply: 'Use the Resume button in the navigation or hero section to download Sumit\'s latest resume.'
    },
    {
        test: /contact|email|reach/i,
        reply: 'You can use the contact form or email Sumit directly at work.sumitkumar47213@gmail.com.'
    },
    {
        test: /education|college|study|degree|aktu|school|10th|12th/i,
        reply: 'Sumit\'s qualifications: B.Tech IT from Rajshree Institute, AKTU (CGPA: 6/10); 12th Intermediate (58%) and 10th High School (71.6%) from Janta Inter College, Uttarakhand Board.'
    },
    {
        test: /certificate|iit|roorkee/i,
        reply: 'Sumit holds an industrial training program certification from iHub Divyasampark, IIT Roorkee.'
    },
    {
        test: /subject|coursework|dsa|oops|fundamentals/i,
        reply: 'Sumit\'s IT engineering coursework covers Data Structures & Algorithms (DSA), Object-Oriented Programming (OOPs), and Software Engineering.'
    },
    {
        test: /react|native|mobile/i,
        reply: 'Sumit is currently learning React Native for mobile development (iOS/Android) to build interactive cross-platform mobile apps.'
    },
    {
        test: /ui|ux|design/i,
        reply: 'Sumit is studying UI/UX design concepts to structure clean layouts, select appealing color palettes, and create smooth micro-interactions.'
    },
    {
        test: /typescript|ts/i,
        reply: 'Sumit is learning TypeScript to bring strong typing and scalable architecture to his JavaScript and React Native codebases.'
    }
];

// Back to top button
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

// Chat logic
function addMessage(type, text) {
    if (!botMessages) return null;
    const p = document.createElement('p');
    p.className = type === 'user' ? 'user-msg' : 'bot-msg';
    
    // Add strong label
    const label = type === 'user' ? 'You' : 'Bot';
    p.innerHTML = `<strong>${label}:</strong> ${text}`;
    
    botMessages.appendChild(p);
    botMessages.scrollTop = botMessages.scrollHeight;
    return p;
}

function getOfflineBotReply(input) {
    const matched = botReplies.find((item) => item.test.test(input));
    if (matched) return matched.reply;
    return 'Hi! Ask me anything about Sumit\'s skills, B.Tech education, projects, or contact details, and I will be happy to help!';
}

// Call Gemini API
async function askGemini(userInput, apiKey) {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: userInput }]
                    }
                ],
                systemInstruction: {
                    parts: [{ text: SYSTEM_INSTRUCTIONS }]
                }
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            console.error('Gemini error details:', errData);
            throw new Error(`API error code ${response.status}`);
        }

        const data = await response.json();
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('Could not parse response structure');
        }
    } catch (err) {
        console.error(err);
        return 'Connection Error: I could not reach the Gemini service. Please check your API key, internet connection, and try again.';
    }
}

if (botForm && botInput) {
    botForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const userText = botInput.value.trim();
        if (!userText) return;

        addMessage('user', userText);
        botInput.value = '';

        if (GEMINI_API_KEY) {
            // Online Gemini mode
            const thinkingBubble = addMessage('bot', 'Thinking...');
            if (thinkingBubble) thinkingBubble.style.opacity = '0.7';

            const reply = await askGemini(userText, GEMINI_API_KEY);
            if (thinkingBubble) thinkingBubble.remove();
            
            // Add real response
            addMessage('bot', reply);
        } else {
            // Local fallback replies
            setTimeout(() => {
                const reply = getOfflineBotReply(userText);
                addMessage('bot', reply);
            }, 350);
        }
    });
}

// Active Menu Navigation Link Highlight on Scroll
const navLinks = document.querySelectorAll('.navLink');
const sections = document.querySelectorAll('section, header');

function activeMenu() {
    let len = sections.length;
    while (--len && window.scrollY + 120 < sections[len].offsetTop) { }
    navLinks.forEach(lt => lt.classList.remove('active'));
    const activeSection = sections[len];
    if (activeSection) {
        const id = activeSection.getAttribute('id');
        const activeLink = document.querySelector(`.navLink[href="#${id}"]`);
        if (activeLink) activeLink.classList.add('active');
    }
}
window.addEventListener('scroll', activeMenu);
activeMenu(); // Run once initially