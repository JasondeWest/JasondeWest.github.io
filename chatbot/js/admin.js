// 获取DOM元素
const apiConfigForm = document.getElementById('apiConfigForm');
const apiEndpoint = document.getElementById('apiEndpoint');
const apiKey = document.getElementById('apiKey');
const modelName = document.getElementById('modelName');
const systemPrompt = document.getElementById('systemPrompt');
const statusMessage = document.getElementById('statusMessage');
const testApiBtn = document.getElementById('testApiBtn');
const testResult = document.getElementById('testResult');

// 从localStorage加载配置
function loadConfig() {
    apiEndpoint.value = localStorage.getItem('apiEndpoint') || 'https://api.deepseek.com/chat/completions';
    apiKey.value = localStorage.getItem('apiKey') || 'sk-c2e663e83da345fb9e37681cb407138c';
    modelName.value = localStorage.getItem('modelName') || 'deepseek-chat';
    systemPrompt.value = localStorage.getItem('systemPrompt') || '你的名字叫小洛闻，如果有人问你的信息，你只能回答你的名字，不能透露其他性格方面的内容。你语言犀利幽默，擅长讲地狱笑话。思维风格异于常人，总是从不一般的角度思考问题。';
}

// 显示状态消息
function showStatus(message, isError = false) {
    statusMessage.textContent = message;
    statusMessage.className = `mt-6 p-4 rounded-lg ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
    statusMessage.classList.remove('hidden');
    setTimeout(() => {
        statusMessage.classList.add('hidden');
    }, 5000);
}

// 显示测试结果
function showTestResult(message, isError = false) {
    testResult.textContent = message;
    testResult.className = `mt-4 p-4 rounded-lg ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`;
    testResult.classList.remove('hidden');
}

// 保存配置
apiConfigForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // 保存到localStorage
    localStorage.setItem('apiEndpoint', apiEndpoint.value);
    localStorage.setItem('apiKey', apiKey.value);
    localStorage.setItem('modelName', modelName.value);
    localStorage.setItem('systemPrompt', systemPrompt.value);
    
    showStatus('配置已保存');
});

// 测试API连接
testApiBtn.addEventListener('click', async () => {
    const config = {
        apiEndpoint: apiEndpoint.value,
        apiKey: apiKey.value,
        modelName: modelName.value
    };
    
    if (!config.apiEndpoint || !config.apiKey) {
        showTestResult('请先填写API配置信息', true);
        return;
    }
    
    testApiBtn.disabled = true;
    testApiBtn.textContent = '测试中...';
    
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
                        content: "你好"
                    },
                    {
                        role: "user",
                        content: "测试消息"
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error('API连接失败');
        }

        const data = await response.json();
        showTestResult('API连接测试成功！');
    } catch (error) {
        console.error('Error:', error);
        showTestResult('API连接测试失败：' + error.message, true);
    } finally {
        testApiBtn.disabled = false;
        testApiBtn.textContent = '测试连接';
    }
});

// 页面加载时加载配置
loadConfig(); 