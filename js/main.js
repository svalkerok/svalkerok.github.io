// Utility Functions
const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

// Intersection Observer for scroll animations
const createScrollObserver = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    $$('[data-animate]').forEach(el => {
        el.classList.add('animate');
        observer.observe(el);
    });
};

// Navigation Functions
const initNavigation = () => {
    const header = $('[data-scroll-header]');
    const nav = $('[data-nav]');
    const menuBtn = $('.mobile-menu-btn');
    let lastScroll = 0;

    // Smooth scroll for navigation links
    $$('[data-nav-link]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = $(link.getAttribute('href'));
            target.scrollIntoView({ behavior: 'smooth' });
            
            // Close mobile menu if open
            if (nav.classList.contains('active')) {
                nav.classList.remove('active');
                menuBtn.classList.remove('active');
            }
        });
    });

    // Mobile menu toggle
    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('active');
        nav.classList.toggle('active');
    });

    // Sticky header with hide/show on scroll
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            header.classList.remove('scroll-up');
            return;
        }
        
        if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
            header.classList.remove('scroll-up');
            header.classList.add('scroll-down');
        } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
            header.classList.remove('scroll-down');
            header.classList.add('scroll-up');
        }
        
        lastScroll = currentScroll;
    });
};

// Menu Functions
const initMenu = () => {
    const menuFilters = $$('.menu-filter');
    const menuCategories = $$('.menu-category');

    menuFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            // Update active filter
            menuFilters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');

            const category = filter.dataset.filter;

            // Show/hide menu categories
            menuCategories.forEach(cat => {
                if (category === 'all' || cat.dataset.category === category) {
                    cat.classList.remove('hidden');
                    setTimeout(() => cat.classList.add('visible'), 10);
                } else {
                    cat.classList.remove('visible');
                    setTimeout(() => cat.classList.add('hidden'), 300);
                }
            });
        });
    });
};

// Lazy Loading Images
const initLazyLoading = () => {
    const images = $$('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.addEventListener('load', () => {
                    img.classList.add('loaded');
                });
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
};

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    createScrollObserver();
    initNavigation();
    initMenu();
    initLazyLoading();
    initImageOptimization();

    // Add smooth scrolling to all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});

// Image optimization and preloading
function initImageOptimization() {
    // Preload critical images
    const criticalImages = [
        'img/Hero Image.webp',
        'img/Hero Image.png'
    ];

    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });

    // Add loading animation for gallery images
    document.querySelectorAll('.gallery-image').forEach(img => {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
        
        img.addEventListener('load', function() {
            this.style.opacity = '1';
        });
    });
}
