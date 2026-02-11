// 豆包智能体API配置
// 请将YOUR_API_KEY替换为您的实际API密钥
const API_KEY = 'YOUR_API_KEY';
const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

// DOM元素
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// 初始化
function init() {
    // 事件监听
    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// 发送消息
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // 显示用户消息
    addMessage(message, 'user');
    userInput.value = '';

    // 显示加载状态
    const loadingMessage = addMessage('正在思考...', 'bot', true);

    try {
        // 调用豆包智能体API
        const response = await callDoubaoAPI(message);
        
        // 移除加载状态
        loadingMessage.remove();
        
        // 显示AI响应
        if (response && response.content) {
            addMessage(response.content, 'bot');
        } else {
            addMessage('抱歉，我暂时无法理解您的问题。', 'bot');
        }
    } catch (error) {
        // 移除加载状态
        loadingMessage.remove();
        
        // 显示错误消息
        addMessage('抱歉，出现了一些问题，请稍后再试。', 'bot');
        console.error('API调用错误:', error);
    }
}

// 调用豆包智能体API
async function callDoubaoAPI(message) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'doubao-pro', // 模型名称，根据实际情况调整
                messages: [
                    {
                        role: 'system',
                        content: '你是一个专业的客户成功助手，负责解答客户问题，提供技术支持和产品咨询。'
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message;
    } catch (error) {
        console.error('API调用失败:', error);
        throw error;
    }
}

// 添加消息到聊天区域
function addMessage(content, role, isLoading = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    
    if (isLoading) {
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="loading-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${content}</p>
            </div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return messageDiv;
}

// 添加加载动画样式
const style = document.createElement('style');
style.textContent = `
    .loading-indicator {
        display: flex;
        gap: 4px;
    }
    
    .loading-indicator span {
        width: 8px;
        height: 8px;
        background-color: #667eea;
        border-radius: 50%;
        animation: loading 1.4s ease-in-out infinite both;
    }
    
    .loading-indicator span:nth-child(1) {
        animation-delay: -0.32s;
    }
    
    .loading-indicator span:nth-child(2) {
        animation-delay: -0.16s;
    }
    
    @keyframes loading {
        0%, 80%, 100% {
            transform: scale(0);
        }
        40% {
            transform: scale(1);
        }
    }
`;
document.head.appendChild(style);

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);

// 本地存储功能（可选）
function saveChatHistory() {
    const messages = Array.from(chatMessages.children)
        .filter(msg => !msg.querySelector('.loading-indicator'))
        .map(msg => ({
            content: msg.querySelector('p').textContent,
            role: msg.classList.contains('user-message') ? 'user' : 'bot'
        }));
    
    localStorage.setItem('chatHistory', JSON.stringify(messages));
}

function loadChatHistory() {
    const history = localStorage.getItem('chatHistory');
    if (history) {
        const messages = JSON.parse(history);
        messages.forEach(msg => addMessage(msg.content, msg.role));
    }
}