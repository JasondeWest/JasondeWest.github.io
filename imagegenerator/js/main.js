document.addEventListener('DOMContentLoaded', function() {
    const imageForm = document.getElementById('imageForm');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorMessage = document.getElementById('errorMessage');
    const resultsContainer = document.getElementById('results');

    // Default API key
    const defaultApiKey = 'xai-YzJuk9Tzu8xdYvlhU1LyrEjy8IWb6zwiUrj20r9Qd2xsbnujLSBRdHnxhHBhQn8sPjhZ7gTetZ3O51Sy';

    // Check if API configuration exists
    const apiConfig = getApiConfig();
    if (!apiConfig.apiEndpoint) {
        showError('API endpoint configuration is missing. Please contact the administrator.');
    }

    imageForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form values
        const prompt = document.getElementById('prompt').value;
        const n = parseInt(document.getElementById('n').value);
        const responseFormat = document.getElementById('response_format').value;
        
        // Clear previous results and errors
        resultsContainer.innerHTML = '';
        errorMessage.classList.add('hidden');
        
        // Show loading indicator
        loadingIndicator.classList.remove('hidden');
        
        try {
            const apiConfig = getApiConfig();
            if (!apiConfig.apiEndpoint) {
                throw new Error('API endpoint configuration is missing. Please contact the administrator.');
            }
            
            // Prepare the API request with POST method
            const response = await fetch(apiConfig.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiConfig.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: prompt,
                    n: n,
                    model: apiConfig.modelName,
                    response_format: responseFormat
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Failed to generate images');
            }
            
            const data = await response.json();
            displayResults(data, responseFormat);
            
        } catch (error) {
            showError(error.message);
        } finally {
            loadingIndicator.classList.add('hidden');
        }
    });
    
    function displayResults(data, responseFormat) {
        if (!data.data || data.data.length === 0) {
            showError('No images were generated.');
            return;
        }
        
        data.data.forEach((item, index) => {
            const imageContainer = document.createElement('div');
            imageContainer.className = 'image-container shadow-lg';
            
            const img = document.createElement('img');
            
            if (responseFormat === 'url' && item.url) {
                img.src = item.url;
            } else if (responseFormat === 'b64_json' && item.b64_json) {
                img.src = `data:image/png;base64,${item.b64_json}`;
            } else {
                return; // Skip if no valid image data
            }
            
            img.alt = `Generated image ${index + 1}`;
            img.className = 'rounded-lg';
            
            const actions = document.createElement('div');
            actions.className = 'image-actions';
            
            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'bg-white text-gray-800 px-3 py-1 rounded text-sm mr-2';
            downloadBtn.textContent = 'Download';
            downloadBtn.onclick = () => downloadImage(img.src, `xai-image-${index + 1}.png`);
            
            actions.appendChild(downloadBtn);
            imageContainer.appendChild(img);
            imageContainer.appendChild(actions);
            resultsContainer.appendChild(imageContainer);
        });
    }
    
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    }
    
    function getApiConfig() {
        const apiKey = localStorage.getItem('xai_api_key') || defaultApiKey;
        const apiEndpoint = localStorage.getItem('xai_api_endpoint') || 'https://api.x.ai/v1/images/generations';
        const modelName = localStorage.getItem('xai_model_name') || 'grok-2-image';
        return { apiKey, apiEndpoint, modelName };
    }
    
    function downloadImage(src, filename) {
        const a = document.createElement('a');
        a.href = src;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
});
