// Micro-interactions and particle effects utility

// Check if user prefers reduced motion
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Create typing particle effect
export const createTypingParticle = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
  if (prefersReducedMotion()) return;
  
  // Only create particle for actual character keys
  if (event.key.length !== 1) return;
  
  const textarea = event.currentTarget;
  const rect = textarea.getBoundingClientRect();
  
  // Get caret position (approximate)
  const x = rect.left + Math.random() * rect.width;
  const y = rect.top + Math.random() * 30 + 20;
  
  const particle = document.createElement('div');
  particle.className = 'typing-particle';
  particle.style.left = `${x}px`;
  particle.style.top = `${y}px`;
  
  // Randomize particle color
  const colors = [
    'linear-gradient(45deg, #06b6d4, #3b82f6)',
    'linear-gradient(45deg, #ec4899, #f97316)',
    'linear-gradient(45deg, #10b981, #06b6d4)',
    'linear-gradient(45deg, #8b5cf6, #ec4899)'
  ];
  particle.style.background = colors[Math.floor(Math.random() * colors.length)];
  
  document.body.appendChild(particle);
  
  // Clean up after animation
  setTimeout(() => particle.remove(), 1000);
};

// Create ripple effect
export const createRipple = (event: React.MouseEvent<HTMLElement>) => {
  if (prefersReducedMotion()) return;
  
  const button = event.currentTarget;
  const rect = button.getBoundingClientRect();
  
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  
  const diameter = Math.max(rect.width, rect.height);
  const radius = diameter / 2;
  
  ripple.style.width = ripple.style.height = `${diameter}px`;
  ripple.style.left = `${event.clientX - rect.left - radius}px`;
  ripple.style.top = `${event.clientY - rect.top - radius}px`;
  
  button.classList.add('ripple-container');
  button.appendChild(ripple);
  
  // Clean up after animation
  setTimeout(() => ripple.remove(), 600);
};

// Create success confetti
export const createConfetti = () => {
  if (prefersReducedMotion()) return;
  
  const colors = ['#ff0080', '#ff8c00', '#ffd700', '#32cd32', '#00ced1', '#9370db'];
  const confettiCount = 30;
  
  for (let i = 0; i < confettiCount; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-piece';
      
      // Random position across the top of the screen
      confetti.style.left = `${Math.random() * 100}vw`;
      confetti.style.top = '-10px';
      
      // Random size
      const size = Math.random() * 10 + 5;
      confetti.style.width = `${size}px`;
      confetti.style.height = `${size}px`;
      
      // Random color
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
      
      // Random animation duration
      confetti.style.animationDuration = `${Math.random() * 2 + 2}s`;
      
      document.body.appendChild(confetti);
      
      // Clean up after animation
      setTimeout(() => confetti.remove(), 4000);
    }, i * 50); // Stagger the confetti
  }
};

// Magnetic button effect
export const magneticButton = (event: React.MouseEvent<HTMLElement>) => {
  if (prefersReducedMotion()) return;
  
  const button = event.currentTarget;
  const rect = button.getBoundingClientRect();
  const x = event.clientX - rect.left - rect.width / 2;
  const y = event.clientY - rect.top - rect.height / 2;
  
  button.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
};

export const resetMagneticButton = (event: React.MouseEvent<HTMLElement>) => {
  const button = event.currentTarget;
  button.style.transform = 'translate(0, 0)';
};

// Add micro-interaction classes to elements
export const addMicroInteractions = (element: HTMLElement) => {
  element.classList.add('micro-hover', 'micro-click');
};

// Initialize all buttons with ripple effect
export const initializeRippleButtons = () => {
  document.querySelectorAll('button').forEach(button => {
    if (!button.hasAttribute('data-no-ripple')) {
      button.addEventListener('click', createRipple as any);
    }
  });
};