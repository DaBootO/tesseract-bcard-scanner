// Import Tesseract if using npm
// const Tesseract = require('tesseract.js');

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
            extractTextFromImage(canvas, ctx);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function extractTextFromImage(canvas, ctx) {
    const rec = Tesseract.recognize(canvas, 'eng', {
        logger: ({ status, progress }) => {
            console.log(`Status: ${status}, Progress: ${Math.round(progress * 100)}%`);
        }
        })
        .then(({ data: { lines } }) => {
            console.log(data);
            lines.forEach(line => {
                const { bbox, text } = line;
                console.log(line);
                const { x0, y0, x1, y1 } = bbox;
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 2;
                ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
            });
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
