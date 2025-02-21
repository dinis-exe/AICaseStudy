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

                // Fetch and display user profile information
                fetch('/api/profile')
                    .then(response => response.json())
                    .then(profileData => {
                        document.getElementById('profile-name').textContent = profileData.name;
                        document.getElementById('profile-email').textContent = profileData.email;
                    })
                    .catch(error => {
                        console.error('Error fetching profile:', error);
                    });
            } else {
                loginLink.style.display = 'block';
                logoutLink.style.display = 'none';
                profileLink.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });

    // Enhanced Dark mode toggle: Change icon based on mode
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        // Toggle button icon: if dark mode active then show sun, else moon
        const icon = darkModeToggle.querySelector('i');
        if(document.body.classList.contains('dark-mode')) {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
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
