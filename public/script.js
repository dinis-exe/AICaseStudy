document.addEventListener('DOMContentLoaded', function() {
    // Check authentication status
    fetch('/auth-status')
        .then(response => response.json())
        .then(data => {
            const loginLink = document.querySelector('nav ul li a[href="/login"]');
            const logoutLink = document.querySelector('nav ul li a[href="/logout"]');
            const profileLink = document.querySelector('nav ul li a[href="/profile"]');
            if (data.isAuthenticated) {
                loginLink.style.display = 'none';
                logoutLink.style.display = 'block';
                profileLink.style.display = 'block';
            } else {
                loginLink.style.display = 'block';
                logoutLink.style.display = 'none';
                profileLink.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

document.getElementById('upload-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const imageInput = document.getElementById('image-input');
    if (imageInput.files && imageInput.files[0]) {
        const formData = new FormData();
        formData.append('image', imageInput.files[0]);

        // Simulate an API call to get the diagnosis and probability
        fetch('/api/analyze', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById('diagnosis').textContent = data.diagnosis;
            document.getElementById('probability').textContent = data.probability;
            document.getElementById('result').style.display = 'block';
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
});

document.getElementById('image-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('image-preview');
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('image-input').addEventListener('change', function(event) {
    const resultContainer = document.getElementById('result');
    const previewText = document.getElementById('image-preview-text'); 
    const previewImage = document.getElementById('image-preview');
    
    if (event.target.files.length > 0) {
        previewText.style.display = 'block'; // Show the preview text
        resultContainer.style.display = 'block'; // Show the result container
    } else {
        previewText.style.display = 'none'; // Hide the preview text
        resultContainer.style.display = 'none'; // Hide the result container
        previewImage.style.display = 'none'; // Hide the preview image
    }
});
