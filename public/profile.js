document.addEventListener('DOMContentLoaded', function() {
    fetch('/user-info')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                window.location.href = '/login';
            } else {
                document.getElementById('profile-picture').src = data.picture;
                document.getElementById('profile-picture').style.display = 'block';
                document.getElementById('user-name').textContent = data.name;
                document.getElementById('user-email').textContent = data.email;
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
});
