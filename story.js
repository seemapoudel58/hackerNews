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
  // Display story details
  const storyElement = document.createElement('div');
  storyElement.innerHTML = `
    <h2>${storyDetails.title}</h2>
    <p>Points: ${storyDetails.score || 0} | Comments: ${comments.length}</p>
  `;
  document.body.appendChild(storyElement);

  // Display comments for the specific story
  const commentsListElement = document.createElement('ul');
  for (const comment of comments) {
    const commentElement = document.createElement('li');
    commentElement.textContent = comment.text;
    commentsListElement.appendChild(commentElement);
  }
  document.body.appendChild(commentsListElement);
};
