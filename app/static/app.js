let logEventSource = null;

document.getElementById('generateBtn').addEventListener('click', async () => {
    const url = document.getElementById('videoUrl').value;
    const videoType = document.getElementById('videoType').value;
    
    if (!url) {
        alert('Please enter a YouTube URL');
        return;
    }
    
    // Show loading state
    document.getElementById('loading').style.display = 'block';
    document.getElementById('result').style.display = 'none';
    document.getElementById('logContainer').style.display = 'block';
    document.getElementById('logOutput').innerHTML = '';
    
    // Start streaming logs
    startLogStream();
    
    try {
        const response = await fetch('/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url, video_type: videoType })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Stop log streaming
            stopLogStream();
            
            // Hide loading, show result
            document.getElementById('loading').style.display = 'none';
            document.getElementById('result').style.display = 'block';
            
            // Set metadata
            document.getElementById('videoTitle').textContent = data.metadata.title;
            document.getElementById('videoDuration').textContent = 
                `${Math.floor(data.metadata.duration / 60)} minutes`;
            
            // Render markdown notes
            const notesHtml = marked.parse(data.notes);
            document.getElementById('notesContent').innerHTML = notesHtml;
            
            // Collapse logs by default after completion
            document.getElementById('logOutput').style.display = 'none';
            document.getElementById('toggleLogsBtn').textContent = 'Show Logs';
        } else {
            alert('Error: ' + data.detail);
            stopLogStream();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to generate notes. Please try again.');
        stopLogStream();
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
});

function startLogStream() {
    if (logEventSource) {
        logEventSource.close();
    }
    
    logEventSource = new EventSource('/logs/stream');
    
    logEventSource.onmessage = (event) => {
        const logOutput = document.getElementById('logOutput');
        const logLine = document.createElement('div');
        logLine.className = 'log-line';
        logLine.textContent = event.data;
        logOutput.appendChild(logLine);
        
        // Auto-scroll to bottom
        logOutput.scrollTop = logOutput.scrollHeight;
    };
    
    logEventSource.onerror = () => {
        console.log('Log stream connection error');
    };
}

function stopLogStream() {
    if (logEventSource) {
        logEventSource.close();
        logEventSource = null;
    }
}

// Toggle logs visibility
document.getElementById('toggleLogsBtn').addEventListener('click', () => {
    const logOutput = document.getElementById('logOutput');
    const btn = document.getElementById('toggleLogsBtn');
    
    if (logOutput.style.display === 'none') {
        logOutput.style.display = 'block';
        btn.textContent = 'Hide Logs';
    } else {
        logOutput.style.display = 'none';
        btn.textContent = 'Show Logs';
    }
});

// Download PDF functionality
document.getElementById('downloadBtn').addEventListener('click', () => {
    window.print();
});
