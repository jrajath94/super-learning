document.addEventListener('DOMContentLoaded', () => {
    const videoUrl = document.getElementById('videoUrl');
    const videoType = document.getElementById('videoType');
    const generateBtn = document.getElementById('generateBtn');
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');
    const notesContent = document.getElementById('notesContent');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    
    let currentNotes = "";
    let currentMetadata = {};

    generateBtn.addEventListener('click', async () => {
        const url = videoUrl.value.trim();
        const type = videoType.value;

        if (!url) {
            alert('Please enter a YouTube URL');
            return;
        }

        // UI State: Loading
        loading.classList.remove('hidden');
        result.classList.add('hidden');
        generateBtn.disabled = true;
        notesContent.innerHTML = '';

        try {
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: url, video_type: type }),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();
            currentNotes = data.notes;
            currentMetadata = data.metadata;

            // Render Markdown
            notesContent.innerHTML = marked.parse(data.notes);
            
            // UI State: Success
            result.classList.remove('hidden');
        } catch (error) {
            alert('Failed to generate notes. Please try again.');
            console.error(error);
        } finally {
            loading.classList.add('hidden');
            generateBtn.disabled = false;
        }
    });

    downloadPdfBtn.addEventListener('click', () => {
        window.print();
    });
});
