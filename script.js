document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    button.classList.add('active');
    document.getElementById(button.dataset.tab).classList.remove('hidden');
  });
});

document.querySelectorAll('.toggle-advanced').forEach(button => {
  button.addEventListener('click', () => {
    const advancedSection = button.nextElementSibling;
    if (advancedSection.classList.contains('hidden')) {
      advancedSection.classList.remove('hidden');
    } else {
      advancedSection.classList.add('hidden');
    }
  });
});
