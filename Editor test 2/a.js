if (eventTarget.tagName.toLowerCase() === "figcaption" && isFigcaptionEmpty(eventTarget) {
  console.log("clicked on figcaption");

  e.preventDefault();

  const span = currentEditable.querySelector(".figcaption-placeholer-span");
  if (span) {
    const range = document.createRange();
    const selection = window.getSelection();

    range.setStart(span, 0); // Start at the beginning of the span
    range.collapse(true); // Collapse the range to the start point

    selection.removeAllRanges(); // Clear any existing selections
    selection.addRange(range); // Apply the new range (caret position)
    updateHTMLPreview();
    return;
  }






}