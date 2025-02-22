document.addEventListener('DOMContentLoaded', function() {
    // Check authentication status
    fetch('/auth-status')
        .then(response => response.json())
        .then(data => {
            const loginLink = document.getElementById('login-link');
            const logoutLink = document.getElementById('logout-link');
            const profileLink = document.getElementById('profile-link');
            if (data.isAuthenticated) {
                loginLink.style.display = 'none';
                logoutLink.style.display = 'block';
                profileLink.style.display = 'block';

                // Update profile info only if an element exists
                const nameEl = document.getElementById('profile-name') || document.getElementById('user-name');
                if (nameEl) {
                    fetch('/api/profile')
                        .then(response => response.json())
                        .then(profileData => {
                            if(document.getElementById('profile-name')) {
                                document.getElementById('profile-name').textContent = profileData.name;
                                document.getElementById('profile-email').textContent = profileData.email;
                            } else if(document.getElementById('user-name')) {
                                document.getElementById('user-name').textContent = profileData.name;
                                document.getElementById('user-email').textContent = profileData.email;
                            }
                        })
                        .catch(error => {
                            console.error('Error fetching profile:', error);
                        });
                }
            } else {
                loginLink.style.display = 'block';
                logoutLink.style.display = 'none';
                profileLink.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });

    // Remove all old dark mode related code and replace with this:
    const themeToggle = document.getElementById('theme-toggle');
    
    // Check for saved theme preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }

    // Theme toggle handler
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });

    document.getElementById('upload-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const imageInput = document.getElementById('image-input');
    
        if (imageInput.files && imageInput.files[0]) {
            const formData = new FormData();
            formData.append('file', imageInput.files[0]);  // FastAPI expects "file" as the key
    
            // Send image to FastAPI pneumonia detection API
            fetch('https://ai-challenge-api.onrender.com/predict/', {  
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                document.getElementById('diagnosis').textContent = data.prediction;  // Update diagnosis
                document.getElementById('probability').textContent = (data.confidence * 100).toFixed(2) + "%";  // Convert confidence to percentage
                document.getElementById('result').style.display = 'block';
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    });
    

    // Merge duplicate change listeners for the image input
    document.getElementById('image-input').addEventListener('change', function(event) {
        const file = event.target.files[0];
        const preview = document.getElementById('image-preview');
        const previewText = document.getElementById('image-preview-text');
        const resultContainer = document.getElementById('result');
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
            previewText.style.display = 'block';
            resultContainer.style.display = 'block';
        } else {
            previewText.style.display = 'none';
            resultContainer.style.display = 'none';
            preview.style.display = 'none';
        }
    });
});
