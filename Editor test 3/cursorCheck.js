function doSomething(element) {
  console.log(element.innerHTML);
  setCaretPosition(element, "start");
  console.log(isCaretAtStart(element));
  console.log(isCaretAtEnd(element));

  setCaretPosition(element, "end");
  console.log(isCaretAtEnd(element));
  console.log(isCaretAtStart(element));
  updateHTMLPreview();
}

setTimeout(function () {
  let egElement = document.getElementById("eg");
  console.log(egElement.innerHTML);
  doSomething(egElement);
}, 5000);

//======================================================================================================================
setTimeout(function () {
  console.log("first position");
  setCaretPosition(document.getElementById("hh"), "end");
}, 5000);

setTimeout(function () {
  console.log("second position");
  setCaretPosition(document.getElementById("pp"), "end");
}, 7000);


// ========================================================

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    .highlight {
      color: red;
    }
    #special {
      font-weight: bold;
    }
    blockquote p {
      font-style: italic;
    }
  </style>
</head>
<body>
  <blockquote>
    <p id="special" class="highlight">This is a special paragraph.</p>
  </blockquote>
  
  <script>
    const element = document.getElementById('special');

    console.log(element.matches('.highlight')); // true
    console.log(element.matches('#special')); // true
    console.log(element.matches('blockquote p')); // true
    console.log(element.matches('p')); // true
    console.log(element.matches('blockquote .highlight')); // true
    console.log(element.matches('blockquote p:not(.highlight)')); // false
  </script>
</body>
</html>
