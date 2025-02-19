document.addEventListener('DOMContentLoaded', function() {
    // Fetch user information
    fetch('/user-info')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error:', data.error);
                return;
            }
            document.getElementById('profile-picture').src = data.picture;
            document.getElementById('profile-picture').style.display = 'block';
            document.getElementById('user-name').textContent = `Name: ${data.name}`;
            document.getElementById('user-email').textContent = `Email: ${data.email}`;
        })
        .catch(error => {
            console.error('Error:', error);
        });
});
