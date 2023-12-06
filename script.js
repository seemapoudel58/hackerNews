const storiesContainer = document.getElementById('stories');
const loadingElement = document.querySelector('.loading');
const itemsPerPage = 25;
let currentPage = 1;

const fetchStories = async (page) => {
  try {
    loadingElement.style.display = 'block';

    const response = await fetch(`https://hacker-news.firebaseio.com/v0/topstories.json`);
    const storyIds = await response.json();

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const currentPageStoryIds = storyIds.slice(start, end);

    const storyPromises = currentPageStoryIds.map(async (storyId) => {
      const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`);
      const storyDetails = await storyResponse.json();

      return {
        storyId,
        title: storyDetails.title,
        url: storyDetails.url,
        points: storyDetails.score || 0,
      };
    });

    const stories = await Promise.all(storyPromises);

    displayStories(stories);
  } catch (error) {
    console.error('Error fetching stories:', error);
  } finally {
    loadingElement.style.display = 'none';
  }
};

const attachStoryLinkListeners = () => {
  const storyLinks = document.querySelectorAll('.story-link');
  storyLinks.forEach((link) => {
    link.addEventListener('click', async (event) => {
      event.preventDefault(); // Prevent default behavior (e.g., page reload)

      const storyId = link.dataset.storyId;
      window.location.href = `story.html?storyId=${storyId}`;
    });
  });
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

const nextPage = () => {
  currentPage++;
  fetchStories(currentPage);
};

const prevPage = () => {
  if (currentPage > 1) {
    currentPage--;
    fetchStories(currentPage);
  }
};

fetchStories(currentPage);

const nextButton = document.createElement('button');
nextButton.textContent = 'Next';
nextButton.addEventListener('click', nextPage);

const prevButton = document.createElement('button');
prevButton.textContent = 'Previous';
prevButton.addEventListener('click', prevPage);

document.body.appendChild(prevButton);
document.body.appendChild(nextButton);

attachStoryLinkListeners();
