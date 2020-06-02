const resizeObserver = new ResizeObserver((_entries, observer) => {
    setFootnoteLocation(true);
});

const computeOffsetForAlignment = function(elemToAlign, targetAlignment) {
    const offsetParentTop = elemToAlign.offsetParent.getBoundingClientRect().top;
    return targetAlignment.getBoundingClientRect().top - offsetParentTop;
}

const setFootnoteOffsets = function(footnotes) {
    let lastBottom = 0;

    const header = document.querySelector("article header");
    const toc = document.querySelector("nav#TableOfContents");
    if (toc) {
        lastBottom = 
            toc.getBoundingClientRect().height +
            header.getBoundingClientRect().height - 
            parseInt(window.getComputedStyle(toc).marginBottom) -
            parseInt(window.getComputedStyle(toc).marginTop);
    }

    for (let i = 0; i < footnotes.length; i++) {
        const footnote = footnotes[i];

        const intextLink = document.querySelector("a.footnote-ref[href='#" + footnote.id + "']");
        const verticalAlignmentTarget = intextLink.closest('p,li') || intextLink;

        let offset = computeOffsetForAlignment(footnote, verticalAlignmentTarget);
        if (offset < lastBottom) {
            offset = lastBottom;
        }

        lastBottom =
            offset +
            footnote.offsetHeight +
            parseInt(window.getComputedStyle(footnote).marginBottom) +
            parseInt(window.getComputedStyle(footnote).marginTop);

        footnote.style.top = offset + 'px';
        footnote.style.position = 'absolute';
    }
};

const clearFootnoteOffsets = function(footnotes) {
    for (let i = 0; i < footnotes.length; i++) {
        footnotes[i].style.top = null;
        footnotes[i].style.position = null;
    }
};

const setFootnoteLocation = function(inMargins) {
    const footnoteSection = document.querySelector("section.footnotes[role=doc-endnotes]");
    const footnotes = document.querySelectorAll("li[role=doc-endnote]");

    if (inMargins) {
        footnoteSection.classList.add("margin-footnotes");

        setFootnoteOffsets(footnotes);
        
        const article = document.querySelector("article");
        resizeObserver.observe(article);
    }
    else {
        resizeObserver.disconnect();

        clearFootnoteOffsets(footnotes);

        footnoteSection.classList.remove("margin-footnotes");
    }
};

const handleWindowSize = function() {
    let state = false;
    let remUnits = parseFloat(getComputedStyle(document.documentElement).fontSize);

    return function() {
        const currentState = window.innerWidth >= 65 * remUnits;
        if (currentState != state) {
            setFootnoteLocation(currentState);
            state = currentState;
        }
    };
}();

document.addEventListener("DOMContentLoaded", function(event) {
    const article = document.querySelector("article");
    const footnotes = document.querySelector("section.footnotes[role=doc-endnotes]");

    console.log(article, footnotes);

    if (article && footnotes) {
        window.addEventListener('resize', handleWindowSize);
        handleWindowSize();
    }
});
