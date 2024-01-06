document.addEventListener("DOMContentLoaded", () => {
  const storyId = new URLSearchParams(window.location.search).get("storyId");
  if (storyId) {
    fetchAndDisplayComments(storyId);
  } else {
    console.error("Story ID not found in the URL.");
  }
});

const fetchAndDisplayComments = async (storyId) => {
  const loadingElement = document.querySelector(".loading");
  try {
    loadingElement.style.display = "block";
    const storyResponse = await fetch(
      `https://hacker-news.firebaseio.com/v0/item/${storyId}.json`
    );
    const storyDetails = await storyResponse.json();

    if (storyDetails.kids) {
      const commentsAndReplies = await Promise.all(
        storyDetails.kids.map((commentId) => fetchComments(commentId))
      );
      displayComments(commentsAndReplies.flat());
    } else {
      console.error("No comments found for the given story ID.");
    }
  } catch (error) {
    console.error("Error fetching story details:", error);
  }
};
const fetchComments = async (commentId) => {
  const apiUrl = `https://hacker-news.firebaseio.com/v0/item/${commentId}.json`;

  try {
    const response = await fetch(apiUrl);
    const comment = await response.json();

    if (comment.kids && comment.kids.length > 0) {
      const replyPromises = comment.kids.map((replyId) =>
        fetchComments(replyId)
      );
      comment.replies = await Promise.all(replyPromises);
    }
    if (!comment.deleted) {
      return comment;
    } else {
      return null; 
    }
  } catch (error) {
    console.error(`Error fetching comment ${commentId}: ${error.message}`);
    throw error;
  }
};


const displayComments = (comments) => {
  const commentsContainer = document.getElementById("comments");

  commentsContainer.innerHTML = "";

  if (comments.length === 0) {
    commentsContainer.innerHTML = "<p>No comments available.</p>";
  } else {
    const createCommentElement = (comment) => {
      const commentElement = document.createElement("li");

      const commentTime = comment.time ? new Date(comment.time * 1000) : null;
      const author = comment.by || "Unknown Author";

      commentElement.innerHTML = `
        <p>${comment.text}</p>
        <p class="comment-details">by ${author}${
        commentTime ? " on " + commentTime.toLocaleString() : ""
      }</p>
      `;

      return commentElement;
    };

    const appendComments = async (parentElement, comments) => {
      for (const comment of comments) {
        const commentElement = createCommentElement(comment);
        parentElement.appendChild(commentElement);

        if (comment.kids) {
          const replyContainer = document.createElement("ul");
          replyContainer.classList.add("reply-container");
          parentElement.appendChild(replyContainer);

          const replies = await Promise.all(
            comment.kids.map((replyId) => fetchComments(replyId))
          );
          appendComments(replyContainer, replies.flat().filter(Boolean));
        }
        // if (comment.kids) {
        //   // Append replies directly to the comment element
        //   const replies = await Promise.all(comment.kids.map((replyId) => fetchComments(replyId)));
        //   appendComments(commentElement, replies.flat().filter(Boolean));
        // }
      }
    };

    appendComments(commentsContainer, comments);
  }
};
