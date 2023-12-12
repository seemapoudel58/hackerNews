document.addEventListener('DOMContentLoaded', () => {
  const storyId = new URLSearchParams(window.location.search).get('storyId');

  if (storyId) {
    fetchAndDisplayComments(storyId);
  } else {
    console.error('Story ID not found in the URL.');
  }
});

const fetchAndDisplayComments = async (storyId) => {
  try {
    const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`);
    const storyDetails = await storyResponse.json();

    const commentsIds = storyDetails.kids || [];
    const commentsPromises = commentsIds.map(commentId =>
      fetch(`https://hacker-news.firebaseio.com/v0/item/${commentId}.json`)
        .then(response => response.json())
    );

    const comments = await Promise.all(commentsPromises);

    displayComments(storyDetails, comments);
  } catch (error) {
    console.error('Error fetching story details or comments:', error);
  }
};

const displayComments = (storyDetails, comments) => {
  const commentsContainer = document.getElementById('comments');
  commentsContainer.innerHTML = '';

  // Display story details
  const storyDetailsElement = document.createElement('div');
  storyDetailsElement.innerHTML = `
    <h2>${storyDetails.title}</h2>
    <p>Points: ${storyDetails.score || 0} | Comments: ${comments.length} | 
      <a href="${storyDetails.url}" target="_blank">View Story</a>
    </p>
  `;
  commentsContainer.appendChild(storyDetailsElement);

  // Display comments for the specific story
  const commentsListElement = document.createElement('ul');
  commentsListElement.classList.add('comments-list');

  for (const comment of comments) {
    const commentElement = document.createElement('li');
    commentElement.classList.add('comment');

    const commentContent = document.createElement('div');
    commentContent.classList.add('comment-content');
    commentContent.textContent = comment.text;

    const commentMeta = document.createElement('div');
    commentMeta.classList.add('comment-meta');
    commentMeta.innerHTML = `
      <span class="comment-author">${comment.by}</span>
      <span class="comment-time">${formatTime(comment.time)}</span>
    `;

    commentElement.appendChild(commentContent);
    commentElement.appendChild(commentMeta);
    commentsListElement.appendChild(commentElement);
  }

  commentsContainer.appendChild(commentsListElement);
};

// Helper function to format Unix timestamp to human-readable time
const formatTime = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
};
