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
  
          const commentsResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyId}/kids.json`);
          const comments = await commentsResponse.json();
  
          return {
            title: storyDetails.title,
            url: storyDetails.url,
            points: storyDetails.score || 0,
            comments: comments ? comments.length : 0,
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
  
    const displayStories = (stories) => {
      storiesContainer.innerHTML = '';
  
      stories.forEach((story) => {
        const storyElement = document.createElement('div');
        storyElement.innerHTML = `
          <a href="${story.url}" target="_blank">${story.title}</a>
          <p>Points: ${story.points} | Comments: ${story.comments}</p>
        `;
        storiesContainer.appendChild(storyElement);
      });
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
    
  