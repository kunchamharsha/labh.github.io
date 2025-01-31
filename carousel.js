const slider = document.querySelector('.content_inner_slider');
const images = document.querySelectorAll('.img');
const dots = document.querySelectorAll('.dot');
const prevButton = document.querySelector('.prev_button');
const nextButton = document.querySelector('.next_button');

let currentIndex = 0;

function updateCarousel() {
    slider.style.transform = `translateX(-${currentIndex * 100}%)`;
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
    });
}

prevButton.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateCarousel();
});

nextButton.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % images.length;
    updateCarousel();
});

dots.forEach(dot => {
    dot.addEventListener('click', () => {
        currentIndex = parseInt(dot.dataset.index);
        updateCarousel();
    });
});

// Auto-slide (optional)
// let autoSlide = setInterval(() => {
//     currentIndex = (currentIndex + 1) % images.length;
//     updateCarousel();
// }, 5000);

// Pause auto-slide on hover
slider.addEventListener('mouseover', () => clearInterval(autoSlide));
slider.addEventListener('mouseout', () => {
    autoSlide = setInterval(() => {
        currentIndex = (currentIndex + 1) % images.length;
        updateCarousel();
    }, 5000);
});

// Initialize carousel
updateCarousel();
