// Bootstrap custom validation for forms
(() => {
  'use strict'

  const forms = document.querySelectorAll('.needs-validation')

  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      // Custom check for radio rating groups — ensure at least one selected
      const ratingGroup = form.querySelector('.rating-group');
      if (ratingGroup) {
        const ratingRadios = ratingGroup.querySelectorAll('input[type="radio"]');
        const ratingSelected = Array.from(ratingRadios).some(r => r.checked);
        if (!ratingSelected) {
          ratingGroup.classList.add('is-invalid');
        } else {
          ratingGroup.classList.remove('is-invalid');
        }
      }

      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})();

// Confirmation prompt for delete review buttons
document.querySelectorAll('.delete-review-btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    if (!confirm('Are you sure you want to delete this review?')) {
      e.preventDefault();
    }
  });
});