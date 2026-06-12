/* ================================================
   SHED — Script
   ================================================ */

// ---- Nav scroll effect ----
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
}, { passive: true });

// ---- Intersection Observer for animations ----
const animatables = document.querySelectorAll('[data-animate]');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger siblings
      const siblings = Array.from(entry.target.parentElement.querySelectorAll('[data-animate]'));
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, idx * 80);
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -48px 0px'
});
animatables.forEach(el => observer.observe(el));

// ---- Phone number formatting ----
const phoneInput = document.getElementById('phoneInput');
phoneInput.addEventListener('input', (e) => {
  let val = e.target.value.replace(/\D/g, '');
  if (val.length > 10) val = val.slice(0, 10);
  let formatted = '';
  if (val.length >= 1) formatted = '(' + val.slice(0, 3);
  if (val.length >= 4) formatted += ') ' + val.slice(3, 6);
  if (val.length >= 7) formatted += '-' + val.slice(6, 10);
  e.target.value = formatted;
  clearError('phoneInput', 'phoneError');
});

phoneInput.addEventListener('keydown', (e) => {
  clearError('phoneInput', 'phoneError');
});

document.getElementById('emailInput').addEventListener('input', () => {
  clearError('emailInput', 'emailError');
});

// ---- Validation helpers ----
function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
function isValidPhone(v) {
  return v.replace(/\D/g, '').length === 10;
}
function showError(inputId, errorId, msg) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  input.classList.add('error');
  error.textContent = msg;
}
function clearError(inputId, errorId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  input.classList.remove('error');
  error.textContent = '';
}

// ---- Form submission ----
const form = document.getElementById('signupForm');
const success = document.getElementById('signupSuccess');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const btnArrow = document.getElementById('btnArrow');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('emailInput').value.trim();
  const phone = document.getElementById('phoneInput').value.trim();

  let valid = true;

  if (!email) {
    showError('emailInput', 'emailError', 'Email is required.');
    valid = false;
  } else if (!isValidEmail(email)) {
    showError('emailInput', 'emailError', 'Enter a valid email address.');
    valid = false;
  } else {
    clearError('emailInput', 'emailError');
  }

  if (!phone) {
    showError('phoneInput', 'phoneError', 'Cell number is required.');
    valid = false;
  } else if (!isValidPhone(phone)) {
    showError('phoneInput', 'phoneError', 'Enter a valid 10-digit number.');
    valid = false;
  } else {
    clearError('phoneInput', 'phoneError');
  }

  if (!valid) return;

  // Loading state
  submitBtn.disabled = true;
  btnText.textContent = 'Getting you in...';
  btnArrow.style.display = 'none';
  submitBtn.style.opacity = '0.75';

  // Send to FormSubmit (no backend required)
  // The first time someone submits this, it will ask for email verification
  // at hello@shedsink.com. You can change this email to your personal one.
  try {
    await fetch('https://formsubmit.co/ajax/hello@shedsink.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        phone: phone,
        _subject: 'New SHED Early Access Signup!'
      })
    });
  } catch (err) {
    console.error('Form submission failed:', err);
    // Still show success UI to the user so they aren't stuck
  }

  // Show success
  form.style.display = 'none';
  success.classList.add('show');
  success.removeAttribute('aria-hidden');

  // Confetti burst
  spawnConfetti();
});

// ---- Micro confetti ----
function spawnConfetti() {
  const colors = ['#5C9E78', '#D97B2E', '#1A1A1A', '#F3EEE3'];
  const container = document.getElementById('signup');
  for (let i = 0; i < 36; i++) {
    const dot = document.createElement('div');
    dot.style.cssText = `
      position: absolute;
      width: ${Math.random() * 6 + 4}px;
      height: ${Math.random() * 6 + 4}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      left: ${40 + Math.random() * 20}%;
      top: 50%;
      pointer-events: none;
      z-index: 999;
    `;
    container.style.position = 'relative';
    container.appendChild(dot);

    const angle = Math.random() * Math.PI * 2;
    const dist = 80 + Math.random() * 160;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist - 80;
    const duration = 800 + Math.random() * 600;

    dot.animate([
      { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
      { transform: `translate(${tx}px, ${ty}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
    ], {
      duration,
      easing: 'cubic-bezier(0, .9, .57, 1)',
      fill: 'forwards'
    });

    setTimeout(() => dot.remove(), duration + 100);
  }
}

// ---- Smooth scroll for anchor links ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ---- Trim/Fold/Gone word interaction ----
const tfgWords = document.querySelectorAll('.tfg-word');
tfgWords.forEach((word, i) => {
  word.addEventListener('mouseenter', () => {
    word.style.transform = 'scale(1.05)';
  });
  word.addEventListener('mouseleave', () => {
    word.style.transform = 'scale(1)';
  });
  word.style.transition = 'transform 0.2s cubic-bezier(0.4,0,0.2,1), color 0.3s';
  word.style.display = 'inline-block';
  word.style.cursor = 'default';
});
