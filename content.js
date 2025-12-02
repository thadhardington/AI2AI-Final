 // Load custom Basketball font with fallback handling
const fontUrl = chrome.runtime.getURL('Basketball.otf');
const fontFace = new FontFace('Basketball', `url(${fontUrl})`, {
  style: 'normal',
  weight: 'normal',
  display: 'swap' // Use fallback font while custom font loads
});

fontFace.load().then((loadedFont) => {
  document.fonts.add(loadedFont);
  console.log('🏀  Basketball font loaded!');
}).catch((error) => {
  console.warn('Basketball font failed to load, using fallback fonts:', error);
  // Fallback fonts ('Arial Black', 'Impact') will be used automatically via CSS
});

// Allen Iverson Fun Facts Database
const ALLEN_IVERSON_FACTS = [
  "Allen Iverson was the #1 overall pick in the 1996 NBA Draft by the Philadelphia 76ers.",
  "At 6 feet tall, Allen Iverson was one of the shortest players to win the NBA MVP.",
  "Allen Iverson led the league in scoring four times during his career (1999, 2001, 2002, 2005).",
  "Allen Iverson once scored 55 points in a game against the New Orleans Hornets in 2003.",
  "Allen Iverson was an 11-time NBA All-Star and made the All-NBA First Team three times.",
  "In 2014, the Philadelphia 76ers retired the iconic #3 jersey in honor of Allen Iverson.",
  "Allen Iverson earned the AP High School Player of the Year award in both football and basketball.",
  "Allen Iverson represented the United States at the 2004 Summer Olympics, where they won a bronze medal.",
  "In 2024, the Governor of Virginia declared March 5TH Allen Iverson Day.", 
  "Allen Iverson was inducted into the Naismith Memorial Basketball Hall of Fame in 2016.",
  "Allen Iverson averaged 26.7 points per game over his entire career.",
  "Allen Iverson averaged 29.7 points per playoff game, the third highest playoff average in NBA history.",
  "Allen Iverson had one of the quickest first steps in NBA history, making him nearly impossible to guard.",
  "Allen Iverson was named to the NBA 75th Anniversary Team in 2021.",
  "In his rookie season, Allen Iverson played five consecutive games in which he scored 40+ points.",
  "Allen Iverson scored 24,368 total points in his NBA career, ranking him 30th all-time.",
  "Allen Iverson averaged 6.2 assists per game throughout his career.",
  "Allen Iverson led the NBA in steals in three consecutive seasons.",
  "Allen Iverson won the NBA Rookie of the Year award in 1997, averaging 23.5 PPG.",
  "Allen Iverson played a total of 914 games in his NBA career.",
  "Allen Iverson averaged 41.1 minutes per game throughout his career.",
  "Allen Iverson made 6,375 free throws in his career out of 8,168 total attempts.",
  "Allen Iverson had a three-point average of 31.3.",
  "Allen Iverson's career high was 60 points against the Orlando Magic on February 12, 2005.",
  "Allen Iverson averaged 33.0 PPG in the 2005-06 season, his highest single-season scoring average.",
  "Allen Iverson recorded 1,983 career steals, ranking him in the top 15 all-time steals.",
  "Allen Iverson had 5,624 career assists, a testament to his playmaking abilities.",
  "Allen Iverson scored 30+ points in a game 345 times during his career, 38 percent of all games he played.",
  "Allen Iverson led the league in minutes played per game for seven seasons.",
  "During his 2000-01 MVP season, Allen Iverson averaged 31.1 PPG, 3.8 RPG, 4.6 APG, and 2.5 SPG.",
  "Allen Iverson had 10 straight seasons averaging 25+ points per game.", 
  "Allen Iverson played college basketball with the Georgetown Hoyas and set the school record for PPG.", 
  "Allen Iverson won the Big East Defensive Player of the Year award both years he played at Georgetown.", 
  "Allen Iverson played for the Philadelphia 76ers, Denver Nuggets, Detroit Pistons, and Memphis Grizzlies.",
  "There is a street named Allen Iverson Way in his hometown of Newport News, Virginia.", 
  "Allen Iverson played 14 seasons in the NBA as both a shooting guard and point guard. "
];


// Keep track of processed posts to avoid duplicates
const processedPosts = new WeakSet();
// Track posts that were manually closed and should not be replaced again
const closedPosts = new WeakSet();

// Function to get a random Allen Iverson fact
function getRandomFact() {
  return ALLEN_IVERSON_FACTS[Math.floor(Math.random() * ALLEN_IVERSON_FACTS.length)];
}


// Function to check if text contains "AI" (case insensitive, whole word)
function containsAI(text) {
  // Match "AI" as a standalone word, not part of other words
  const aiPattern = /\b(AI|A\.I\.|artificial intelligence|LLM|OpenAI|ChatGPT|Sora|Sam Altman|Gemini|nano banana|Anthropic|Claude)\b/gi;
  return aiPattern.test(text);
}

// Function to create Allen Iverson replacement content
function createAllenIversonContent(post, originalWrapper) {
  const container = document.createElement('div');
  container.className = 'allen-iverson-replacement';

  // Set background image using Chrome extension URL
  const backgroundUrl = chrome.runtime.getURL('ai2ai_backgroundv3.jpg');
  container.style.backgroundImage = `url('${backgroundUrl}')`;

  const fact = getRandomFact();

  container.innerHTML = `
    <button type="button" class="ai-close-button" title="Close and view original post">✕</button>
    <div class="ai-header">
      <h3 style="font-family: 'Basketball', sans-serif;">DID YOU KNOW?</h3>
    </div>
    <div class="ai-content">
      <div class="ai-fact">
        <p style="font-family: 'Basketball', sans-serif;">${fact}</p>
      </div>
    </div>
  `;

  // Add close button functionality
  const closeButton = container.querySelector('.ai-close-button');
  if (closeButton) {
    closeButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      // Hide Allen Iverson overlay and show original content
      container.style.display = 'none';
      originalWrapper.style.display = 'block';

      // Mark as manually closed so it won't be replaced again
      closedPosts.add(post);
      processedPosts.delete(post);
      console.log('🏀 Restored original post!');
    });
  }

  return container;
}

// Function to process a single post
function processPost(post) {
  // Skip if already processed or manually closed
  if (processedPosts.has(post) || closedPosts.has(post)) {
    return;
  }

  // Look for post text content
  const textElements = post.querySelectorAll('.feed-shared-text, .feed-shared-update-v2__description, [data-test-id="main-feed-activity-card__commentary"]');

  let foundAI = false;
  textElements.forEach(element => {
    if (containsAI(element.textContent)) {
      foundAI = true;
    }
  });

  if (foundAI) {
    // Mark as processed
    processedPosts.add(post);

    // Wrap original content to preserve it with all event listeners
    const originalWrapper = document.createElement('div');
    originalWrapper.className = 'original-content-wrapper';
    originalWrapper.style.display = 'none';

    // Move all existing children into the wrapper
    while (post.firstChild) {
      originalWrapper.appendChild(post.firstChild);
    }

    // Add wrapper back to post
    post.appendChild(originalWrapper);

    // Create and add replacement content
    const replacement = createAllenIversonContent(post, originalWrapper);
    post.appendChild(replacement);

    console.log('🏀 Replaced AI post with Allen Iverson content!');
  }
}

// Function to scan all posts on the page
function scanPosts() {
  // LinkedIn feed post selectors (these may need adjustment as LinkedIn updates their UI)
  const posts = document.querySelectorAll('.feed-shared-update-v2, [data-test-id="main-feed-activity-card"]');

  posts.forEach(post => {
    processPost(post);
  });
}

// Set up MutationObserver to watch for new posts
function observeFeed() {
  const feedContainer = document.querySelector('.scaffold-layout__main, main');

  if (!feedContainer) {
    console.log('Feed container not found, retrying...');
    setTimeout(observeFeed, 1000);
    return;
  }

  console.log('🏀 Allen Iverson extension is watching for AI mentions...');

  // Initial scan
  scanPosts();

  // Watch for new posts
  const observer = new MutationObserver((mutations) => {
    scanPosts();
  });

  observer.observe(feedContainer, {
    childList: true,
    subtree: true
  });

  // Also scan periodically to catch any missed posts
  setInterval(scanPosts, 2000);
}

// Start the extension
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', observeFeed);
} else {
  observeFeed();
}

console.log('🏀 Allen Iverson > AI extension loaded!');
