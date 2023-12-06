const storyId = new URLSearchParams(window.location.search).get('storyId');

if (storyId) {
  fetchComments(storyId);
}

function fetchComments(storyId) {
  fetch(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`)
    .then(response => response.json())
    .then(storyDetails => {
      if (storyDetails && storyDetails.kids) {
        fetchCommentsFromKids(storyDetails.kids);
      }
    });
}

function fetchCommentsFromKids(commentIds) {
  const promises = commentIds.map(commentId =>
    fetch(`https://hacker-news.firebaseio.com/v0/item/${commentId}.json`)
      .then(response => response.json())
  );

  Promise.all(promises).then(comments => {
    displayComments(comments);
    for (const comment of comments) {
      if (comment.kids) {
        fetchCommentsFromKids(comment.kids);
      }
    }
  });
}

function displayComments(comments) {
  const commentsListElement = document.getElementById('comments');
  commentsListElement.innerHTML = ''; // Clear existing comments

  for (const comment of comments) {
    const commentElement = document.createElement('li');
    commentElement.textContent = comment.text;
    commentsListElement.appendChild(commentElement);
  }
}
