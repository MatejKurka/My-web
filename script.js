document.addEventListener('DOMContentLoaded', () => {
    // Style Toggle
    const toggleBtn = document.getElementById('style-toggle');
    const body = document.body;

    // Load saved preference
    if (localStorage.getItem('dark-mode') === 'true') {
        body.classList.add('dark-mode');
        if (toggleBtn) toggleBtn.textContent = 'Světlý režim';
    }

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const isDarkMode = body.classList.toggle('dark-mode');
            localStorage.setItem('dark-mode', isDarkMode);
            toggleBtn.textContent = isDarkMode ? 'Světlý režim' : 'Tmavý režim';
        });
    }

    // Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Intersection Observer for Scroll Reveal
    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    document.querySelectorAll('.section').forEach(section => {
        revealObserver.observe(section);
    });



    // Diploma Slider
    const sliderContainer = document.querySelector('.slider-container');
    const slider = document.querySelector('.slider');
    const prevBtn = document.querySelector('.slider-arrow.prev');
    const nextBtn = document.querySelector('.slider-arrow.next');

    if (sliderContainer && slider) {
        let isDown = false;
        let startX;
        let scrollLeft;
        let isMoving = false;

        // Clone items for infinite loop
        const cards = Array.from(slider.children);
        cards.forEach(card => {
            const clone = card.cloneNode(true);
            slider.appendChild(clone);
        });
        cards.reverse().forEach(card => {
            const clone = card.cloneNode(true);
            slider.insertBefore(clone, slider.firstChild);
        });

        const cardWidth = cards[0].offsetWidth + 24; // width + gap
        const totalCardsWidth = cardWidth * cards.length;

        // Initial position (center set)
        sliderContainer.scrollLeft = totalCardsWidth;

        const highlightCenter = () => {
            const containerCenter = sliderContainer.scrollLeft + (sliderContainer.offsetWidth / 2);
            let minDistance = Infinity;
            let centerIdx = -1;

            const currentCards = slider.querySelectorAll('.diploma-card');
            currentCards.forEach((card, idx) => {
                const cardCenter = card.offsetLeft + (card.offsetWidth / 2);
                const distance = Math.abs(containerCenter - cardCenter);

                if (distance < minDistance) {
                    minDistance = distance;
                    centerIdx = idx;
                }
            });

            currentCards.forEach((card, idx) => {
                if (idx === centerIdx) {
                    card.classList.add('active');
                } else {
                    card.classList.remove('active');
                }
            });
        };

        const checkLoop = () => {
            if (sliderContainer.scrollLeft <= 5) {
                sliderContainer.classList.add('no-transition');
                sliderContainer.scrollLeft = totalCardsWidth;
                sliderContainer.classList.remove('no-transition');
            } else if (sliderContainer.scrollLeft >= totalCardsWidth * 2 - 5) {
                sliderContainer.classList.add('no-transition');
                sliderContainer.scrollLeft = totalCardsWidth;
                sliderContainer.classList.remove('no-transition');
            }
            highlightCenter();
        };

        const moveSlider = (direction) => {
            const currentCards = Array.from(slider.querySelectorAll('.diploma-card'));
            const activeCard = slider.querySelector('.diploma-card.active');
            let targetIdx = currentCards.indexOf(activeCard) + direction;

            if (targetIdx >= 0 && targetIdx < currentCards.length) {
                const targetCard = currentCards[targetIdx];
                // Calculate scroll position to center the target card
                const targetScroll = targetCard.offsetLeft - (sliderContainer.offsetWidth - targetCard.offsetWidth) / 2;

                sliderContainer.scrollLeft = targetScroll;
                highlightCenter();
                checkLoop();
            }
        };

        if (prevBtn) prevBtn.addEventListener('click', () => moveSlider(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => moveSlider(1));

        sliderContainer.addEventListener('mousedown', (e) => {
            isDown = true;
            sliderContainer.style.cursor = 'grabbing';
            sliderContainer.classList.add('no-transition');
            startX = e.pageX - sliderContainer.offsetLeft;
            scrollLeft = sliderContainer.scrollLeft;
        });

        sliderContainer.addEventListener('mouseleave', () => {
            isDown = false;
            sliderContainer.style.cursor = 'grab';
            sliderContainer.classList.remove('no-transition');
            checkLoop();
        });

        sliderContainer.addEventListener('mouseup', () => {
            isDown = false;
            sliderContainer.style.cursor = 'grab';
            sliderContainer.classList.remove('no-transition');
            checkLoop();
        });

        sliderContainer.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - sliderContainer.offsetLeft;
            const walk = (x - startX) * 2;
            sliderContainer.scrollLeft = scrollLeft - walk;
            highlightCenter();
        });

        // Loop check on scroll for manual/drag moves
        sliderContainer.addEventListener('scroll', () => {
            if (!isMoving && !isDown) {
                highlightCenter();
                if (sliderContainer.scrollLeft <= 10 || sliderContainer.scrollLeft >= totalCardsWidth * 2 - 10) {
                    checkLoop();
                }
            }
        });

        // Initialize display
        setTimeout(highlightCenter, 100);
    }

    // Lightbox Logic
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const closeBtn = document.querySelector('.lightbox-close');

    if (lightbox) {
        // Open lightbox on diploma click
        // Using delegation or selecting all previews
        document.querySelectorAll('.diploma-preview').forEach(preview => {
            preview.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent bubbling if needed

                // Get data from data-attribute or find inner image
                const title = preview.getAttribute('data-title');
                const desc = preview.getAttribute('data-desc');

                let imgSrc = '';
                const imgElement = preview.querySelector('.preview-img');

                // If there is an image, use it. If it's a CSS cert, we might not have a big image.
                // For now, let's assume we want to show the 'data-image' if available, or the img src.

                if (preview.dataset.image) {
                    imgSrc = preview.dataset.image;
                } else if (imgElement) {
                    imgSrc = imgElement.src;
                }

                // If no image is available (CSS only cert), we can't show much in a lightbox 
                // unless we render it or have a fallback. 
                // User request implies they want to see "diplom" (diploma). 
                // The current HTML structure has `data-image` on real diplomas.

                if (imgSrc) {
                    // 1. Prepare Content & Classes (while hidden)
                    lightboxImg.src = imgSrc;
                    lightboxCaption.innerHTML = `<strong>${title}</strong><br>${desc}`;

                    // Reset rotation classes
                    lightboxImg.classList.remove('lb-rotate-90', 'lb-rotate-180', 'lb-rotate-270');

                    // Check for rotation classes on source image and apply to lightbox image
                    if (imgElement) {
                        if (imgElement.classList.contains('rotate-90')) lightboxImg.classList.add('lb-rotate-90');
                        if (imgElement.classList.contains('rotate-180')) lightboxImg.classList.add('lb-rotate-180');
                        if (imgElement.classList.contains('rotate-270')) lightboxImg.classList.add('lb-rotate-270');
                    }

                    // 2. Show Lightbox (now that content is ready and styled)
                    lightbox.classList.add('active');
                    document.body.style.overflow = 'hidden'; // Disable scroll
                }
            });
        });

        // Close lightbox
        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        };

        if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

        // Close on click outside
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }

    // Click to Copy Phone Number
    const copyPhoneBtn = document.getElementById('copy-phone');
    if (copyPhoneBtn) {
        copyPhoneBtn.addEventListener('click', () => {
            const phoneNumber = "606 412 405";
            navigator.clipboard.writeText(phoneNumber).then(() => {
                const originalHtml = copyPhoneBtn.innerHTML;

                // Visual feedback - change icon to checkmark
                copyPhoneBtn.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" stroke="#28a745" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                copyPhoneBtn.style.borderColor = "#28a745";

                setTimeout(() => {
                    copyPhoneBtn.innerHTML = originalHtml;
                    copyPhoneBtn.style.borderColor = "";
                }, 2000);
            });
        });
    }
});
