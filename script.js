function showScreen(screenId) {
    document.querySelectorAll("div").forEach(div => div.style.display = "none");
    document.getElementById(screenId).style.display = "block";
}

let photoCount, capturedPhotos = [];

function startPhotoBooth(count) {
    photoCount = count;
    capturedPhotos = [];
    showScreen('photoCapture');
    startCamera();
}

function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            document.getElementById('camera').srcObject = stream;
        })
        .catch(error => console.error("Camera access denied", error));
}

function startPhotoSequence(index = 0) {
    if (index >= photoCount) {
        showScreen('outputOptions');
        displayPhotos();
        return;
    }

    const countdownText = document.getElementById('countdownText');
    countdownText.innerText = "Get ready...";

    setTimeout(() => {
        countdownText.innerText = "3...";
        setTimeout(() => {
            countdownText.innerText = "2...";
            setTimeout(() => {
                countdownText.innerText = "1...";
                setTimeout(() => {
                    takePhoto(index);
                    setTimeout(() => startPhotoSequence(index + 1), 3000);
                }, 1000);
            }, 1000);
        }, 1000);
    }, 1000);
}

function takePhoto(index) {
    const video = document.getElementById('camera');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    capturedPhotos.push(canvas.toDataURL("image/png"));
}

function displayPhotos() {
    const canvas = document.getElementById('photoCanvas');
    const context = canvas.getContext('2d');

    const img = new Image();
    img.src = capturedPhotos[0];
    img.onload = () => {
        const aspectRatio = img.width / img.height;
        const photoWidth = 400;
        const photoHeight = photoWidth / aspectRatio;
        const spacing = 10;
        const borderSize = 5;
        const textHeight = 50;

        canvas.width = photoWidth + borderSize * 2;
        canvas.height = photoCount * (photoHeight + spacing) - spacing + borderSize * 2 + textHeight;

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);

        capturedPhotos.forEach((photo, index) => {
            const img = new Image();
            img.src = photo;
            img.onload = () => {
                const x = borderSize;
                const y = borderSize + index * (photoHeight + spacing);
                
                context.fillStyle = "#ffffff";
                context.fillRect(x - borderSize, y - borderSize, photoWidth + borderSize * 2, photoHeight + borderSize * 2);
                context.drawImage(img, x, y, photoWidth, photoHeight);
            };
        });
    };
}

function applyText() {
    const canvas = document.getElementById('photoCanvas');
    const context = canvas.getContext('2d');
    const text = document.getElementById('caption').value;

    context.fillStyle = "#000000";
    context.font = "24px Arial";
    context.textAlign = "center";
    context.fillText(text, canvas.width / 2, canvas.height - 20);
}

function returnToStart() {
    photoCount = 0;
    capturedPhotos = [];

    const video = document.getElementById('camera');
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
    }

    showScreen('welcomeScreen');
}

function downloadPhoto() {
    const canvas = document.getElementById('photoCanvas');
    const link = document.createElement('a');
    link.download = "photostrip.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
}

function printPhoto() {
    const canvas = document.getElementById('photoCanvas');
    const newWindow = window.open();
    newWindow.document.write('<img src="' + canvas.toDataURL("image/png") + '">');
    newWindow.print();
}