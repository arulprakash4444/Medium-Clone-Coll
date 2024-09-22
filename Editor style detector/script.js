document.addEventListener("selectionchange", function () {
  const selection = window.getSelection();
  const selectionBox = document.getElementById("selection-box");
  const htmlBox = document.getElementById("html-box");
  const styleBox = document.getElementById("style-box");
  const charStyleBox = document.getElementById("char-style-box");

  // Check if the selection length is more than one character
  if (selection.toString().length > 1) {
    selectionBox.textContent = `"${selection.toString()}"`;
    selectionBox.style.display = "block";
  } else {
    selectionBox.textContent = `${selection.toString()}`;
  }

  // Update the HTML box with the current innerHTML of the contenteditable div
  htmlBox.textContent = document.getElementById("container").innerHTML;

  // Handle character style analysis
  if (!selection.isCollapsed) {
    // If there's a selection
    const range = selection.getRangeAt(0);
    const fragment = range.cloneContents();

    // Clear charStyleBox content
    charStyleBox.textContent = "";

    // Traverse through the selected fragment
    fragment.childNodes.forEach(function (node) {
      processNode(node, charStyleBox);
      //   console.log(node.textContent);
    });
  } else {
    charStyleBox.textContent = "";
  }
});

function processNode(node, charStyleBox) {
  if (node.nodeType === 3) {
    // Text node
    const textContent = node.textContent;
    console.log(`textNode:${textContent}>>styles:${getStyleForNode(node)}`);

    // Loop through each character and display style
    // for (let i = 0; i < textContent.length; i++) {
    //   const char = textContent[i];
    //   const style = getStyleForNode(node);
    //   charStyleBox.textContent += `${char}: ${style}\n`;
    // }
  } else if (node.nodeType === 1) {
    // Element node
    // console.log(
    //   `elementNode:${node.textContent} >> styles:${getStyleForNode(node)}`
    // );
    node.childNodes.forEach((childNode) =>
      processNode(childNode, charStyleBox)
    );
  }
}

function getStyleForNode(node) {
  let styles = [];

  let currentElement = node.parentElement;
  while (
    currentElement &&
    currentElement !== document.getElementsByClassName("editable")
  ) {
    if (currentElement.tagName === "STRONG") {
      styles.push("bold");
    }
    if (currentElement.tagName === "EM") {
      styles.push("italic");
    }
    if (currentElement.tagName === "A") {
      styles.push("anchor");
    }
    currentElement = currentElement.parentElement;
  }

  return styles.length > 0 ? styles.join(" | ") : "no style(s)";
}

document.addEventListener("keydown", function (event) {
  if ((event.ctrlKey || event.metaKey) && event.key === "b") {
    event.preventDefault();

    const selection = window.getSelection();
    if (!selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const selectedText = range.extractContents();

      const strongElement = document.createElement("strong");
      strongElement.appendChild(selectedText);

      range.insertNode(strongElement);
    }

    // Update the HTML box after applying the bold tag
    document.getElementById("html-box").textContent =
      document.getElementById("editable-content").innerHTML;
  }
});

// FROM URL CODE====================================================================================================================

const editableDiv = document.getElementById("container");
const modalOverlay = document.getElementById("modalOverlay");
const urlModal = document.getElementById("urlModal");
const urlInput = document.getElementById("urlInput");

let selectedTextRange = null;
let savedSelection = null; // To store the selection

editableDiv.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "u") {
    e.preventDefault();
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      selectedTextRange = selection.getRangeAt(0);
      let selectedText = selectedTextRange.toString();
      if (selectedText.length > 0) {
        urlInput.setAttribute("placeholder", `Enter URL for “${selectedText}”`);
        saveSelection(); // Save the current selection
        showModal();
      }
    }
  }
});

urlInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const url = urlInput.value;
    if (url && selectedTextRange) {
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.target = "_blank"; // Optional: to open in a new tab
      selectedTextRange.surroundContents(anchor);
    }
    closeModal();
  }
});

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    closeModal();
  }
});

function showModal() {
  document.body.classList.add("modal-active");
  modalOverlay.style.display = "flex";
  urlInput.focus();
}

function closeModal() {
  document.body.classList.remove("modal-active");
  modalOverlay.style.display = "none";
  urlInput.value = "";
  restoreSelection(); // Restore the saved selection
  selectedTextRange = null;
}

function saveSelection() {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    savedSelection = selection.getRangeAt(0);
  }
}

function restoreSelection() {
  if (savedSelection) {
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(savedSelection);
  }
}
