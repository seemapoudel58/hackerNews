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

    if (storyDetails.kids) {
      const commentsAndReplies = await Promise.all(storyDetails.kids.map((commentId) => fetchComments(commentId)));
      displayComments(commentsAndReplies.flat());
    } else {
      console.error('No comments found for the given story ID.');
    }
  } catch (error) {
    console.error('Error fetching story details:', error);
  }
};

const fetchComments = async (commentId) => {
  try {
    const commentResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${commentId}.json`);
    const commentDetails = await commentResponse.json();

    const commentPromises = [commentDetails];

    if (commentDetails.kids) {
      const replies = await Promise.all(commentDetails.kids.map((replyId) => fetchComments(replyId)));
      commentPromises.push(...replies.flat());
    }

    return commentPromises;
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

const displayComments = (comments) => {
  const commentsContainer = document.getElementById('comments');

  commentsContainer.innerHTML = '';

  if (comments.length === 0) {
    commentsContainer.innerHTML = '<p>No comments available.</p>';
  } else {
    const createCommentElement = (comment) => {
      const commentElement = document.createElement('li');

      // Check if the properties exist before using them
      const commentTime = comment.time ? new Date(comment.time * 1000) : null;
      const author = comment.by || 'Unknown Author';

      commentElement.innerHTML = `
        <p>${comment.text}</p>
        <p class="comment-details">by ${author}${commentTime ? ' on ' + commentTime.toLocaleString() : ''}</p>
      `;

      return commentElement;
    };

    const appendComments = (parentElement, comments) => {
      comments.forEach((comment) => {
        const commentElement = createCommentElement(comment);
        parentElement.appendChild(commentElement);

        if (comment.kids) {
          const replyContainer = document.createElement('ul');
          replyContainer.classList.add('reply-container');
          parentElement.appendChild(replyContainer);
          appendComments(replyContainer, comment.kids);
        }
      });
    };

    appendComments(commentsContainer, comments);
  }
};
