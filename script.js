// Import Tesseract if using npm
const Tesseract = require('tesseract.js');

document.getElementById('fileInput').addEventListener('change', handleFileSelect);

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            extractTextFromImage(canvas);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function extractTextFromImage(canvas) {
    Tesseract.recognize(canvas, 'eng')
        .then(({ data: { text } }) => {
            displayExtractedText(text);
        })
        .catch(error => console.error(error));
}

function displayExtractedText(text) {
    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = text;
    makeTextDraggable(outputDiv);
}

function makeTextDraggable(element) {
    const range = document.createRange();
    range.selectNodeContents(element);
    const fragment = range.extractContents();

    const nodes = fragment.childNodes;
    nodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            const span = document.createElement('span');
            span.textContent = node.textContent;
            span.draggable = true;
            span.addEventListener('dragstart', handleDragStart);
            element.appendChild(span);
        } else {
            element.appendChild(node);
        }
    });
}

function handleDragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.textContent);
}

document.querySelectorAll('input[type="text"]').forEach(input => {
    input.addEventListener('dragover', handleDragOver);
    input.addEventListener('drop', handleDrop);
});

function handleDragOver(event) {
    event.preventDefault();
}

function handleDrop(event) {
    event.preventDefault();
    const text = event.dataTransfer.getData('text/plain');
    event.target.value = text;
}
