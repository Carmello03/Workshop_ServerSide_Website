document.getElementById('deleteForm').addEventListener('submit', function(event) {
    const confirmed = confirm('Are you sure you want to delete your account permanently?');
    if (!confirmed) {
        event.preventDefault();
    }
});