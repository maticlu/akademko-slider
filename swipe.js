import EQEvent from './event';

const swipe = (elementDOM) => {
    let clientX = null;
    /**
     * Check if swipe element exists.
     */
    if (!elementDOM) {
        console.error('SWIPE: This element does not exist!');
        return false;
    }

    elementDOM.addEventListener('touchstart', function (e) {
        clientX = e.touches[0].clientX;
    });

    elementDOM.addEventListener('touchend', function (e) {
        const upClientX = e.changedTouches[0].clientX;
        if (upClientX - clientX > 50) {
            EQEvent('swipeLeft', this);
        }

        if (upClientX - clientX < -50) {
            EQEvent('swipeRight', this);
        }
    });
};

export default swipe;
