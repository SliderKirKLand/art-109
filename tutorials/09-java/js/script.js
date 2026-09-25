const spamClick = document.querySelector('#spamClick');
const spamImage = document.querySelector('#spamImage');
const themeToggle = document.querySelector('#themeToggle');
const powButton = document.querySelector('#powButton');
const mainHeading = document.querySelector('#mainHeading');

// Spam image click-through sequence
// Clicking cycles spam1 -> spam2 -> spam3 (each bigger), then loops back to spam1.
const spamSequence = [
  { src: 'assets/spam1.png', sizeClass: 'size-1', alt: 'Spam image 1 of 3' },
  { src: 'assets/spam2.png', sizeClass: 'size-2', alt: 'Spam image 2 of 3' },
  { src: 'assets/spam3.png', sizeClass: 'size-3', alt: 'Spam image 3 of 3' },
];

let spamIndex = 0;

spamClick.addEventListener('click', () => {
  spamIndex = (spamIndex + 1) % spamSequence.length;
  const next = spamSequence[spamIndex];

  spamImage.classList.remove('size-1', 'size-2', 'size-3');
  spamImage.classList.add(next.sizeClass);
  spamImage.src = next.src;
  spamImage.alt = next.alt;
});

// Button for toggling between light and dark themes
themeToggle.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark-theme');
  themeToggle.textContent = isDark ? 'Light mode' : 'Dark mode';
  themeToggle.setAttribute('aria-pressed', String(isDark));
});

// Change header with button click: SPAM! <-> POW!
powButton.addEventListener('click', () => {
  const isPow = mainHeading.textContent.trim() === 'POW!';
  mainHeading.textContent = isPow ? 'SPAM!' : 'POW!';
  powButton.textContent = isPow ? 'Turn into POW!' : 'Turn into SPAM!';
});
