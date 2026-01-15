document.addEventListener('DOMContentLoaded', async () => {
    const statusDiv = document.getElementById('status');
    const dot = statusDiv.querySelector('.dot');

    try {
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