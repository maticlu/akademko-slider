# evaQode Akademko slider

Simple responsive slider created for app called Akademko.



**Example:**

```javascript
import EQSlider from 'slider';

const instance = new EQSlider({
    visibleSlides: 5,
    animationDuration: 300,
    beforeAfterCount: 5,
    spaceBetweenSlides: 25,
    slidesToMove: 1,
    element: '.card-wrapper',
    loop: true,
    slideCountResponsive: [
        {
            size: 900,
            slides: 4,
        },
        {
            size: 700,
            slides: 3,
        },
        {
            size: 500,
            slides: 2,
        },
        {
            size: 400,
            slides: 1,
        },
    ],
});
```

## Options

**element**: string

Element selector which contains slides.

**animationDuration**: int

Animation time when switching slides.

**loop**: bool

Slider will loop. It will never end.

**beforeAfterCount**: int

When using loop, you can adjust how many slides will be visible before and after main set of slides. It is a good feature if you want to show grayedout slides outside of the container. 

**spaceBetweenSlides**: int

Space is shown in pixels.

**slidesToMove**: int

With this option you can how many slides will change during move.

**visibleSlides**:int

Number of slides inside the container.

**arrowSymbol**:string

Replace default arrow symbol

**slideCountResponsive**:array

Array of objects that set how many slides will be visible at certain viewport.

- size : int
  - Viewport when you want the change to happen.
- slides: int
  - Number of slides visible at that viewport.

