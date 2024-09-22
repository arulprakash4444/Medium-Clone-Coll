let cursorPosition = { offset: 0, node: null };

let currentEditable = null;
let currentMain = null;

let currentlySelected = null;
let previouslySelected = null;
let changeIneditable = null;

updateHTMLPreview();

const commands = {
  p: { template: createParagraph },
  h1: { template: createHeading1 },
  h2: { template: createHeading2 },
  q: { template: createBlockQuote },
  i: { template: createImageForm },
  ul: { template: createListUL },
  ol: { template: createListOL },
  hr: { template: createHorizontalRule },
  cb: { template: createCodeBlock },
};

const selectorsCanRunBlockCommandsArray = [
  "p.main",
  "h1.main",
  "h2.main",
  "blockquote p",
  "li",
];
const selectorsCanRunBlockCommands = new Set(selectorsCanRunBlockCommandsArray);

const selectorsCanBeBoldedArray = [
  "h1.main",
  "h2.main",
  "p.main",
  "blockquote p.editable",
  "li.editable",
];
const selectorsCanBeBolded = new Set(selectorsCanBeBoldedArray);

const selectorsCanBeitalicizedArray = [
  "h1.main",
  "h2.main",
  "p.main",
  "blockquote p.editable",
  "li.editable",
];
const selectorsCanBeitalicized = new Set(selectorsCanBeitalicizedArray);

const selectorsCanBeHyperlinkedArray = [
  "h1.main",
  "h2.main",
  "p.main",
  "blockquote p.editable",
  "li.editable",
];
const selectorsCanBeHyperlinked = new Set(selectorsCanBeHyperlinkedArray);

const nonTextEditableArray = ["horizontalRule", "CaptionedImageContainer"];
const nonTextEditable = new Set(nonTextEditableArray);

// const cantRevertBackArray = [
//   "horizontalRule",
//   "unorderedList",
//   "orderedList",
//   "codeBlock",
//   "captionedImageArray",
//   "imageForm",
// ];
// const cantRevertBack = new Set(cantRevertBackArray);

const cursorSpan = '<span id="cursor"></span>';

function updateHTMLPreview() {
  const htmlContent = document.getElementById("editable-container").innerHTML;
  document.getElementById("html-content").textContent = htmlContent;
  return;
}

let guuid;
// function generateUUID() {
//   const cryptoObj = window.crypto || window.msCrypto; // For IE11 compatibility
//   const array = new Uint8Array(16);
//   cryptoObj.getRandomValues(array);

//   array[6] = (array[6] & 0x0f) | 0x40; // Version 4
//   array[8] = (array[8] & 0x3f) | 0x80; // Variant 1

//   return [...array]
//     .map(
//       (b, i) =>
//         (i === 4 || i === 6 || i === 8 || i === 10 ? "-" : "") +
//         b.toString(16).padStart(2, "0")
//     )
//     .join("");
// }
function getUnixTimestampInMilliseconds() {
  return Date.now();
}

function getUUID() {
  //   return generateUUID();
  return getUnixTimestampInMilliseconds();
}

function cleanString(inputString) {
  return inputString.replace(/\u200B/g, "");
}

function cleanHTML(innerHTML) {
  // Replace zero-width spaces (\u200B) and the HTML entity (&#8203;) with an empty string
  return innerHTML.replace(/[\u200B]|&#8203;/g, "");
}

function isElementEmpty(element) {
  return element.textContent.cleanString.trim() === "";
}

// function isElementEmpty(element) {
//   // Check if the element has any child nodes
//   if (element.hasChildNodes()) {
//     // Loop through the child nodes
//     for (let node of element.childNodes) {
//       // If the node is an element or a non-empty text node, the element is not empty
//       if (
//         node.nodeType === Node.ELEMENT_NODE ||
//         (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== "")
//       ) {
//         return false;
//       }
//     }
//   }
//   // If no non-empty child nodes are found, the element is empty
//   return true;
// }

function placeCursorInSpan() {
  const cursorPlaceholder = document.getElementById("cursor");
  const range = document.createRange();
  const selection = window.getSelection();

  range.setStartBefore(cursorPlaceholder);
  range.collapse(true);

  selection.removeAllRanges();
  selection.addRange(range);

  cursorPlaceholder.remove();

  return;
}

function getBeforeAndAfterCuror(element, textOrHTML) {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);

  const preCaretRange = range.cloneRange();
  preCaretRange.selectNodeContents(element);
  preCaretRange.setEnd(range.endContainer, range.endOffset);
  const tempDivBefore = document.createElement("div");
  tempDivBefore.appendChild(preCaretRange.cloneContents());

  const postCaretRange = range.cloneRange();
  postCaretRange.selectNodeContents(element);
  postCaretRange.setStart(range.endContainer, range.endOffset);
  const tempDivAfter = document.createElement("div");
  tempDivAfter.appendChild(postCaretRange.cloneContents());

  if (textOrHTML === "content") {
    return {
      beforeCursor: tempDivBefore.textContent,
      afterCursor: tempDivAfter.textContent,
    };
  } else if (textOrHTML === "HTML") {
    return {
      beforeCursor: tempDivBefore.innerHTML,
      afterCursor: tempDivAfter.innerHTML,
    };
  }
}

function joinWithCursor(string1, string2) {
  return string1 + cursorSpan + string2;
}

function getClosestSelectorFromCursor(selector) {
  const selection = window.getSelection();
  const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

  //   let currentNode = selection.anchorNode;
  // can use selection.focusNode;
  let currentNode = range.startContainer;

  let closestNode =
    currentNode.nodeType === Node.TEXT_NODE
      ? currentNode.parentElement.closest(selector)
      : currentNode.closest(selector);

  return closestNode;
}

// function isCaretAtEnd(element) {
//   const selection = window.getSelection();
//   if (selection.rangeCount === 0) return false; // No active selection or caret

//   const range = selection.getRangeAt(0);
//   const caretPosition = range.endOffset;

//   // Check if the selection is within the given element
//   const isWithinElement =
//     range.commonAncestorContainer === element ||
//     element.contains(range.commonAncestorContainer);

//   if (!isWithinElement) return false;

//   // Check if the caret is at the end of the element
//   const contentLength = element.textContent.length;

//   return caretPosition === contentLength;
// }

// function isCaretAtEnd(element) {
//   const selection = window.getSelection();
//   if (selection.rangeCount === 0) return false; // No active selection or caret
//   const range = selection.getRangeAt(0);

//   let contentLength = element.textContent.length;
//   let { beforeCursor } = getBeforeAndAfterCuror(element, "content");
//   let caretPositionFromStart = beforeCursor.length;

//   // Check if the selection is within the given element
//   const isWithinElement =
//     range.commonAncestorContainer === element ||
//     element.contains(range.commonAncestorContainer);

//   if (!isWithinElement) return false;

//   return contentLength === caretPositionFromStart;
// }

function isCaretAtEnd(element, strict = false) {
  let { afterCursor } = getBeforeAndAfterCuror(element, "content");
  let cleanedString = cleanString(afterCursor);

  if (strict) {
    return cleanedString.trim().length === 0;
  } else {
    return cleanedString.length === 0;
  }
}

// function isCaretAtStart(element) {
//   const selection = window.getSelection();
//   if (selection.rangeCount === 0) return false; // No active selection or caret

//   const range = selection.getRangeAt(0);
//   const caretPosition = range.startOffset;

//   // Check if the selection is within the given element
//   const isWithinElement =
//     range.commonAncestorContainer === element ||
//     element.contains(range.commonAncestorContainer);

//   if (!isWithinElement) return false;

//   // Check if the caret is at the start of the element
//   return caretPosition === 0;
// }

function isCaretAtStart(element, strict = false) {
  let { beforeCursor } = getBeforeAndAfterCuror(element, "content");
  let cleanedString = cleanString(beforeCursor);

  if (strict) {
    return cleanedString.trim().length === 0;
  } else {
    return cleanedString.length === 0;
  }
}

// function setCaretPosition(element, position) {
//   const range = document.createRange();
//   const selection = window.getSelection();

//   if (position === "start") {
//     // Set caret at the start of the element
//     range.setStart(element, 0);
//     range.setEnd(element, 0);
//   } else if (position === "end") {
//     // Set caret at the end of the element
//     range.selectNodeContents(element);
//     range.collapse(false); // Collapse the range to the end
//   } else {
//     console.error("Invalid position argument. Use 'start' or 'end'.");
//     return;
//   }

//   selection.removeAllRanges();
//   selection.addRange(range);
// }

function setCaretPosition(element, position) {
  console.log("inside setcaretposition");
  if (position === "start") {
    // Set caret at the start of the element
    element.innerHTML = cursorSpan + element.innerHTML;
  } else if (position === "end") {
    // Set caret at the end of the element
    element.innerHTML = element.innerHTML + cursorSpan;
  } else {
    console.error("Invalid position argument. Use 'start' or 'end'.");
    return;
  }
  placeCursorInSpan();
  return;
}

function createParagraph(nested = false) {
  let newElement = document.createElement("p");

  if (nested) {
    newElement.classList.add("editable");
    newElement.setAttribute("contenteditable", "true");
    newElement.setAttribute("ComponentName", "paragraph");
  } else {
    newElement.classList.add("editable", "main");
  }

  return newElement;
}

function createHeading1() {
  let newElement = document.createElement("h1");
  newElement.classList.add("editable", "main");
  newElement.setAttribute("ComponentName", "heading1");
  return newElement;
}

function createHeading2() {
  let newElement = document.createElement("h2");
  newElement.classList.add("editable", "main");
  newElement.setAttribute("ComponentName", "heading2");
  return newElement;
}

function createBlockQuote() {
  let newElement = document.createElement("blockquote");
  newElement.classList.add("main");
  newElement.setAttribute("ComponentName", "blockquote");
  newElement.setAttribute("contenteditable", "false");
  newElement.appendChild(createParagraph(true));
  return newElement;
}

function createHorizontalRule() {
  let newElement = document.createElement("hr");
  newElement.classList.add("editable", "main");
  newElement.setAttribute("ComponentName", "horizontalRule");
  newElement.setAttribute("contenteditable", "false");
  return newElement;
}

function createCodeBlock() {
  newElement = document.createElement("pre");
  let newCodeBlock = document.createElement("code");
  newElement.setAttribute("contenteditable", "false");
  newCodeBlock.setAttribute("contenteditable", "true");
  newElement.classList.add("main");
  newElement.setAttribute("ComponentName", "codeBlock");
  newCodeBlock.classList.add("editable");
  newElement.appendChild(newCodeBlock);
  return newElement;
}

function createImageForm() {
  newElement = document.createElement("div");
  newElement.classList.add("main", "image-form");
  newElement.setAttribute("ComponentName", "imageForm");
  newElement.setAttribute("contenteditable", "false");
  let uuid = getUUID();
  guuid = uuid;
  newElement.innerHTML = `
                <form id="imageForm${uuid}">
                  <label for="imgURL${uuid}" class="fixed-width-label">Image URL <span class="red">*</span></label>
                  <input type="text" id="imgURL${uuid}" name="imgURL" required><br>
                  <!-- HIGHLIGHTME comes below -->
                  <div class="aligned-content">
                  <label class="fixed-width-label"></label>
                  <p>Image does not exist</p>
                  </div>
                  <label for="caption${uuid}" class="fixed-width-label">Caption</label>
                  <input type="text" id="caption${uuid}" name="caption"><br><br>
                  <label for="alt${uuid}" class="fixed-width-label">Alt-text</label>
                  <input type="text" id="alt${uuid}" name="alt"><br><br>

                  <div class="button-container">
                    <button type="button" class="cancel-button">Cancel</button>
                    <input type="submit" value="Submit">
                  </div>
                </form>
            `;
  return newElement;
}

function createListItem() {
  let newElement = document.createElement("li");
  newElement.classList.add("editable");
  newElement.setAttribute("ComponentName", "listItem");
  newElement.setAttribute("contenteditable", "true");
  return newElement;
}

function createListUL() {
  newElement = document.createElement("ul");
  let newListItem = createListItem();
  newElement.setAttribute("contenteditable", "false");
  newElement.classList.add("main");
  newElement.setAttribute("ComponentName", "unorderedList");
  newElement.appendChild(newListItem);
  return newElement;
}

function createListOL() {
  newElement = document.createElement("ol");
  let newListItem = createListItem();
  newElement.setAttribute("contenteditable", "false");
  newElement.classList.add("main");
  newElement.setAttribute("ComponentName", "orderedList");
  newElement.appendChild(newListItem);
  return newElement;
}

function createFigcaption() {
  let newElement = document.createElement("figcaption");
  newElement.classList.add("editable", "imageCaption");
  newElement.setAttribute("contenteditable", "true");
  newElement.setAttribute("ComponentName", "figureCaption");
  return newElement;
}

function createCaptionedImageContainer(url, caption, alt) {
  let newElement = document.createElement("div");
  newElement.classList.add("main", "editable", "captionedImageContainer");
  newElement.setAttribute("contenteditable", "false");
  newElement.setAttribute("ComponentName", "CaptionedImageContainer");

  let figure = document.createElement("figure");
  figure.setAttribute("contenteditable", "false");
  newElement.appendChild(figure);

  let imgContainer = document.createElement("div");
  imgContainer.classList.add("imageContainer");
  imgContainer.setAttribute("contenteditable", "false");

  let image = document.createElement("img");
  image.setAttribute("contenteditable", "false");
  image.setAttribute("src", url);

  if (alt) {
    image.setAttribute("alt", alt);
  }
  imgContainer.appendChild(image);
  figure.appendChild(imgContainer);

  if (caption) {
    let figcaption = createFigcaption();
    figcaption.textContent = caption;
    figure.appendChild(figcaption);
  }

  return newElement;
}

function create(reference, what, where) {
  let newElement = null;

  if (what instanceof HTMLElement) {
    newElement = what;
  } else if (typeof what === "string") {
    if (what in commands) {
      const newElementFunction = commands[what].template;
      newElement = newElementFunction();
    } else {
      newElement = document.createElement(what);
    }
  }

  if (where === "self") {
    reference.parentNode.replaceChild(newElement, reference);
  } else if (where === "below") {
    reference.parentNode.insertBefore(newElement, reference.nextSibling);
  } else if (where === "above") {
    reference.parentNode.insertBefore(newElement, reference);
  }

  currentEditable = reference = newElement;

  setCaretPosition(currentEditable, "start");
  updateHTMLPreview();
  return newElement;
}

// ====UTILITY FUNCTIONS===================================================================================================================================

function getImmediateSiblings(element) {}

function whatElementIs(element) {
  return element.getAttribute("type");
}

// LIST RELATED FUNCTIONS ==================================================================================================================

function appendStringToList(listElement, string) {
  const listItem = createListItem();
  listItem.innerHTML = string;
  listElement.appendChild(listItem);
  return;
}

function mergeTwoLists(targetList, sourceList) {
  while (sourceList.firstChild) {
    targetList.appendChild(sourceList.firstChild);
  }
}

function mergeListArray(listArray) {
  if (listArray.length === 0) return null; // Return null if the array is empty

  const targetList = listArray[0];

  for (let i = 1; i < listArray.length; i++) {
    mergeTwoLists(targetList, listArray[i]);
    listArray[i].remove(); // Remove the merged list from the DOM
  }

  return targetList; // Return the merged ul
}

// ============================================================================================================================================

function setCurrentAndPreviouslySelected(element) {
  console.log(
    `from setcurrentandpreviouslyselected::element innerhtml:${element.innerHTML}`
  );
  if (currentlySelected === element) {
    changeIneditable = false;
    return;
  }

  changeIneditable = true;
  if (currentlySelected) {
    currentlySelected.classList.remove("selected");
    if (previouslySelected) {
      previouslySelected.classList.remove("previously-selected");
    }
    previouslySelected = currentlySelected;
    previouslySelected.classList.add("previously-selected");
  }

  currentlySelected = element;
  currentlySelected.classList.add("selected");
  updateHTMLPreview();
  return;
}

function Presanitize(element) {
  element.textContent = "⏮" + element.textContent;
  setCaretPosition(element, "end");
  return;
}

function Postsanitize(element) {
  element.textContent = element.textContent + "⏭";

  return;
}

// ==========================================================================================================================================

function findPreviousChildClass(
  currentElement,
  className,
  currentElementParentContainer
) {
  // Traverse previous siblings until we find one with the class "child-class"
  let previousElement = currentElement.previousElementSibling;

  while (previousElement) {
    if (previousElement.classList.contains(className)) {
      return previousElement;
    }
    previousElement = previousElement.previousElementSibling;
  }

  // If no previous sibling with "child-class" is found, we move up the DOM tree
  let parentElement = currentElement.parentElement;
  while (parentElement && parentElement !== currentElementParentContainer) {
    previousElement = parentElement.previousElementSibling;

    while (previousElement) {
      if (previousElement.classList.contains(className)) {
        return previousElement;
      }

      // Check if the previous sibling has children with "child-class"
      const descendants = previousElement.querySelectorAll("." + className);
      if (descendants.length > 0) {
        return descendants[descendants.length - 1]; // Return the last child-class element found
      }

      previousElement = previousElement.previousElementSibling;
    }

    parentElement = parentElement.parentElement;
  }

  return null; // If no previous element is found
}

function findNextChildClass(
  currentElement,
  className,
  currentElementParentContainer
) {
  // Traverse next siblings until we find one with the class "child-class"
  let nextElement = currentElement.nextElementSibling;

  while (nextElement) {
    if (nextElement.classList.contains(className)) {
      return nextElement;
    }
    nextElement = nextElement.nextElementSibling;
  }

  // If no next sibling with "child-class" is found, we move up the DOM tree
  let parentElement = currentElement.parentElement;
  while (parentElement && parentElement !== currentElementParentContainer) {
    nextElement = parentElement.nextElementSibling;

    while (nextElement) {
      if (nextElement.classList.contains(className)) {
        return nextElement;
      }

      // Check if the next sibling has children with "child-class"
      const descendants = nextElement.querySelectorAll("." + className);
      if (descendants.length > 0) {
        return descendants[0]; // Return the first child-class element found
      }

      nextElement = nextElement.nextElementSibling;
    }

    parentElement = parentElement.parentElement;
  }

  return null; // If no next element is found
}

function findLastChildClass(parentContainer, className) {
  // Find all elements with the class 'child-class' within the parent container
  const childElements = parentContainer.querySelectorAll("." + className);

  // If there are any elements found, return the last one
  if (childElements.length > 0) {
    return childElements[childElements.length - 1];
  }

  // If no elements with 'child-class' were found, return null
  return null;
}

function findFirstChildClass(parentContainer, className) {
  // Find the first element with the class 'child-class' within the parent container
  const firstChildElement = parentContainer.querySelector("." + className);

  // Return the first element found, or null if none exist
  return firstChildElement;
}

// =============================================================================================================================================

function getCurrentElementAtCursor() {
  const selection = window.getSelection();

  // Check if there is a valid selection and the selection is within a contenteditable element
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const currentElement = range.startContainer;

    // If the current element is a text node, return its parent element
    return currentElement.nodeType === Node.TEXT_NODE
      ? currentElement.parentElement
      : currentElement;
  }

  return null;
}

function findClosestPreviousEditable() {
  let currentEditable = getClosestSelectorFromCursor(".editable");
  let currentEditableMain = getClosestSelectorFromCursor(".main");
  theContainer = getClosestSelectorFromCursor("#editable-container");

  if (!currentEditableMain && theContainer) {
    if (
      findPreviousChildClass(
        getCurrentElementAtCursor(),
        "main",
        document.getElementById("editable-container")
      )
    ) {
    } else {
    }
  }
}
function findClosestNextEditable() {}

function removeNonMainElements() {
  const container = document.getElementById("editable-container");
  const childNodes = Array.from(container.childNodes);

  childNodes.forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      if (!node.classList.contains("main")) {
        container.removeChild(node);
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      container.removeChild(node);
    }
  });
}

function bringCaretToEditable() {
  removeNonMainElements();
  let selected = document
    .getElementById("editable-container")
    .querySelector(".selected");
  setCaretPosition(selected, "end");
}
// =============================================================================================================================================
let currentTextLength = { beforeTextLength: null, afterTextLength: null };
let previousTextLength = { beforeTextLength: null, afterTextLength: null };
let changeInTextLength = null;

function setChangeInTextLength(textLength) {
  console.log(`ctlb:${currentTextLength.beforeTextLength}`);
  console.log(`ctla:${currentTextLength.afterTextLength}`);
  console.log(`ntlb:${textLength.beforeTextLength}`);
  console.log(`ntla:${textLength.afterTextLength}`);
  if (
    currentTextLength.beforeTextLength === textLength.beforeTextLength &&
    currentTextLength.afterTextLength === textLength.afterTextLength
  ) {
    console.log("false");
    changeInTextLength = false;
    return;
  }
  console.log("true");
  changeInTextLength = true;

  previousTextLength = currentTextLength;

  currentTextLength = textLength;

  return;
}

let currentPreviousSelection = null;
let previousPreviousSelection = null;
let changeInPreviousSelection = null;

function setChangeInPreviousSelection(runningPreviousSelection) {
  if (currentPreviousSelection === runningPreviousSelection) {
    changeInPreviousSelection = false;
    return;
  }
  changeInPreviousSelection = true;

  previousPreviousSelection = currentPreviousSelection;

  currentPreviousSelection = runningPreviousSelection;

  return;
}

let currentCurrentSelection = null;
let previousCurrentSelection = null;
let changeInCurrentSelection = null;

function setChangeInCurrentSelection(runningCurrentSelection) {
  if (currentCurrentSelection === runningCurrentSelection) {
    changeInCurrentSelection = false;
    return;
  }
  changeInCurrentSelection = true;

  previousCurrentSelection = currentCurrentSelection;

  currentCurrentSelection = runningCurrentSelection;

  return;
}

document.addEventListener("selectionchange", function () {
  console.log("change of selection");
  //   const selection = window.getSelection();
  //   const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

  //   if (range) {
  // const caretNode = range.startContainer;

  // Find the nearest element with the 'editable' class
  editable = getClosestSelectorFromCursor(".editable");
  currentMain = getClosestSelectorFromCursor(".main");
  theContainer = getClosestSelectorFromCursor("#editable-container");

  if (editable) {
    setCurrentAndPreviouslySelected(editable);

    if (changeIneditable) {
      recording = false;
    }

    let { beforeCursor, afterCursor } = getBeforeAndAfterCuror(
      editable,
      "content"
    );
    console.log(beforeCursor, afterCursor);

    let beforeTextLength = cleanString(beforeCursor).length;
    let afterTextLength = cleanString(afterCursor).length;
    setChangeInTextLength({ beforeTextLength, afterTextLength });

    if (commandMatch && changeInTextLength) {
      recording = false;
    }

    console.log(`change in editable:${changeIneditable}`);
    console.log(`change in edtiable text length:${changeInTextLength}`);

    if (changeIneditable || changeInTextLength) {
      currentEditable = editable;

      //   REQ: fix the cursor position in presanitize
      setChangeInCurrentSelection(currentlySelected);
      if (changeInCurrentSelection) {
        // Presanitize(currentlySelected);
      }

      setChangeInPreviousSelection(previouslySelected);
      if (changeInPreviousSelection) {
        // Postsanitize(previouslySelected);
      }

      if (currentEditable) {
        console.log("current editable element:", currentEditable.tagName);
        console.log("current editable element:", currentEditable.textContent);
      }

      if (currentMain) {
        console.log("current main element:", currentMain.tagName);
        console.log("current main element:", currentMain.textContent);
      }
    }
  } else {
    console.log("editable is null");
    //   REQ:if closest main is not found, and closest container is found, put caret to nearest .editable , if not found create a p and put caret inside
    if (!currentEditable && currentMain) {
      console.log(
        "[WARNING]: Caret is present outside editable area, inside main"
      );
      bringCaretToEditable();
    }

    if (!currentMain && theContainer) {
      console.log(
        "[WARNING]: Caret is present outside editable area, inside container"
      );
      bringCaretToEditable();
    }
  }

  updateHTMLPreview();
});

const blockLevelRegexPattern = /^\/(h1|h2|p|ul|ol|cb|i)\s*(.*)$/;
let commandMatch = false;
let commandInput = null;
let recording = false;
// REQ(done):change of editable ku recording false veikanum
//REQ(done): when commandmatch is true and change of cursor

document
  .getElementById("editable-container")
  .addEventListener("input", function (event) {
    updateHTMLPreview();

    if (currentEditable) {
      console.log(`event.data:|${event.data}|`);
      let typedCharacter = event.data;
      if (typedCharacter === " ") {
        console.log("pressed space");
        recording = false;
      }
      if (typedCharacter === "/") {
        commandInput = typedCharacter;
        console.log("HHHHHHHHHHHHHHH");
        recording = true;
      } else if (recording && commandInput.startsWith("/")) {
        commandInput += typedCharacter; // Append to command input

        // Check if the command matches the pattern
        const match = commandInput.match(blockLevelRegexPattern);
        if (match) {
          commandMatch = true;
          currentEditable.innerHTML = currentEditable.innerHTML.replace(
            match[1],
            `<span class="command">${match[1]}</span>`
          );
        }
      }
      console.log(`commandmatch:${commandMatch}`);
      console.log(`recording:${recording}`);
      console.log(`commandInput:${commandInput}`);
    }
  });

document
  .getElementById("editable-container")
  .addEventListener("keydown", function (event) {
    // console.log(document.getSelection().anchorNode.parentElement);
    if (currentEditable) {
      // ===========ENTER EVENT=======================================================================================================================
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();

        console.log("pressed enter");
        console.log(getBeforeAndAfterCuror(currentEditable, "HTML"));
      }
    }
  });

document
  .getElementById("editable-container")
  .addEventListener("paste", function (e) {
    if (currentEditable) {
      // Prevent the default paste behavior
      e.preventDefault();

      // Get the pasted data
      const pastedText = (e.clipboardData || window.clipboardData).getData(
        "text/plain"
      );

      // Create a new text node with the pasted content
      const newTextNode = document.createTextNode(pastedText);

      // Get the current selection and range
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);

      // Check if the range is positioned before any element
      if (range.startContainer.nodeType === Node.ELEMENT_NODE) {
        const startNode = range.startContainer;

        // Insert the new text node before the start node
        startNode.parentNode.insertBefore(newTextNode, startNode);
      } else {
        // If range is in a text node or other non-element node
        range.insertNode(newTextNode);
      }

      // Place the caret after the newly inserted text
      range.setStartAfter(newTextNode);
      range.setEndAfter(newTextNode);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    updateHTMLPreview();
  });
