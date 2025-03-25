document.addEventListener('DOMContentLoaded', function() {
    const apiConfigForm = document.getElementById('apiConfigForm');
    const statusMessage = document.getElementById('statusMessage');
    const testApiBtn = document.getElementById('testApiBtn');
    const testResult = document.getElementById('testResult');
    
    // Load saved configuration
    const apiEndpointInput = document.getElementById('apiEndpoint');
    const apiKeyInput = document.getElementById('apiKey');
    const modelNameInput = document.getElementById('modelName');
    
    const savedEndpoint = localStorage.getItem('xai_api_endpoint');
    const savedApiKey = localStorage.getItem('xai_api_key');
    const savedModelName = localStorage.getItem('xai_model_name');
    
    // Default API key
    const defaultApiKey = 'xai-YzJuk9Tzu8xdYvlhU1LyrEjy8IWb6zwiUrj20r9Qd2xsbnujLSBRdHnxhHBhQn8sPjhZ7gTetZ3O51Sy';
    
    if (savedEndpoint) {
        apiEndpointInput.value = savedEndpoint;
    }
    
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
        // Show asterisks instead of the actual key for security
        apiKeyInput.type = 'password';
    } else {
        // Use default API key if none is saved
        apiKeyInput.value = defaultApiKey;
        // Save the default API key to localStorage
        localStorage.setItem('xai_api_key', defaultApiKey);
    }
    
    if (savedModelName) {
        modelNameInput.value = savedModelName;
    } else {
        // Set default model name if not previously saved
        modelNameInput.value = 'grok-2-image';
        // Save the default model to localStorage
        localStorage.setItem('xai_model_name', 'grok-2-image');
    }
    
    apiConfigForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const apiEndpoint = apiEndpointInput.value.trim();
        const apiKey = apiKeyInput.value.trim() || defaultApiKey;
        const modelName = modelNameInput.value.trim() || 'grok-2-image';
        
        // Validate inputs
        if (!apiEndpoint) {
            showStatus('Please fill in the API endpoint', 'error');
            return;
        }
        
        // Save to localStorage
        localStorage.setItem('xai_api_endpoint', apiEndpoint);
        localStorage.setItem('xai_api_key', apiKey);
        localStorage.setItem('xai_model_name', modelName);
        
        showStatus('API configuration saved successfully!', 'success');
    });
    
    testApiBtn.addEventListener('click', async function() {
        const apiEndpoint = localStorage.getItem('xai_api_endpoint');
        const apiKey = localStorage.getItem('xai_api_key') || defaultApiKey;
        const modelName = localStorage.getItem('xai_model_name') || 'grok-2-image';
        
        if (!apiEndpoint) {
            showTestResult('API endpoint is missing. Please save your configuration first.', 'error');
            return;
        }
        
        testResult.innerHTML = '<div class="animate-pulse">Testing connection...</div>';
        testResult.classList.remove('hidden', 'bg-green-100', 'bg-red-100');
        testResult.classList.add('bg-blue-100', 'text-blue-700');
        
        try {
            // Create a simple test request with POST method
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: 'Test image of a blue circle',
                    n: 1,
                    model: modelName,
                    response_format: 'url'
                })
            });
            
            // Check if response is empty
            const responseText = await response.text();
            if (!responseText) {
                throw new Error('Empty response received from API');
            }
            
            // Parse JSON only if there's content
            const data = responseText ? JSON.parse(responseText) : {};
            
            if (response.ok) {
                showTestResult('Connection successful! API is working correctly.', 'success');
            } else {
                showTestResult(`API Error: ${data.error?.message || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            showTestResult(`Connection failed: ${error.message}`, 'error');
        }
    });
    
    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.classList.remove('hidden', 'bg-green-100', 'bg-red-100', 'text-green-700', 'text-red-700');
        
        if (type === 'success') {
            statusMessage.classList.add('bg-green-100', 'text-green-700');
        } else {
            statusMessage.classList.add('bg-red-100', 'text-red-700');
        }
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            statusMessage.classList.add('hidden');
        }, 5000);
    }
    
    function showTestResult(message, type) {
        testResult.textContent = message;
        testResult.classList.remove('hidden', 'bg-green-100', 'bg-red-100', 'bg-blue-100', 'text-green-700', 'text-red-700', 'text-blue-700');
        
        if (type === 'success') {
            testResult.classList.add('bg-green-100', 'text-green-700');
        } else if (type === 'error') {
            testResult.classList.add('bg-red-100', 'text-red-700');
        }
    }
});
