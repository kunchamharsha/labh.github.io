document.addEventListener("DOMContentLoaded", function () {
  const dropdownBtn = document.getElementById('dropdownBtn');
  const dropdownOptions = document.getElementById('dropdownOptions');
  const dropdownLabel = document.getElementById('dropdownLabel');

  dropdownBtn.addEventListener('click', () => {
    dropdownOptions.style.display = dropdownOptions.style.display === 'block' ? 'none' : 'block';
  });

  dropdownOptions.querySelectorAll('div').forEach(option => {
    option.addEventListener('click', () => {
      dropdownLabel.textContent = option.textContent;
      dropdownOptions.style.display = 'none';
    });
  });

  document.addEventListener('click', (e) => {
    if (!dropdownBtn.contains(e.target) && !dropdownOptions.contains(e.target)) {
      dropdownOptions.style.display = 'none';
    }
  });
});
