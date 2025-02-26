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

    // Apply the current theme to all pages
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }

    document.getElementById('upload-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const imageInput = document.getElementById('image-input');
    
        if (imageInput.files && imageInput.files[0]) {
            const formData = new FormData();
            formData.append('file', imageInput.files[0]);
    
            fetch('https://ai-challenge-api.onrender.com/predict/', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                // Update diagnosis results in the modal
                document.getElementById('diagnosis').textContent = data.prediction;
                document.getElementById('probability').textContent = "Confidence: " + data.confidence + "%";
                // Show diagnosis modal
                const diagnosisModal = document.getElementById('diagnosis-modal');
                diagnosisModal.style.display = 'flex';
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    });

    // Close button listener for the diagnosis modal
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('close-button')) {
            document.getElementById('diagnosis-modal').style.display = 'none';
        }
    });

    // Merge duplicate change listeners for the image input
    document.getElementById('image-input').addEventListener('change', function(event) {
        const file = event.target.files[0];
        const preview = document.getElementById('image-preview');
        const previewText = document.getElementById('image-preview-text');
        const uploadPreviewContainer = document.getElementById('upload-and-preview');
        const initialAction = document.getElementById('initial-action');
        
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
            previewText.style.display = 'block';
            initialAction.style.display = 'none'; // hide the initial choose image section
            uploadPreviewContainer.style.display = 'block'; // show upload button and preview with change image option
        } else {
            initialAction.style.display = 'flex';
            uploadPreviewContainer.style.display = 'none';
            preview.style.display = 'none';
            previewText.style.display = 'none';
        }
    });

    // Handle patient details page
    if (window.location.pathname.includes('patient-details')) {
        const loadingSpinner = document.getElementById('loading-spinner');
        const errorMessage = document.querySelector('.error-message');
        
        // Get patient ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const patientId = urlParams.get('patient_id');

        if (!patientId) {
            errorMessage.style.display = 'block';
            errorMessage.textContent = 'ID do paciente não fornecido.';
            loadingSpinner.style.display = 'none';
            return;
        }

        // Fetch patient details from server
        fetch(`/patient-details-info?patient_id=${patientId}`)
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.error || 'Erro ao buscar dados do paciente');
                    });
                }
                return response.json();
            })
            .then(data => {
                const patient = data.patient;
                
                // Update the DOM with patient information
                document.getElementById('patient-id').textContent = patient.patient_id;
                document.getElementById('patient-name').textContent = patient.patient_name;
                document.getElementById('patient-gender').textContent = patient.gender;
                document.getElementById('patient-dob').textContent = patient.dob;
                
                // Hide loading spinner
                loadingSpinner.style.display = 'none';
            })
            .catch(err => {
                console.error('Error:', err);
                errorMessage.style.display = 'block';
                errorMessage.textContent = err.message || 'Erro ao carregar os detalhes do paciente.';
                loadingSpinner.style.display = 'none';
            });
    }
});
