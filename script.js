const storiesContainer = document.getElementById('stories');
const loadingElement = document.querySelector('.loading');
const itemsPerPage = 10;
let currentPage = 1;

const nextButton = document.querySelector('.next');
const prevButton = document.querySelector('.Previous');

const fetchStories = async (page) => {
  try {
    loadingElement.style.display = 'block';

    const response = await fetch(`https://hacker-news.firebaseio.com/v0/topstories.json`);
    const storyIds = await response.json();

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const currentPageStoryIds = storyIds.slice(start, end);

    const storyPromises = currentPageStoryIds.map(async (storyId, index) => {
      const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyId}.json`);
      const storyDetails = await storyResponse.json();

      return {
        storyId,
        number: start + index + 1, 
        title: storyDetails.title,
        url: storyDetails.url,
        points: storyDetails.score || 0,
        comments: storyDetails.descendants || 0, // Fetch the number of comments
      };
    });

    const stories = await Promise.all(storyPromises);

    displayStories(stories);

    nextButton.style.display = 'block';
    prevButton.style.display = 'block';
  } catch (error) {
    console.error('Error fetching stories:', error);
  } finally {
    loadingElement.style.display = 'none';
  }
};

const displayStories = (stories) => {
  storiesContainer.innerHTML = '';

  stories.forEach((story) => {
    const storyElement = document.createElement('div');
    storyElement.classList.add('story-box');
    storyElement.innerHTML = `
      <div class="story-content">
        <div class="story-number">${story.number}</div>
        <div class="story-details">
          <p><a href="story.html?storyId=${story.storyId}" >${story.title}</a></p>
          <p class="details-line">Points: ${story.points} | Comments: ${story.comments || 0}</p>
        </div>
      </div>
    `;
    storiesContainer.appendChild(storyElement);
  });
  const pageInfoElement = document.getElementById('current-page');
  pageInfoElement.textContent = currentPage;
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

nextButton.style.display = 'none';
prevButton.style.display = 'none';

nextButton.addEventListener('click', nextPage);
prevButton.addEventListener('click', prevPage);

fetchStories(currentPage);
