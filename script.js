// DOM Elements
const imageUpload = document.getElementById('imageUpload');
const uploadButton = document.getElementById('uploadButton');
const imageGrid = document.getElementById('imageGrid');
const commentSection = document.getElementById('comment-section');
const commentInput = document.getElementById('commentInput');
const postCommentButton = document.getElementById('postCommentButton');
const commentsContainer = document.getElementById('commentsContainer');

let currentImageId;

// Store images and comments in local storage
let images = JSON.parse(localStorage.getItem('images')) || [];

// Load images from local storage on page load
document.addEventListener('DOMContentLoaded', loadImagesFromLocalStorage);

// Welcome message functionality
document.addEventListener('DOMContentLoaded', function() {
    const username = localStorage.getItem('username');
    if (username) {
        document.getElementById('welcome-message').innerText = `Welcome ${username}`;
    } else {
        document.getElementById('welcome-message').innerText = 'Welcome Guest';
    }
});

// Upload and Display Image
uploadButton.addEventListener('click', () => {
    const file = imageUpload.files[0];
    if (!file) {
        alert('Please select an image to upload.');
        return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const imageData = reader.result;
        addImageToGrid(imageData);
        saveImageToLocalStorage(imageData);
    };
    // Clear the file input
    imageUpload.value = '';
});

// Add Image to the Grid
function addImageToGrid(imageData) {
    const imageItem = document.createElement('div');
    imageItem.classList.add('image-item');
    imageItem.innerHTML = `
        <img src="${imageData}" alt="Uploaded Image">
        <button class="download-btn">Download</button>
        <button class="delete-btn">Delete</button>
        <button class="comment-btn">Comment</button>
    `;
    // Add functionality to delete button
    imageItem.querySelector('.delete-btn').addEventListener('click', () => {
        imageItem.remove();
        deleteImageFromLocalStorage(imageData);
    });
    // Add functionality to download button
    imageItem.querySelector('.download-btn').addEventListener('click', () => {
        const a = document.createElement('a');
        a.href = imageData;
        a.download = 'image.png';
        a.click();
    });
    // Add functionality to comment button
    imageItem.querySelector('.comment-btn').addEventListener('click', () => {
        showComments(imageData);
    });
    imageGrid.appendChild(imageItem);
}

// Show comments section
function showComments(imageData) {
    currentImageId = imageData;
    commentSection.style.display = 'block';
    commentsContainer.innerHTML = '';
    const imageComments = getImageComments(imageData);
    imageComments.forEach(comment => {
        const commentElement = document.createElement('p');
        commentElement.textContent = comment;
        commentsContainer.appendChild(commentElement);
    });
}

// Post comment functionality
postCommentButton.addEventListener('click', () => {
    const commentText = commentInput.value.trim();
    if (commentText) {
        addCommentToImage(currentImageId, commentText);
        const commentElement = document.createElement('p');
        commentElement.textContent = commentText;
        commentsContainer.appendChild(commentElement);
        commentInput.value = '';
    }
});

// Save Image to Local Storage
function saveImageToLocalStorage(imageData) {
    images.push({
        data: imageData,
        comments: []
    });
    localStorage.setItem('images', JSON.stringify(images));
}

// Load Images from Local Storage
function loadImagesFromLocalStorage() {
    images = JSON.parse(localStorage.getItem('images')) || [];
    images.forEach(image => addImageToGrid(image.data));
}

// Delete Image from Local Storage
function deleteImageFromLocalStorage(imageData) {
    images = images.filter(image => image.data !== imageData);
    localStorage.setItem('images', JSON.stringify(images));
}

// Get image comments
function getImageComments(imageData) {
    const image = images.find(image => image.data === imageData);
    return image ? image.comments : [];
}

// Add comment to image
function addCommentToImage(imageData, comment) {
    const image = images.find(image => image.data === imageData);
    if (image) {
        image.comments.push(comment);
        localStorage.setItem('images', JSON.stringify(images));
    
