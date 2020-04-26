const EQEvent = (eventName, element, data = null) => {
    const event = new CustomEvent(eventName, { detail: data });
    element.dispatchEvent(event);
};

export default EQEvent;
