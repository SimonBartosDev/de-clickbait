document.addEventListener('DOMContentLoaded', async () => {
    const statusDiv = document.getElementById('status');
    const dot = statusDiv.querySelector('.dot');

    try {
        // Ping the health check endpoint we made in main.py
        const response = await fetch('http://localhost:8000/');
        const data = await response.json();

        if (data.status === 'running') {
            statusDiv.className = 'status-box online';
            statusDiv.innerHTML = '<span class="dot dot-green"></span> System Operational';
        }
    } catch (error) {
        statusDiv.className = 'status-box offline';
        statusDiv.innerHTML = '<span class="dot dot-red"></span> Server Offline';
    }
});