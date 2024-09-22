let currentEditable = null;
let cursorPosition = { offset: 0, node: null };

// document.querySelector("#one").focus();
updateHTMLPreview();

function checkImageExists(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true); // Image exists
    img.onerror = () => resolve(false); // Image not found
    img.src = url; // Trigger image loading
  });
}

let guuid;
function getUnixTimestampInSeconds() {
  return Math.floor(Date.now() / 1000); // Converts milliseconds to seconds
}

function otherThanFirstLiAreEmpty(list) {
  let clonedList = list.cloneNode(true);
  clonedList.firstChild.remove();
  console.log(`other1 ${clonedList.textContent}`);
  if (clonedList.textContent === "" || clonedList.textContent === null) {
    console.log(`other ${clonedList.textContent}`);
    console.log("other true");
    return true;
  } else if (clonedList.textContent !== null) {
    console.log("false");
    return false;
  }
}

function cleanZeroWidthWhitespace(innerHTML) {
  // Replace zero-width spaces (\u200B) and the HTML entity (&#8203;) with an empty string
  return innerHTML.replace(/[\u200B]|&#8203;/g, "");
}

function isCaretAtStartOf(element) {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);

  // Check if the selection's anchor node is the LI element or its first child (text node)
  if (
    range.startContainer === element ||
    range.startContainer === element.firstChild
  ) {
    return range.startOffset === 0;
  }
  return false;
}

function createSomething(
  currEditable,
  tagName,
  newElementPosition,
  html4CurrEditable = undefined,
  html4NewElement
) {
  console.log(currEditable.innerHTML);
  console.log(tagName);
  console.log(newElementPosition);
  console.log(html4CurrEditable);
  console.log(html4NewElement);

  if (html4CurrEditable === undefined && html4NewElement === undefined) {
    html4NewElement = "";
  }

  if (html4CurrEditable === undefined && html4NewElement) {
    html4NewElement = html4NewElement;
  }

  let newElement = document.createElement(tagName);
  if (
    tagName === "p" ||
    tagName === "h1" ||
    tagName === "h2" ||
    tagName === "li"
  ) {
    newElement.setAttribute("contenteditable", "true");
  }
  newElement.className = "editable";

  //FireFox cannot keep caret on empty li by using keyboard, so keep zero-width-space in front
  if (tagName === "li") {
    if (html4NewElement === "") {
      html4NewElement = "&#8203;" + html4NewElement;
    }
    if (html4CurrEditable === "") {
      html4CurrEditable = "&#8203;" + html4CurrEditable;
    }
  }

  if (html4CurrEditable !== undefined) {
    currEditable.innerHTML = html4CurrEditable;
  }

  newElement.innerHTML = '<span id="cursor"></span>' + html4NewElement;

  if (newElementPosition === "self") {
    currEditable.parentNode.replaceChild(newElement, currEditable);
  }
  if (newElementPosition === "below") {
    currEditable.parentNode.insertBefore(newElement, currEditable.nextSibling);
  }
  if (newElementPosition === "above") {
    currEditable.parentNode.insertBefore(newElement, currEditable);
  }

  currEditable = newElement;

  newElement.focus();
  //console.log(newElement.textContent);

  const cursorPlaceholder = document.getElementById("cursor");

  const newRange = document.createRange();

  const sel = window.getSelection();

  newRange.setStart(cursorPlaceholder, 0);
  newRange.collapse(true);

  sel.removeAllRanges();
  sel.addRange(newRange);
  console.log("here");
  cursorPlaceholder.remove();
  console.log("here");
  updateHTMLPreview();
  return newElement;
}

// ===========INPUT EVENT STARTS============================================================================================================================================

document
  .getElementById("editable-container")
  .addEventListener("input", function (e) {
    updateHTMLPreview();
  });

// ========FOCUS EVENT STARTS====================================================================================================================================================
function isFigcaptionEmpty(figcaption) {
  let clonedFigcaption = figcaption.cloneNode(true);
  let figcaptionPlacholder = clonedFigcaption.querySelector(
    ".figcaption-placeholder-span"
  );

  let figcaptionCursor = clonedFigcaption.querySelector("#cursor");

  if (figcaptionPlacholder !== null) {
    figcaptionPlacholder.remove();
  }
  if (figcaptionCursor !== null) {
    figcaptionCursor.remove();
  }
  if (clonedFigcaption.textContent.trim() === "") {
    return true;
  } else {
    return false;
  }
}

document
  .getElementById("editable-container")
  .addEventListener("focusin", function (e) {
    if (e.target && e.target.classList.contains("editable")) {
      currentEditable = e.target;
      console.log(`currEditable>>${currentEditable.tagName}`);
    }

    if (
      currentEditable.tagName.toLowerCase() === "div" &&
      currentEditable.classList.contains("captionedImageContainer")
    ) {
      e.preventDefault();
      let figcaption = currentEditable.querySelector("figcaption");
      if (figcaption === null) {
        figcaption = document.createElement("figcaption");
        figcaption.contentEditable = "true";
        figcaption.classList.add("imageCaption", "editable");

        // figcaption.setAttribute("placeholder", "Add a caption");
        figcaption.innerHTML =
          '<span id="cursor"></span>' +
          '<span class = "figcaption-placeholder-span" contenteditable="false">Type caption for image (optional)</span>';

        const figure = currentEditable.querySelector("figure");

        figure.appendChild(figcaption);
        updateHTMLPreview();
      }
      return;
    }

    if (
      currentEditable.tagName.toLowerCase() === "figcaption" &&
      isFigcaptionEmpty(currentEditable)
    ) {
      console.log("figcaption focus in and empty");
      e.preventDefault();

      const span = currentEditable.querySelector(
        ".figcaption-placeholder-span"
      );
      if (span) {
        const cursorPlaceholder = currentEditable.querySelector("#cursor");
        if (cursorPlaceholder) {
          console.log("focus in la minnadiye cursor irukku");
        } else {
          currentEditable.innerHTML =
            '<span id="cursor"></span>' + currentEditable.innerHTML;
        }
        const newRange = document.createRange();

        const sel = window.getSelection();

        newRange.setStart(cursorPlaceholder, 0);
        newRange.collapse(true);

        sel.removeAllRanges();
        sel.addRange(newRange);

        cursorPlaceholder.remove();
      }
      updateHTMLPreview();
      return;
    }

    updateHTMLPreview();
  });

// =======FOCUS OUT EVENT STARTS========================================================================================================================================

document
  .getElementById("editable-container")
  .addEventListener("focusout", function (e) {
    if (e.target && e.target.classList.contains("editable")) {
      currentTarget = e.target;
    }

    if (
      currentTarget.tagName.toLowerCase() === "div" &&
      currentTarget.classList.contains("captionedImageContainer")
    ) {
      const figcaption = currentTarget.querySelector("figcaption");

      setTimeout(() => {
        const activeElement = document.activeElement; //get currently focused element
        // console.log(`AE:${activeElement.tagName}`);
        // console.log(`ce from focusout:${currentEditable.tagName}`);
        // if (
        //   activeElement.tagName.toLowerCase() === "figcaption" &&
        //   figcaption.textContent.trim() !== ""
        // ) {
        //   //   Do Nothing
        // }

        //currentEditable.tagName.toLowerCase() also works

        if (activeElement !== figcaption && isFigcaptionEmpty(figcaption)) {
          figcaption.remove();
        }
      }, 0);
    }

    if (currentTarget.tagName.toLowerCase() === "figcaption") {
      const captionedImageContainer = currentTarget.closest(
        ".captionedImageContainer"
      );

      const figcaption = currentTarget;

      setTimeout(() => {
        const activeElement = document.activeElement;

        if (
          activeElement !== captionedImageContainer &&
          isFigcaptionEmpty(figcaption)
        ) {
          figcaption.remove();
        }
      }, 0);
    }

    updateHTMLPreview();
  });

// ================CLICK EVENT LOGIC STARTS=====================================================================================================================================
document
  .getElementById("editable-container")
  .addEventListener("click", function (event) {
    console.log(currentEditable.tagName);
    console.log(currentEditable.className);

    // Handle cancel button click
    if (
      event.target.tagName === "BUTTON" &&
      event.target.classList.contains("cancel-button")
    ) {
      const currentEditable = event.target.closest(".image-form");
      createSomething(currentEditable, "p", "self");
      updateHTMLPreview();
      return;
    }
  });
// ==========MOUSE DOWN EVENTS============================================================================================================================

// pointerdown > mousedown > click

document
  .getElementById("editable-container")
  .addEventListener("mousedown", function (event) {
    // Check if the MOUSEDOWN is within the captionedImageContainer
    const container = event.target.closest(".captionedImageContainer");

    if (container) {
      // Ensure focus is not on figcaption
      if (!event.target.closest("figcaption")) {
        console.log("Focus on container other than caption");

        // Ensure the container is focusable
        // container.setAttribute("tabindex", "0");
        container.focus(); // Set focus to the container
        updateHTMLPreview();
        return;
      }
    }

    let eventTarget = event.target;
    if (
      eventTarget.tagName.toLowerCase() === "figcaption" &&
      isFigcaptionEmpty(eventTarget)
    ) {
      console.log("clicked on figcaption");

      //   event.preventDefault();

      const span = currentEditable.querySelector(
        ".figcaption-placeholder-span"
      );
      if (span) {
        setTimeout(() => {
          const cursorPlaceholder = currentEditable.querySelector("#cursor");
          if (cursorPlaceholder) {
            console.log("focus in la minnadiye cursor irukku");
          } else {
            currentEditable.innerHTML =
              '<span id="cursor"></span>' + currentEditable.innerHTML;
          }
          const newRange = document.createRange();

          const sel = window.getSelection();

          newRange.setStart(cursorPlaceholder, 0);
          newRange.collapse(true);

          sel.removeAllRanges();
          sel.addRange(newRange);

          cursorPlaceholder.remove();
        }, 0); // Apply the new range (caret position)
      }
      updateHTMLPreview();
      return;
    }
    console.log(eventTarget.className);

    if (eventTarget.classList.contains("figcaption-placeholder-span")) {
      console.log("clicked on span");

      //   event.preventDefault();

      setTimeout(() => {
        const cursorPlaceholder = currentEditable.querySelector("#cursor");
        if (cursorPlaceholder) {
          console.log("focus in la minnadiye cursor irukku");
        } else {
          currentEditable.innerHTML =
            '<span id="cursor"></span>' + currentEditable.innerHTML;
        }
        const newRange = document.createRange();

        const sel = window.getSelection();

        newRange.setStart(cursorPlaceholder, 0);
        newRange.collapse(true);

        sel.removeAllRanges();
        sel.addRange(newRange);

        cursorPlaceholder.remove(); // Apply the new range (caret position)
      }, 0); // Apply the new range (caret position)
      updateHTMLPreview();
      return;
    }
  });

//   =====INPUT EVENT LOGIC BEGINS===================================================================================================================================

document
  .getElementById("editable-container")
  .addEventListener("input", function (event) {
    let eventTarget = event.target;
    if (eventTarget.tagName.toLowerCase() === "figcaption") {
      console.log("INPUT on figcaption");

      //   event.preventDefault();

      const span = eventTarget.querySelector(".figcaption-placeholder-span");
      if (span) {
        span.remove();
      }

      updateHTMLPreview();
      return;
    }

    if (eventTarget.classList.contains("figcaption-placeholder-span")) {
      console.log("input span la irunthu");
      event.preventDefault();
    }
  });

// =============SUBMIT LOGIC BEGINS==========================================================================================================================
document
  .getElementById("editable-container")
  .addEventListener("submit", function (event) {
    if (event.target.tagName === "FORM") {
      // Check if the event target is a form
      event.preventDefault(); // Prevents the form from submitting

      const form = event.target;
      const imgURL = form.querySelector('input[name="imgURL"]').value;
      const caption = form.querySelector('input[name="caption"]').value;
      const alt = form.querySelector('input[name="alt"]').value;

      console.log("Form Data:", { imgURL, caption, alt });

      checkImageExists(imgURL).then((exists) => {
        if (exists) {
          console.log("Image exists.");
          let currEditable;
          currEditable = form.parentElement;

          let newElement = document.createElement("div");
          newElement.classList.add("captionedImageContainer", "editable");
          newElement.setAttribute("tabindex", "0");
          let figure = document.createElement("figure");
          newElement.appendChild(figure);
          let imgContainer = document.createElement("div");
          imgContainer.classList.add("imageContainer");
          let image = document.createElement("img");
          image.setAttribute("src", imgURL);

          if (alt) {
            image.setAttribute("alt", alt);
          }
          imgContainer.appendChild(image);
          figure.appendChild(imgContainer);
          if (caption) {
            let figcaption = document.createElement("figcaption");
            figcaption.classList.add("imageCaption", "editable");
            figcaption.setAttribute("contenteditable", "true");
            figcaption.setAttribute("placeholder", "Add a caption");

            figcaption.textContent = caption;
            figure.appendChild(figcaption);
          }
          currEditable.parentNode.replaceChild(newElement, currEditable);
          currEditable = newElement;

          newElement.focus();
        } else {
          form.querySelector(".aligned-content").style.visibility = "visible";
        }
      });

      updateHTMLPreview();
      return;
    }
  });
// ==========KEYDOWN ENTER LOGIC BEGINS==============================================================================================================================
document
  .getElementById("editable-container")
  .addEventListener("keydown", function (e) {
    if (currentEditable) {
      if (e.key === "Enter" && !e.shiftKey) {
        // console.log(e);
        // e.preventDefault();

        if (
          currentEditable.tagName.toLowerCase() === "div" &&
          currentEditable.classList.contains("captionedImageContainer")
        ) {
          e.preventDefault();
          if (currentEditable.nextElementSibling) {
            let nextElementSibling = currentEditable.nextElementSibling;
            let nextElementSiblingTag =
              currentEditable.nextElementSibling.tagName.toLowerCase();
            if (nextElementSiblingTag === "p") {
              if (nextElementSibling.textContent === "") {
                if (currentEditable.previousElementSibling) {
                  let previousElementSibling =
                    currentEditable.previousElementSibling;
                  let previousElementSiblingTag =
                    currentEditable.previousElementSibling.tagName.toLowerCase();
                  if (previousElementSiblingTag === "p") {
                    if (previousElementSibling.textContent === "") {
                      currentEditable.nextElementSibling.focus();
                      currentEditable = currentEditable.nextElementSibling;
                    } else if (previousElementSibling.textContent !== "") {
                      createSomething(currentEditable, "p", "above");
                    }
                  } else {
                    createSomething(currentEditable, "p", "above");
                  }
                } else {
                  createSomething(currentEditable, "p", "above");
                }
              } else if (nextElementSibling.textContent !== "") {
                createSomething(currentEditable, "p", "below");
              }
            } else {
              createSomething(currentEditable, "p", "below");
            }
          } else {
            createSomething(currentEditable, "p", "below");
          }

          updateHTMLPreview();
          return;
        }

        // Save the cursor position
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        cursorPosition = {
          offset: range.startOffset,
          node: range.startContainer,
        };

        if (currentEditable.tagName.toLowerCase() === "figcaption") {
          if (selection.isCollapsed) {
            let currentNode = selection.anchorNode;
            let figcaption =
              currentNode.nodeType === Node.TEXT_NODE
                ? currentNode.parentElement.closest("figcaption")
                : currentNode.closest("figcaption");
            const preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(figcaption);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            const tempDiv = document.createElement("div");
            tempDiv.appendChild(preCaretRange.cloneContents());
            let textBeforeCursor = tempDiv.textContent;
            //   console.log(`tbc:|${textBeforeCursor.replace(/\s+/g, "")}|`);

            const postCaretRange = range.cloneRange();
            postCaretRange.selectNodeContents(figcaption);
            postCaretRange.setStart(range.endContainer, range.endOffset);
            const tempDivAfter = document.createElement("div");
            tempDivAfter.appendChild(postCaretRange.cloneContents());
            let textAfterCursor = tempDivAfter.textContent;

            if (textBeforeCursor.replace(/\s+/g, "") !== "") {
              e.preventDefault();

              let imageContainer = currentEditable.closest(
                ".captionedImageContainer"
              );

              currentEditable.textContent = textBeforeCursor;
              createSomething(
                imageContainer,
                "p",
                "below",
                undefined,
                textAfterCursor
              );
            }
            if (textBeforeCursor.replace(/\s+/g, "") === "") {
              console.log("enter from first of figcaption");
              e.preventDefault();

              let imageContainer = currentEditable.closest(
                ".captionedImageContainer"
              );
              currentEditable.remove();
              createSomething(
                imageContainer,
                "p",
                "below",
                undefined,
                textAfterCursor
              );
            }
          }

          updateHTMLPreview();
          return;
        }

        if (
          currentEditable.tagName.toLowerCase() === "ul" ||
          currentEditable.tagName.toLowerCase() === "ol"
        ) {
          e.preventDefault();
          //console.log("ul confirmed");

          if (selection.isCollapsed) {
            if (
              currentEditable.childNodes.length === 1 &&
              currentEditable.firstChild.textContent === ""
            ) {
              //console.log("collapsed, onlychild, and its empty");
              createSomething(
                currentEditable,
                "p",
                "self",
                undefined,
                undefined
              );
              return;
            }

            if (
              currentEditable.childNodes.length > 0 &&
              currentEditable.textContent !== "" &&
              currentEditable.lastChild.textContent.replace(/\u200B/g, "") ===
                ""
            ) {
              currentEditable.lastChild.remove();
              createSomething(
                currentEditable,
                "p",
                "below",
                undefined,
                undefined
              );
              return;
            }

            if (
              currentEditable.childNodes.length > 0 &&
              currentEditable.textContent !== "" &&
              currentEditable.lastChild.textContent !== ""
            ) {
              // console.log("there is some li with content and the last li has no textContent");
              //console.log(selection.anchorNode.parentElement.closest("li").textContent);

              let currentNode = selection.anchorNode;
              let li =
                currentNode.nodeType === Node.TEXT_NODE
                  ? currentNode.parentElement.closest("li")
                  : currentNode.closest("li");
              //   console.log(`LI ${li.textContent}`);

              //   let content =selection.anchorNode.parentElement.closest("li").innerHTML;

              const preCaretRange = range.cloneRange();
              preCaretRange.selectNodeContents(li);
              preCaretRange.setEnd(range.endContainer, range.endOffset);
              const tempDiv = document.createElement("div");
              tempDiv.appendChild(preCaretRange.cloneContents());
              let htmlBeforeCursor = tempDiv.innerHTML;
              //console.log(`li b: ${htmlBeforeCursor}`);

              // Clone the range again to get the content after the cursor
              const postCaretRange = range.cloneRange();
              postCaretRange.selectNodeContents(li);
              postCaretRange.setStart(range.endContainer, range.endOffset);
              const tempDivAfter = document.createElement("div");
              tempDivAfter.appendChild(postCaretRange.cloneContents());
              let htmlAfterCursor = tempDivAfter.innerHTML;
              //console.log(`li a: ${htmlAfterCursor}`);

              createSomething(
                li,
                "li",
                "below",
                htmlBeforeCursor,
                htmlAfterCursor
              );

              return;
            }
          }
        }

        if (currentEditable.tagName.toLowerCase() === "pre") {
          //   let currentNode = selection.anchorNode;
          //   let codeBlock =
          //     currentNode.nodeType === Node.TEXT_NODE
          //       ? currentNode.parentElement.closest("code")
          //       : currentNode.closest("code");
          //   console.log(`ENT:|${codeBlock.innerHTML}|`);
          //   console.log(`ENT TC:|${codeBlock.textContent}|`);

          e.preventDefault();

          console.log("pre ulla irunthu");
          if (selection.isCollapsed) {
            let currentNode = selection.anchorNode;
            let codeBlock =
              currentNode.nodeType === Node.TEXT_NODE
                ? currentNode.parentElement.closest("code")
                : currentNode.closest("code");
            const preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(codeBlock);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            const tempDiv = document.createElement("div");
            tempDiv.appendChild(preCaretRange.cloneContents());
            let htmlBeforeCursor = tempDiv.innerHTML;
            // Clone the range again to get the content after the cursor
            const postCaretRange = range.cloneRange();
            postCaretRange.selectNodeContents(codeBlock);
            postCaretRange.setStart(range.endContainer, range.endOffset);
            const tempDivAfter = document.createElement("div");
            tempDivAfter.appendChild(postCaretRange.cloneContents());
            let htmlAfterCursor = tempDivAfter.innerHTML;
            console.log(`before:${htmlBeforeCursor}`);
            console.log(`after:${htmlAfterCursor}`);
            if (htmlAfterCursor === "") {
              htmlAfterCursor = htmlAfterCursor + "\n";
            }
            if (htmlAfterCursor.startsWith("\n")) {
              // do nothing
            }
            // let newLines = "\n";
            // if (isCaretAtStartOf(codeBlock)) {
            //   newLines = "\n\n";
            // }
            codeBlock.innerHTML =
              htmlBeforeCursor +
              "\n" +
              '<span id="cursor"></span>' +
              htmlAfterCursor;
            const cursorPlaceholder = document.getElementById("cursor");
            const newRange = document.createRange();
            const sel = window.getSelection();
            newRange.setStart(cursorPlaceholder, 0);
            newRange.collapse(true);
            sel.removeAllRanges();
            sel.addRange(newRange);
            cursorPlaceholder.remove();
            updateHTMLPreview();
            return;
          }
        }

        if (
          e.target.tagName === "BUTTON" &&
          e.target.classList.contains("cancel-button")
        ) {
          // Handle Enter key press on Cancel button
          e.preventDefault(); // Prevent form submission
          e.target.click(); // Trigger the click event handler
          updateHTMLPreview();
          return;
        }

        // =========COMMAND MATCH LOGIC=====================================================================================================================

        const commandMatch = currentEditable.innerHTML.match(
          /^\/(h1|h2|p|ul|ol|cb|i)\s*(.*)$/
        );

        if (commandMatch) {
          e.preventDefault();
          console.log("commad match");
          const preCaretRange = range.cloneRange();

          // Select the entire content of the element and set the end to the cursor position
          preCaretRange.selectNodeContents(currentEditable);
          preCaretRange.setEnd(range.endContainer, range.endOffset);

          // Create a temporary container to hold the cloned contents
          const tempDiv = document.createElement("div");
          tempDiv.appendChild(preCaretRange.cloneContents());
          let htmlBeforeCursor = tempDiv.innerHTML;

          // Clone the range again to get the content after the cursor
          const postCaretRange = range.cloneRange();
          postCaretRange.selectNodeContents(currentEditable);
          postCaretRange.setStart(range.endContainer, range.endOffset);

          // Temporary container for the content after the cursor
          const tempDivAfter = document.createElement("div");
          tempDivAfter.appendChild(postCaretRange.cloneContents());
          let htmlAfterCursor = tempDivAfter.innerHTML;

          let commandMatchBefore = htmlBeforeCursor.match(
            /^\/(h1|h2|p|ul|ol|cb|i)\s*(.*)$/
          );
          //   let commandMatchAfter = htmlAfterCursor.match(/^\/(h1|h2|p)\s*(.*)$/);

          let textWithCursor;

          if (commandMatchBefore) {
            textWithCursor =
              commandMatchBefore[2] +
              '<span id="cursor"></span>' +
              htmlAfterCursor;
          }
          //   else if (commandMatchAfter) {
          //     console.log("After match");
          //     // cursorfirst
          //     console.log(`${commandMatchAfter[2]}`);
          //   }
          else {
            // console.log("Middle match or After match");

            textWithCursor =
              '<span id="cursor">cursor</span>' + commandMatch[2];
          }

          let newElement;
          const tagName = commandMatch[1];

          if (tagName === "ul" || tagName === "ol") {
            // newElement = document.createElement(tagName);
            // newElement.setAttribute("contenteditable", "true");
            // newElement.className = "editable";
            // newElement.innerHTML = `<li contenteditable="true" class="editable">${textWithCursor}</li>`;

            newElement = document.createElement(tagName);
            let newList = document.createElement("li");
            newElement.setAttribute("contenteditable", "true");
            newList.setAttribute("contenteditable", "true");
            newElement.className = "editable";
            newList.className = "editable";
            newList.innerHTML = textWithCursor;
            newElement.appendChild(newList);
          } else if (tagName === "h1" || tagName === "h2" || tagName === "p") {
            newElement = document.createElement(tagName);
            newElement.setAttribute("contenteditable", "true");
            newElement.className = "editable";
            newElement.innerHTML = textWithCursor;
          } else if (tagName === "cb") {
            newElement = document.createElement("pre");
            let newCodeBlock = document.createElement("code");
            newElement.setAttribute("contenteditable", "true");
            newCodeBlock.setAttribute("contenteditable", "true");
            newElement.className = "editable";
            newCodeBlock.className = "editable";
            newCodeBlock.innerHTML = textWithCursor;
            newElement.appendChild(newCodeBlock);
          } else if (tagName === "i") {
            newElement = document.createElement("div");
            newElement.className = "image-form";
            // newElement.setAttribute("contenteditable", "false");
            let uuid = getUnixTimestampInSeconds();
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
          }
          //   HIGHLIGHTME
          //   <div class="aligned-content">
          //           <label class="fixed-width-label"></label>
          //           <p>Image does not exist</p>
          //           </div>
          updateHTMLPreview();
          currentEditable.parentNode.replaceChild(newElement, currentEditable);
          currentEditable = newElement;
          if (tagName !== "i") {
            newElement.focus();
            const cursorPlaceholder = document.getElementById("cursor");

            const newRange = document.createRange();

            const sel = window.getSelection();

            newRange.setStart(cursorPlaceholder, 0);
            newRange.collapse(true);

            sel.removeAllRanges();
            sel.addRange(newRange);
            cursorPlaceholder.remove();
          }
          if (tagName === "i") {
            const imgURLInput = document.querySelector(`#imgURL${guuid}`);
            imgURLInput.focus();
          }

          updateHTMLPreview();
          return;
        }

        if (
          !commandMatch &&
          currentEditable.tagName.toLowerCase() !== "pre" &&
          currentEditable.className !== "image-form"
        ) {
          e.preventDefault();
          console.log("enterbehaviour");

          // Handle the standard Enter key behavior
          console.log("std enter key behaviour");
          let tagName = currentEditable.tagName.toLowerCase();
          let htmlBeforeCursor;
          let htmlAfterCursor;

          const preCaretRange = range.cloneRange();

          // Select the entire content of the element and set the end to the cursor position
          preCaretRange.selectNodeContents(currentEditable);
          preCaretRange.setEnd(range.endContainer, range.endOffset);

          // Create a temporary container to hold the cloned contents
          const tempDiv = document.createElement("div");
          tempDiv.appendChild(preCaretRange.cloneContents());
          htmlBeforeCursor = tempDiv.innerHTML;
          console.log(htmlBeforeCursor);

          // Clone the range again to get the content after the cursor
          const postCaretRange = range.cloneRange();
          postCaretRange.selectNodeContents(currentEditable);
          postCaretRange.setStart(range.endContainer, range.endOffset);

          // Temporary container for the content after the cursor
          const tempDivAfter = document.createElement("div");
          tempDivAfter.appendChild(postCaretRange.cloneContents());
          htmlAfterCursor = tempDivAfter.innerHTML;
          console.log(htmlAfterCursor);

          // Check if the text after the cursor is empty
          if (!htmlAfterCursor) {
            tagName = "p"; // Force the tag to be <p> when htmlAfterCursor is empty
          }

          const newElement = document.createElement(tagName);
          newElement.setAttribute("contenteditable", "true");
          newElement.className = "editable";

          if (htmlAfterCursor) {
            currentEditable.innerHTML = htmlBeforeCursor;
            newElement.innerHTML = htmlAfterCursor;
          }

          currentEditable.parentNode.insertBefore(
            newElement,
            currentEditable.nextSibling
          );

          // Restore the cursor position
          const newRange = document.createRange();
          newRange.setStart(newElement, 0);
          newRange.collapse(true);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(newRange);

          newElement.focus();
          currentEditable = newElement;
          updateHTMLPreview();
        }

        // ======BACKSPACE LOGIC======================================================================================================================
      } else if (e.key === "Backspace") {
        console.log(`bkp ${currentEditable.tagName}`);

        if (
          currentEditable.tagName.toLowerCase() === "div" &&
          currentEditable.classList.contains("captionedImageContainer")
        ) {
          e.preventDefault();
          console.log(currentEditable.nextElementSibling);
          if (
            currentEditable.nextElementSibling &&
            (currentEditable.nextElementSibling.tagName.toLowerCase() === "p" ||
              currentEditable.nextElementSibling.tagName.toLowerCase() ===
                "h1" ||
              currentEditable.nextElementSibling.tagName.toLowerCase() === "h2")
          ) {
            currentEditable.remove();
            currentEditable = nextElementSibling;
            currentEditable.focus();
          } else if (
            currentEditable.previousElementSibling &&
            (currentEditable.previousElementSibling.tagName.toLowerCase() ===
              "p" ||
              currentEditable.previousElementSibling.tagName.toLowerCase() ===
                "h1" ||
              currentEditable.previousElementSibling.tagName.toLowerCase() ===
                "h2")
          ) {
            currentEditable.remove();
            currentEditable = previousElementSibling;
            currentEditable.focus();
          } else {
            console.log("inside capiC");
            createSomething(currentEditable, "p", "self");
          }

          updateHTMLPreview();
          return;
        }

        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        cursorPosition = {
          offset: range.startOffset,
          node: range.startContainer,
        };

        if (currentEditable.tagName.toLowerCase() === "figcaption") {
          if (selection.isCollapsed) {
            let currentNode = selection.anchorNode;
            let figcaption =
              currentNode.nodeType === Node.TEXT_NODE
                ? currentNode.parentElement.closest("figcaption")
                : currentNode.closest("figcaption");
            const preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(figcaption);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            const tempDiv = document.createElement("div");
            tempDiv.appendChild(preCaretRange.cloneContents());
            let textBeforeCursor = tempDiv.textContent;
            console.log(`tbc:|${textBeforeCursor.replace(/\s+/g, "")}|`);

            if (textBeforeCursor.replace(/\s+/g, "") === "") {
              console.log("start of figcaption");
              e.preventDefault();
              let imageContainer = currentEditable.closest(
                ".captionedImageContainer"
              );
              currentEditable.remove();
              currentEditable = imageContainer;
              currentEditable.focus();
              updateHTMLPreview();
              return;
            }

            if (textBeforeCursor.replace(/\s+/g, "").length === 1) {
              e.preventDefault();
              console.log("tb4 ZERO");
              console.log(currentEditable.tagName);
              currentEditable.innerHTML =
                '<span class = "figcaption-placeholder-span" contenteditable="false">Type caption for image (optional)</span>';
              updateHTMLPreview();
              return;
            }
          }

          updateHTMLPreview();
          return;
        }

        if (currentEditable.tagName.toLowerCase() === "pre") {
          let currentNode = selection.anchorNode;
          let codeBlock =
            currentNode.nodeType === Node.TEXT_NODE
              ? currentNode.parentElement.closest("code")
              : currentNode.closest("code");

          if (isCaretAtStartOf(codeBlock)) {
            if (codeBlock.textContent === "") {
              createSomething(currentEditable, "p", "self");
            }
            if (codeBlock.textContent !== "") {
              createSomething(currentEditable, "p", "above");
            }
          }
        }

        if (
          currentEditable.tagName.toLowerCase() === "ul" ||
          currentEditable.tagName.toLowerCase() === "ol"
        ) {
          console.log("bkp ul confirmed");

          if (selection.isCollapsed) {
            let currentNode = selection.anchorNode;
            let li =
              currentNode.nodeType === Node.TEXT_NODE
                ? currentNode.parentElement.closest("li")
                : currentNode.closest("li");
            console.log(`LI ${li.innerHTML}`);
            currLiHTML = li.innerHTML;
            console.log(`currLiHTML ${currLiHTML}`);
            if (li.previousElementSibling === null) {
              console.log("start of li");
              currLiHTML = li.innerHTML;
              console.log(currLiHTML);
              console.log(li.previousElementSibling);

              if (isCaretAtStartOf(li)) {
                // console.log(`currinnercunt:${currentEditable.innerContent}`);
                if (otherThanFirstLiAreEmpty(currentEditable) === true) {
                  createSomething(
                    currentEditable,
                    "p",
                    "self",
                    (html4CurrEditable = undefined),
                    currLiHTML
                  );
                  updateHTMLPreview();
                }
                if (otherThanFirstLiAreEmpty(currentEditable) === false) {
                  createSomething(
                    currentEditable,
                    "p",
                    "above",
                    (html4CurrEditable = undefined),
                    currLiHTML
                  );
                  li.remove();
                  updateHTMLPreview();
                }
              }

              if (
                !isCaretAtStartOf(li) &&
                li.textContent.replace(/\u200B/g, "") === ""
              ) {
                if (otherThanFirstLiAreEmpty(currentEditable) === true) {
                  createSomething(
                    currentEditable,
                    "p",
                    "self",
                    (html4CurrEditable = undefined),
                    currLiHTML
                  );
                  updateHTMLPreview();
                }
                if (otherThanFirstLiAreEmpty(currentEditable) === false) {
                  createSomething(
                    currentEditable,
                    "p",
                    "above",
                    (html4CurrEditable = undefined),
                    currLiHTML
                  );
                  li.remove();
                  updateHTMLPreview();
                }
              }

              //   currentEditable.remove();
              updateHTMLPreview();
              return;
            }

            if (li.previousElementSibling !== null) {
              if (isCaretAtStartOf(li)) {
                e.preventDefault();
                console.log(`inside normal`);
                let htmlAfterCursor = cleanZeroWidthWhitespace(li.innerHTML);
                let htmlBeforeCursor = cleanZeroWidthWhitespace(
                  li.previousElementSibling.innerHTML
                );

                console.log(htmlAfterCursor);
                console.log(htmlBeforeCursor);

                li.previousElementSibling.innerHTML =
                  htmlBeforeCursor +
                  '<span id="cursor"></span>' +
                  htmlAfterCursor;

                li.previousElementSibling.focus();

                const cursorPlaceholder = document.getElementById("cursor");

                const newRange = document.createRange();

                const sel = window.getSelection();

                newRange.setStart(cursorPlaceholder, 0);
                newRange.collapse(true);

                sel.removeAllRanges();
                sel.addRange(newRange);
                console.log("here");
                cursorPlaceholder.remove();
                console.log("here");
                li.remove();
                updateHTMLPreview();
                return;
              }
              if (
                !isCaretAtStartOf(li) &&
                li.textContent.replace(/\u200B/g, "") === ""
              ) {
                console.log("that extra space velaya kaamikithu");
                e.preventDefault();
                let htmlAfterCursor = cleanZeroWidthWhitespace(li.innerHTML);
                let htmlBeforeCursor = cleanZeroWidthWhitespace(
                  i.previousElementSibling.innerHTML
                );

                li.previousElementSibling.innerHTML =
                  htmlBeforeCursor +
                  '<span id="cursor"></span>' +
                  htmlAfterCursor;

                li.previousElementSibling.focus();

                const cursorPlaceholder = document.getElementById("cursor");

                const newRange = document.createRange();

                const sel = window.getSelection();

                newRange.setStart(cursorPlaceholder, 0);
                newRange.collapse(true);

                sel.removeAllRanges();
                sel.addRange(newRange);
                console.log("here");
                cursorPlaceholder.remove();
                console.log("here");
                li.remove();
                updateHTMLPreview();
                return;
              }
            }
          }
        }

        if (
          currentEditable.tagName.toLowerCase() === "h1" ||
          currentEditable.tagName.toLowerCase() === "h2" ||
          currentEditable.tagName.toLowerCase() === "p"
        ) {
          if (selection.isCollapsed) {
            if (isCaretAtStartOf(currentEditable)) {
              if (currentEditable.previousElementSibling) {
                console.log("bkp prev sib is present");
                let currentEditableInnerHTML = currentEditable.innerHTML;
                let previousSibling = currentEditable.previousElementSibling;
                console.log(`bkp ${previousSibling.tagName.toLowerCase()}`);

                if (
                  previousSibling.tagName.toLowerCase() === "h1" ||
                  previousSibling.tagName.toLowerCase() === "h2" ||
                  previousSibling.tagName.toLowerCase() === "p"
                ) {
                  e.preventDefault();
                  console.log("bkp prev sib is normal");
                  let targetPreviousElement = previousSibling;
                  let targetInnerHTML =
                    targetPreviousElement.innerHTML +
                    '<span id="cursor"></span>' +
                    currentEditableInnerHTML;

                  targetPreviousElement.innerHTML = targetInnerHTML;
                  currentEditable.remove();
                  currentEditable = targetPreviousElement;

                  targetPreviousElement.focus();

                  const cursorPlaceholder = document.getElementById("cursor");

                  const newRange = document.createRange();

                  const sel = window.getSelection();

                  newRange.setStart(cursorPlaceholder, 0);
                  newRange.collapse(true);

                  sel.removeAllRanges();
                  sel.addRange(newRange);
                  console.log("here");
                  cursorPlaceholder.remove();
                  console.log("here");
                  updateHTMLPreview();
                  return;
                }

                if (
                  previousSibling.tagName.toLowerCase() === "ul" ||
                  previousSibling.tagName.toLowerCase() === "ol"
                ) {
                  e.preventDefault();
                  let targetInnerHTML =
                    '<span id="cursor"></span>' + currentEditableInnerHTML;
                  let elementAboveTarget = previousSibling.lastChild;

                  let newElement = document.createElement("li");
                  newElement.setAttribute("contenteditable", "true");
                  newElement.className = "editable";

                  newElement.innerHTML = targetInnerHTML;

                  elementAboveTarget.parentNode.insertBefore(
                    newElement,
                    elementAboveTarget.nextSibling
                  );

                  currentEditable.remove();
                  currentEditable = newElement;

                  newElement.focus();

                  const cursorPlaceholder = document.getElementById("cursor");

                  const newRange = document.createRange();

                  const sel = window.getSelection();

                  newRange.setStart(cursorPlaceholder, 0);
                  newRange.collapse(true);

                  sel.removeAllRanges();
                  sel.addRange(newRange);
                  console.log("here");
                  cursorPlaceholder.remove();
                  console.log("here");
                  updateHTMLPreview();
                  return;
                }
                if (previousSibling.tagName.toLowerCase() === "pre") {
                  e.preventDefault();

                  let targetPreviousElement = previousSibling.firstChild;

                  let targetInnerHTML =
                    targetPreviousElement.innerHTML +
                    '<span id="cursor"></span>' +
                    currentEditableInnerHTML;
                  targetPreviousElement.innerHTML = targetInnerHTML;
                  currentEditable.remove();
                  currentEditable = previousSibling;

                  previousSibling.focus();

                  const cursorPlaceholder = document.getElementById("cursor");

                  const newRange = document.createRange();

                  const sel = window.getSelection();

                  newRange.setStart(cursorPlaceholder, 0);
                  newRange.collapse(true);

                  sel.removeAllRanges();
                  sel.addRange(newRange);
                  console.log("here");
                  cursorPlaceholder.remove();
                  console.log("here");
                  updateHTMLPreview();
                  return;
                }
              } else if (currentEditable.previousElementSibling === null) {
                //Do Nothing
              }
            }
          }
        }
      }
      if (e.key === "Enter" && e.shiftKey) {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        cursorPosition = {
          offset: range.startOffset,
          node: range.startContainer,
        };

        //   Prevent Shift+Enter behavior if the current tag is h1 or h2
        const tagName = currentEditable.tagName.toLowerCase();
        console.log(currentEditable);
        if (tagName === "pre") {
          e.preventDefault();
          createSomething(currentEditable, "p", "below");
          console.log("inside pre");
          return; // Do nothing if the current tag is h1 or h2
        }

        updateHTMLPreview();
      }
      if (e.key === "Delete") {
        console.log(`delete ${currentEditable.tagName}`);

        if (
          currentEditable.tagName.toLowerCase() === "div" &&
          currentEditable.classList.contains("captionedImageContainer")
        ) {
          e.preventDefault();
          if (currentEditable.nextElementSibling) {
            let nextElementSibling = currentEditable.nextElementSibling;
            let nextElementSiblingTag =
              currentEditable.nextElementSibling.tagName.toLowerCase();
            if (
              nextElementSiblingTag === "p" ||
              nextElementSiblingTag === "h1" ||
              nextElementSiblingTag === "h2"
            ) {
              currentEditable.remove();
              currentEditable = nextElementSibling;
              currentEditable.focus();
            }
          } else if (currentEditable.previousElementSibling) {
            let previousElementSibling = currentEditable.previousElementSibling;
            let previousElementSiblingTag =
              currentEditable.previousElementSibling.tagName.toLowerCase();
            if (
              previousElementSiblingTag === "p" ||
              previousElementSiblingTag === "h1" ||
              previousElementSiblingTag === "h2"
            ) {
              currentEditable.remove();
              currentEditable = previousElementSibling;
              currentEditable.focus();
            }
          } else {
            createSomething(currentEditable, "p", "self");
          }

          updateHTMLPreview();
          return;
        }
      }
    }
  });

// Add an event listener for the paste event to ensure plain text is pasted
// document
//   .getElementById("editable-container")
//   .addEventListener("paste", function (e) {
//     if (currentEditable) {
//       e.preventDefault();

//       // Get the text from the clipboard
//       const text = (e.clipboardData || window.clipboardData).getData("text");

//       // Insert the text at the cursor position
//       document.execCommand("insertText", false, text);
//       updateHTMLPreview();
//     }
//   });

// document.querySelector("pre code")
// .getElementById("editable-container")
// document
document
  .querySelector("#editable-container")
  .addEventListener("paste", function (e) {
    // Check if the pasted content is in a <pre> or <code> element
    const target = e.target;
    if (target.tagName === "CODE" || target.tagName === "PRE") {
      e.preventDefault(); // Prevent the default paste action

      // Get the pasted text as plain text
      let pastedText = (e.clipboardData || window.clipboardData).getData(
        "text"
      );

      // Insert the pasted text as plain text without wrapping each line in separate <code> tags
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      range.deleteContents(); // Remove the current selection

      // Create a text node with the pasted content
      const textNode = document.createTextNode(pastedText);

      // Insert the text node at the cursor position
      range.insertNode(textNode);

      // Move the cursor to the end of the pasted content
      range.setStartAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);

      updateHTMLPreview(); // Call the function to update the HTML preview
    }
  });

function updateHTMLPreview() {
  const htmlContent = document.getElementById("editable-container").innerHTML;
  document.getElementById("html-content").textContent = htmlContent;
}
