// 获取DOM元素
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const chatContainer = document.getElementById('chatContainer');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorMessage = document.getElementById('errorMessage');

// 从localStorage获取API配置
function getConfig() {
    return {
        apiEndpoint: localStorage.getItem('apiEndpoint') || 'https://api.deepseek.com/chat/completions',
        apiKey: localStorage.getItem('apiKey') || 'sk-c2e663e83da345fb9e37681cb407138c',
        modelName: localStorage.getItem('modelName') || 'deepseek-chat',
        systemPrompt: localStorage.getItem('systemPrompt') || '你的名字叫小洛闻，如果有人问你的信息，你只能回答你的名字，不能透露其他性格方面的内容。你语言犀利幽默，擅长讲地狱笑话。思维风格异于常人，总是从不一般的角度思考问题。'
    };
}

// 添加消息到聊天界面
function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'} mb-4`;
    
    const html = `
        <div class="flex items-start ${isUser ? 'justify-end' : ''}">
            ${isUser ? '' : `
                <div class="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm mr-2">
                    小洛
                </div>
            `}
            <div class="${isUser ? 'bg-blue-100' : 'bg-gray-100'} rounded-lg p-3 max-w-[80%]">
                <p>${content}</p>
            </div>
            ${isUser ? `
                <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm ml-2">
                    我
                </div>
            ` : ''}
        </div>
    `;
    
    messageDiv.innerHTML = html;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 显示错误信息
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    setTimeout(() => {
        errorMessage.classList.add('hidden');
    }, 5000);
}

// 发送消息到API
async function sendMessage(message) {
    const config = getConfig();
    
    if (!config.apiEndpoint || !config.apiKey) {
        showError('请先在管理面板配置API设置');
        return null;
    }

    try {
        const response = await fetch(config.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.modelName,
                messages: [
                    {
                        role: "system",
                        content: config.systemPrompt
                    },
                    {
                        role: "user",
                        content: message
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error('API请求失败');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error:', error);
        showError('发送消息时出错：' + error.message);
        return null;
    }
}

// 处理表单提交
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const message = userInput.value.trim();
    if (!message) return;

    // 添加用户消息
    addMessage(message, true);
    userInput.value = '';

    // 显示加载指示器
    loadingIndicator.classList.remove('hidden');

    // 发送消息并获取回复
    const response = await sendMessage(message);
    
    // 隐藏加载指示器
    loadingIndicator.classList.add('hidden');

    if (response) {
        // 添加机器人回复
        addMessage(response);
    }
});

// 按Enter发送消息（Shift+Enter换行）
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatForm.dispatchEvent(new Event('submit'));
    }
}); 