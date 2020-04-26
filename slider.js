/**
 * EQ Slider
 *
 * Slider created for the Šolko app.
 */

import swipe from './swipe';
import EQEvent from './event';

class EQSlider {
    constructor(args) {
        /** Default slider settings */
        const defaults = {
            animationDuration: 300,
            beforeAfterCount: 0,
            loop: false,
            spaceBetweenSlides: 20,
            slidesToMove: 1,
            visibleSlides: 1,
            element: false,
            arrowSymbol: '&#10140;',
            slideCountResponsive: [],
        };

        /** Combined settings - default + user settings */
        this.settings = Object.assign(defaults, args);
        this.storeVisibleSlides = this.settings.visibleSlides;
        this.focus = false;

        /** Set before after count minimum */
        if (this.settings.loop) {
            this.settings.beforeAfterCount = this.settings.beforeAfterCount <= this.settings.visibleSlides ? this.settings.visibleSlides + 1 : this.settings.beforeAfterCount;
        }
        /** Check if user provided element */
        if (!this.settings.element) {
            console.error('Element is required!');
            return false;
        }

        /** Get slider from DOM */
        this.sliderElement = document.querySelector(this.settings.element);
        this.slidesWrapper;
        if (!this.sliderElement) {
            console.error('Slider can not be initialized. Please set the correct element paremeter.');
            return false;
        }

        /** Slider calculated properties */
        this.numberOfSlides = this.sliderElement.childNodes.length;
        if (!this.numberOfSlides) {
            console.error('Slider does not contain child nodes. Exiting here.');
            return false;
        }
        this.index = this.settings.loop ? this.settings.beforeAfterCount : 0;
        this.position = 0;
        this.oldPosition = 0;

        /** Animation parameters */
        this.animationSteps = Math.round((this.settings.animationDuration / 1000) * 60);
        this.moving = false;
        this.diff = 0;
        this.count = 0;
        this.interval = false;

        /** Single slide */
        this.slideOuterWidth = 0;
        this.slideWidth = 0;

        /** Start the slider */
        this.start();
    }
    start() {
        this.slideCountResponsive();
        this.setSingleSlideDimensions();
        this.sliderElement.classList.add('eq-slider');
        this.addWrapperAndCopies();
        this.addKeyboardEvents();
        this.addMouseEvents();
        this.addDOMEvents();
        this.addResizeEvents();

        this.setSliderWrapperWidth();
        this.setSingleSlideWidth();
        this.position_Start();
        this.setActiveClass();
    }

    /* Update position when navigation left or right */
    update(direction) {
        if (this.moving) return false;
        if (!this.controls__noLoopCheck(direction)) return false;

        EQEvent('eq-move-before', this.sliderElement, { direction: direction, index: this.getRealIndex() });

        const move = this.controls__getMoveMax(direction);
        this.index += move;

        this.sliderElement.classList.remove('transition-none');
        this.oldPosition = this.position;
        this.position = -this.index * this.slideOuterWidth;
        this.setActiveClass();
        this.animate();
    }

    /** Put slides inside wrapper so we can resize it. */
    addWrapperAndCopies() {
        if (this.settings.loop) {
            const firstLimitSlides = this.getFirstLimitSlides(0, []);
            const lastLimitSlides = this.getLastLimitSlides(this.numberOfSlides - 1, []);
            this.appendSlides(firstLimitSlides);
            this.prependSlides(lastLimitSlides);
        }
        const slides = this.sliderElement.innerHTML;
        /** Create wrapper. */
        const slidesWrapper = document.createElement('div');
        slidesWrapper.classList.add('eq-slides-wrapper');
        slidesWrapper.innerHTML = slides;
        /** Replace slides with wrapped slides. */
        this.sliderElement.innerHTML = '<div class="eq-slider-left eq-slider-arrow">' + this.settings.arrowSymbol + '</div>';
        this.sliderElement.innerHTML += slidesWrapper.outerHTML;
        this.sliderElement.innerHTML += '<div class="eq-slider-right eq-slider-arrow">' + this.settings.arrowSymbol + '</div>';

        /** Set slides wrapper as class variable.*/
        this.slidesWrapper = this.sliderElement.querySelector('.eq-slides-wrapper');
    }

    getFirstLimitSlides(index, result) {
        const slides = this.sliderElement.childNodes;

        if (typeof slides[index] === 'undefined') {
            index = 0;
        }

        result.push(slides[index]);

        if (result.length === this.settings.beforeAfterCount) {
            return result;
        }

        index++;
        return this.getFirstLimitSlides(index, result);
    }

    getLastLimitSlides(index, result) {
        const slides = this.sliderElement.childNodes;

        if (typeof slides[index] === 'undefined') {
            index = this.numberOfSlides - 1;
        }

        result.push(slides[index]);

        if (result.length === this.settings.beforeAfterCount) {
            return result;
        }

        index--;
        return this.getLastLimitSlides(index, result);
    }

    appendSlides(elementArray) {
        elementArray.forEach((element) => {
            this.sliderElement.appendChild(element.cloneNode(true));
        });
    }

    prependSlides(elementArray) {
        elementArray.forEach((element) => {
            this.sliderElement.insertBefore(element.cloneNode(true), this.sliderElement.firstChild);
        });
    }

    /**
     * Add DOM Events
     */
    addDOMEvents() {
        const arrowLeft = this.sliderElement.querySelector('.eq-slider-left');
        const arrowRight = this.sliderElement.querySelector('.eq-slider-right');

        arrowLeft.addEventListener('click', () => this.controls__Left());
        arrowRight.addEventListener('click', () => this.controls__Right());
    }

    /**
     * Add keyboard events
     */
    addKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.keyCode === 37) this.controls__Left();
            if (e.keyCode === 39) this.controls__Right();
        });
    }

    /**
     * Add mouse events.
     */
    addMouseEvents() {
        swipe(this.sliderElement);
        this.sliderElement.addEventListener('swipeLeft', () => this.controls__Left());
        this.sliderElement.addEventListener('swipeRight', () => this.controls__Right());

        /** Change focus from one slider to another. Push event to all sliders that something happened. */
        this.sliderElement.addEventListener('click', () => {
            this.focus = !this.focus;
            EQEvent('focusChanged', document.body, { el: this.sliderElement });
        });

        document.body.addEventListener('focusChanged', (e) => {
            if (e.detail.el !== this.sliderElement) {
                this.focus = false;
            }
        });
    }

    /**
     * Responsive
     */
    addResizeEvents() {
        window.addEventListener('resize', () => {
            this.slideCountResponsive();
            this.setSliderWrapperWidth();
            this.setSingleSlideDimensions();
            this.setSingleSlideWidth();
            this.position = -this.index * this.slideOuterWidth;
            this.updateSlidesTransformPosition();
            this.setActiveClass();
        });
    }

    /**
     * Slide count responsive.
     */
    slideCountResponsive() {
        if (!this.settings.slideCountResponsive.length) return;
        const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        let breakpointValue = 10000000;
        let finalBreakpoint = null;
        for (let i = 0; i < this.settings.slideCountResponsive.length; i++) {
            const breakpoint = this.settings.slideCountResponsive[i];
            const difference = breakpoint.size - vw;
            if (difference < 0) continue;
            if (difference < breakpointValue) {
                breakpointValue = difference;
                finalBreakpoint = breakpoint;
            }
        }
        if (finalBreakpoint !== null) {
            this.settings.visibleSlides = finalBreakpoint.slides;
        } else {
            this.settings.visibleSlides = this.storeVisibleSlides;
        }
    }

    /**
     * Sets slides wrapper width.
     */
    setSliderWrapperWidth() {
        this.slidesWrapperWidth = this.slideOuterWidth * (this.numberOfSlides + 2 * this.settings.beforeAfterCount);
        this.slidesWrapper.style.width = this.slidesWrapperWidth + 'px';
    }

    /**
     * Set single slide dimensons.
     */
    setSingleSlideDimensions() {
        this.slideOuterWidth = this.sliderElement.parentNode.offsetWidth / this.settings.visibleSlides;
        this.slideWidth = this.slideOuterWidth - this.settings.spaceBetweenSlides;
    }

    /**
     * Set single slides width
     */
    setSingleSlideWidth() {
        this.slidesWrapper.childNodes.forEach((slide) => {
            slide.style.width = this.slideWidth + 'px';
            slide.style.marginLeft = this.settings.spaceBetweenSlides / 2 + 'px';
            slide.style.marginRight = this.settings.spaceBetweenSlides / 2 + 'px';
        });
    }

    /**
     * Set slides initial position
     */
    updateSlidesTransformPosition() {
        this.slidesWrapper.style.transform = 'translateX(' + this.position + 'px)';
    }

    setActiveClass() {
        this.resetActiveClass();
        const start = this.index;
        const end = this.index + this.settings.visibleSlides;
        const elements = this.sliderElement.querySelector('.eq-slides-wrapper').childNodes;
        for (let i = start; i < end; i++) {
            elements[i].classList.add('active');
        }
    }

    resetActiveClass() {
        const slides = this.sliderElement.querySelector('.eq-slides-wrapper').childNodes;
        slides.forEach((slide) => slide.classList.remove('active'));
    }

    /** If slider is in no loop mode we have to set the limits.
     * This functions check if we are at minimum or maximum index.
     */
    controls__noLoopCheck(type) {
        if (this.settings.loop) return true;
        if (type == 'right') {
            if (this.index + this.settings.visibleSlides === this.numberOfSlides) {
                return false;
            }
        }

        if (type == 'left') {
            if (this.index === 0) return false;
        }
        return true;
    }

    /** If slider is set to no loop mode we have to change default move value. */
    controls__getMoveMax(direction) {
        let limit;
        let standardMove = this.settings.slidesToMove;

        if (this.settings.loop) {
            if (direction == 'left') return -standardMove;
            return standardMove;
        }

        if (direction == 'left') {
            limit = -this.index;
            standardMove = -standardMove;
        }

        if (direction == 'right') {
            limit = this.numberOfSlides - this.index - this.settings.visibleSlides;
        }

        if (Math.abs(limit) < Math.abs(standardMove)) {
            return limit;
        } else {
            return standardMove;
        }
    }

    /* Controls */
    controls__Left() {
        if (this.focus) {
            this.update('left');
        }
    }

    controls__Right() {
        if (this.focus) {
            this.update('right');
        }
    }

    /* Position */
    position_Start() {
        this.position = -this.slideOuterWidth * this.index;
        this.updateSlidesTransformPosition();
    }

    animate() {
        /* Linear animation */
        this.diff = (this.position - this.oldPosition) / this.animationSteps;
        this.count = 0;

        /* Start animation */
        this.moving = true;
        this.interval = requestAnimationFrame(this.animationInterval.bind(this));
    }

    animationInterval(timestamp) {
        /* Update position */
        this.position = this.oldPosition + this.count * this.diff;
        this.updateSlidesTransformPosition();
        this.count += 1;

        /* Stop interval if animation is done */
        if (this.count - 1 === this.animationSteps) {
            clearInterval(this.interval);
            const direction = this.diff < 0 ? 'right' : 'left';
            this.isJumpNeeded(direction);
            this.moving = false;
            EQEvent('eq-move-after', this.sliderElement, { direction: direction, index: this.getRealIndex() });
        } else {
            window.requestAnimationFrame(this.animationInterval.bind(this));
        }
    }
    isJumpNeeded(direction) {
        if (!this.settings.loop) return false;

        if (direction == 'right') {
            const testLimit = this.index + this.settings.visibleSlides;
            if (testLimit > this.numberOfSlides + this.settings.beforeAfterCount) {
                this.index = this.index - this.numberOfSlides;
                this.position = -this.slideOuterWidth * this.index;
                this.updateSlidesTransformPosition();
            }
        }

        if (direction == 'left') {
            if (this.index < this.settings.beforeAfterCount) {
                this.index = this.index + this.numberOfSlides;
                this.position = -this.slideOuterWidth * this.index;
                this.updateSlidesTransformPosition();
            }
        }
        this.sliderElement.classList.add('transition-none');
        this.setActiveClass();
    }

    /** Gets real index without before and after elements */
    getRealIndex() {
        const realIndex = this.index - this.settings.beforeAfterCount;

        if (realIndex < 0) {
            return this.numberOfSlides + realIndex;
        }

        return realIndex;
    }
}

export default EQSlider;
