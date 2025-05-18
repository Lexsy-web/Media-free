const imageUpload = document.getElementById('imageUpload');
const uploadButton = document.getElementById('uploadButton');
const imageGrid = document.getElementById('imageGrid');
const commentSection = document.getElementById('comment-section');
const commentInput = document.getElementById('commentInput');
const postCommentButton = document.getElementById('postCommentButton');
const commentsContainer = document.getElementById('commentsContainer');

let currentImageFilename = null;
let images = [];

// Fetch images from backend and display them
function fetchImages() {
    fetch('http://localhost:3000/api/images')
        .then(res => res.json())
        .then(data => {
            images = data;
            imageGrid.innerHTML = '';
            images.forEach(addImageToGrid);
        });
}

function addImageToGrid(image) {
    const imageItem = document.createElement('div');
    imageItem.classList.add('image-item');
    imageItem.innerHTML = `
        <img src="http://localhost:3000/uploads/${image.filename}" alt="Uploaded Image">
        <button class="download-btn">Download</button>
        <button class="delete-btn">Delete</button>
        <button class="comment-btn">Comment</button>
    `;
    // Delete button
    imageItem.querySelector('.delete-btn').addEventListener('click', () => {
        fetch(`http://localhost:3000/api/images/${image.filename}`, { method: 'DELETE' })
            .then(() => fetchImages());
    });
    // Download button
    imageItem.querySelector('.download-btn').addEventListener('click', () => {
        const a = document.createElement('a');
        a.href = `http://localhost:3000/uploads/${image.filename}`;
        a.download = 'image.png';
        a.click();
    });
    // Comment button
    imageItem.querySelector('.comment-btn').addEventListener('click', () => {
        showComments(image);
    });
    imageGrid.appendChild(imageItem);
}

// Show comments section
function showComments(image) {
    currentImageFilename = image.filename;
    commentSection.style.display = 'block';
    commentsContainer.innerHTML = '';
    (image.comments || []).forEach(comment => {
        const commentElement = document.createElement('p');
        commentElement.textContent = comment;
        commentsContainer.appendChild(commentElement);
    });
}

// Post comment
postCommentButton.addEventListener('click', () => {
    const commentText = commentInput.value.trim();
    if (commentText && currentImageFilename) {
        fetch(`http://localhost:3000/api/images/${currentImageFilename}/comment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ comment: commentText })
        }).then(() => {
            commentInput.value = '';
            fetchImages();
        });
    }
});

// Upload image
uploadButton.addEventListener('click', () => {
    const file = imageUpload.files[0];
    if (!file) {
        alert('Please select an image to upload.');
        return;
    }
    const formData = new FormData();
    formData.append('image', file);
    fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData
    }).then(() => {
        imageUpload.value = '';
        fetchImages();
    });
});

// Poll images every 5 seconds for real-time update
setInterval(fetchImages, 5000);
document.addEventListener('DOMContentLoaded', fetchImages);
