export default (parent: Element, element: Element) => {
    let hasParent = false;
    let currentParent = element.parentElement;

    while (currentParent && !hasParent) {
        if (currentParent === parent) hasParent = true;
        currentParent = currentParent.parentElement;
    }

    return hasParent;
}

