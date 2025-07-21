// Landing Page JavaScript
class LandingPage {
    constructor() {
        this.isTransitioning = false;
        this.initializeEventListeners();
        this.startAnimations();
    }

    initializeEventListeners() {
        const enterButton = document.getElementById('enterApp');
        enterButton.addEventListener('click', () => this.transitionToApp());

        // Add keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !this.isTransitioning) {
                this.transitionToApp();
            }
        });

        // Add click events to feature cards for subtle interactions
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach((card, index) => {
            card.addEventListener('mouseenter', () => {
                card.style.animationDelay = '0s';
                card.style.animation = 'none';
                card.offsetHeight; // Trigger reflow
                card.style.animation = 'pulse 0.6s ease-in-out';
            });
        });
    }

    startAnimations() {
        // Animate feature cards with stagger effect
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach((card, index) => {
            card.style.setProperty('--delay', `${0.2 + index * 0.2}s`);
        });

        // Add floating animation to particles
        this.animateParticles();
        
        // Start certificate preview rotation
        this.animateCertificatePreview();
    }

    animateParticles() {
        const particles = document.querySelectorAll('.particle');
        
        setInterval(() => {
            particles.forEach(particle => {
                const randomDelay = Math.random() * 2000;
                const randomDuration = 6000 + Math.random() * 4000;
                
                setTimeout(() => {
                    particle.style.animationDuration = `${randomDuration}ms`;
                }, randomDelay);
            });
        }, 10000);
    }

    animateCertificatePreview() {
        const certificate = document.querySelector('.cert-preview');
        if (!certificate) return;

        let rotation = 0;
        setInterval(() => {
            rotation += 0.5;
            if (rotation >= 360) rotation = 0;
            
            const wobble = Math.sin(rotation * 0.1) * 2;
            certificate.style.transform = 
                `perspective(1000px) rotateY(${-15 + wobble}deg) translateY(${Math.sin(rotation * 0.05) * 3}px)`;
        }, 50);
    }

    async transitionToApp() {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        const loadingTransition = document.getElementById('loadingTransition');
        const button = document.getElementById('enterApp');
        
        // Update button state
        button.style.transform = 'scale(0.95)';
        button.style.opacity = '0.8';
        
        // Show loading transition
        loadingTransition.classList.add('active');
        
        // Add some dramatic loading time for effect
        await new Promise(resolve => {
            let progress = 0;
            const loadingText = document.querySelector('.loading-text');
            
            const messages = [
                'Preparing your workspace...',
                'Loading design templates...',
                'Initializing Canvas.js...',
                'Setting up AI integration...',
                'Almost ready!'
            ];
            
            const interval = setInterval(() => {
                progress++;
                if (progress < messages.length) {
                    loadingText.textContent = messages[progress];
                }
                
                if (progress >= 5) {
                    clearInterval(interval);
                    resolve();
                }
            }, 600);
        });
        
        // Transition to main app
        this.navigateToApp();
    }

    navigateToApp() {
        // Add a smooth transition effect
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.5s ease-out';
        
        setTimeout(() => {
            window.location.href = 'app.html';
        }, 500);
    }

    // Add some interactive easter eggs
    addEasterEggs() {
        let clickCount = 0;
        const logoIcon = document.querySelector('.logo-icon');
        
        logoIcon.addEventListener('click', () => {
            clickCount++;
            
            if (clickCount === 5) {
                this.triggerConfettiEffect();
                clickCount = 0;
            }
            
            // Add bounce effect
            logoIcon.style.animation = 'none';
            logoIcon.offsetHeight;
            logoIcon.style.animation = 'bounce 0.6s ease-in-out';
        });
    }

    triggerConfettiEffect() {
        // Create confetti particles
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * window.innerWidth + 'px';
            confetti.style.top = '-10px';
            confetti.style.borderRadius = '50%';
            confetti.style.pointerEvents = 'none';
            confetti.style.zIndex = '9999';
            
            document.body.appendChild(confetti);
            
            // Animate confetti
            const fallDuration = 3000 + Math.random() * 2000;
            const horizontalMovement = (Math.random() - 0.5) * 200;
            
            confetti.animate([
                {
                    transform: 'translateY(0) translateX(0) rotate(0deg)',
                    opacity: 1
                },
                {
                    transform: `translateY(${window.innerHeight + 100}px) translateX(${horizontalMovement}px) rotate(720deg)`,
                    opacity: 0
                }
            ], {
                duration: fallDuration,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }).onfinish = () => {
                confetti.remove();
            };
        }
    }

    // Add parallax effect to particles
    addParallaxEffect() {
        document.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;
            
            const particles = document.querySelectorAll('.particle');
            particles.forEach((particle, index) => {
                const speed = (index + 1) * 0.02;
                const x = (mouseX - 0.5) * speed * 100;
                const y = (mouseY - 0.5) * speed * 100;
                
                particle.style.transform += ` translate(${x}px, ${y}px)`;
            });
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const landing = new LandingPage();
    landing.addEasterEggs();
    landing.addParallaxEffect();
    
    // Add some dynamic text effects
    const mainTagline = document.querySelector('.main-tagline');
    if (mainTagline) {
        const originalText = mainTagline.textContent;
        let currentIndex = 0;
        
        // Typewriter effect (optional - can be enabled)
        // setInterval(() => {
        //     if (currentIndex < originalText.length) {
        //         mainTagline.textContent = originalText.slice(0, currentIndex + 1);
        //         currentIndex++;
        //     } else {
        //         setTimeout(() => {
        //             currentIndex = 0;
        //             mainTagline.textContent = '';
        //         }, 3000);
        //     }
        // }, 150);
    }
});

// Add window load event for additional animations
window.addEventListener('load', () => {
    // Trigger any final animations after everything is loaded
    const landingContent = document.querySelector('.landing-content');
    landingContent.style.opacity = '1';
    landingContent.style.transform = 'translateY(0)';
});
