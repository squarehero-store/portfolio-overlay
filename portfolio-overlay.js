// ==================================================
//   ⚡ Portfolio Overlay plugin v0.1.0 by SquareHero 
// ==================================================
document.addEventListener('DOMContentLoaded', function() {
  var metaTag = document.querySelector('meta[squarehero-plugin="portfolio-overlay"]');
  if (metaTag && metaTag.getAttribute('enabled') === 'true') {
    var targetUrl = metaTag.getAttribute('target');
    var cacheBuster = '&cb=' + new Date().getTime(); // Cache buster, ensure it follows an existing query parameter

    if (!targetUrl) {
      console.error('Meta tag target URL is missing or incorrect.');
      return;
    }

    // Ensure the target URL includes a leading slash
    if (!targetUrl.startsWith('/')) {
      targetUrl = '/' + targetUrl;
    }

    // Get the base URL of the site
    var baseUrl = window.location.origin;

    // Construct the full URL for fetching JSON data
    var jsonUrl = baseUrl + targetUrl;
    jsonUrl = jsonUrl.includes('?') ? jsonUrl + '&format=json' : jsonUrl + '?format=json';
    var finalUrl = jsonUrl + cacheBuster;

    // Create the overlay div
    var overlay = document.createElement('div');
    overlay.id = 'portfolioOverlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-hidden', 'true');

    // Create the content div
    var content = document.createElement('div');
    content.className = 'overlay-content';
    overlay.appendChild(content);
    document.body.appendChild(overlay);

    // Create the close button
    var closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.innerHTML = '&times;';
    closeButton.setAttribute('aria-label', 'Close overlay');
    overlay.appendChild(closeButton);

    // Add event listener to the close button
    closeButton.addEventListener('click', function() {
      overlay.classList.remove('visible'); // Remove the visible class to hide the overlay
      overlay.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll'); // Allow scrolling
    });

    // Function to handle target button click
    function handlePortfolioButtonClick(event) {
      event.preventDefault(); // Prevent default anchor behavior
      overlay.classList.add('visible'); // Add the visible class to trigger the fade-in effect
      overlay.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll'); // Prevent scrolling
      closeButton.focus(); // Set focus on the close button for accessibility
      displayProjects(); // Display preloaded projects when the overlay is shown
    }

    // Add event listeners to the target buttons inside the #header
    var header = document.querySelector('#header');
    if (header) {
      var targetButtons = header.querySelectorAll(`a[href="${targetUrl}"], .header-menu-nav a[href="${targetUrl}"]`);
      targetButtons.forEach(button => {
        button.addEventListener('click', handlePortfolioButtonClick);
      });
    }

    // Optional: Hide overlay when clicked outside the content
    overlay.addEventListener('click', function(event) {
      if (event.target === overlay) {
        overlay.classList.remove('visible'); // Remove the visible class to hide the overlay
        overlay.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll'); // Allow scrolling
      }
    });

    // Preload images and store them
    var preloadedImages = [];
    var collectionUrlId = '';

    function preloadImages() {
      fetch(finalUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
          }
          return response.json();
        })
        .then(data => {
          collectionUrlId = data.collection.urlId;
          data.items.slice(0, 8).forEach(item => {
            const image = new Image();
            image.src = item.assetUrl;
            image.alt = item.title;
            preloadedImages.push({
              element: image,
              title: item.title,
              urlId: item.urlId
            });
          });
          console.log('Script is working.');
        })
        .catch(error => console.error('Error preloading images:', error));
    }

    // Preload images once the page is loaded
    preloadImages();

    function displayProjects() {
      content.innerHTML = ''; // Clear any existing content

      const grid = document.createElement('div');
      grid.className = 'grid';

      preloadedImages.forEach(item => {
        const project = document.createElement('div');
        project.className = 'portfolio-overlay-item';

        const link = document.createElement('a');
        link.href = `${targetUrl}/${item.urlId}`;
        link.target = '_blank';

        const image = item.element;
        const title = document.createElement('h2');
        title.innerText = item.title;

        link.appendChild(image);
        project.appendChild(link);
        project.appendChild(title);
        grid.appendChild(project);
      });

      // Add "View All" item
      const viewAllItem = document.createElement('div');
      viewAllItem.className = 'view-all';
      viewAllItem.innerHTML = '<a href="' + targetUrl + '"><svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="none" viewBox="0 0 21 21"><path fill="#fff" d="M0 0h4.5v4.5H0zM8.25 0h4.5v4.5h-4.5zM16.5 0H21v4.5h-4.5zM0 8.25h4.5v4.5H0zM8.25 8.25h4.5v4.5h-4.5zM16.5 8.25H21v4.5h-4.5zM0 16.5h4.5V21H0zM8.25 16.5h4.5V21h-4.5zM16.5 16.5H21V21h-4.5z"/></svg> View All</a>';
      grid.appendChild(viewAllItem);

      content.appendChild(grid);

      // Reapply event listeners to dynamically created links
      const projectLinks = content.querySelectorAll('.portfolio-overlay-item a');
      projectLinks.forEach(link => {
        link.addEventListener('click', function(event) {
          // If the current URL matches the link's href, close the overlay
          const linkPath = new URL(link.href).pathname;
          const currentPath = window.location.pathname;
          if (linkPath === currentPath) {
            event.preventDefault(); // Prevent default navigation
            overlay.classList.remove('visible'); // Close the overlay
            overlay.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('no-scroll'); // Allow scrolling
          } else {
            // Allow default behavior of opening link
            console.log('Navigating to:', link.href);
          }
        });
      });

      // Add event listener to the "View All" link
      const viewAllLink = viewAllItem.querySelector('a');
      viewAllLink.addEventListener('click', function(event) {
        // If the current URL matches the "View All" link's href, close the overlay
        const linkPath = new URL(viewAllLink.href).pathname;
        const currentPath = window.location.pathname;
        if (linkPath === currentPath) {
          event.preventDefault(); // Prevent default navigation
          overlay.classList.remove('visible'); // Close the overlay
          overlay.setAttribute('aria-hidden', 'true');
          document.body.classList.remove('no-scroll'); // Allow scrolling
        }
      });
    }

    // Handle ESC key to close overlay for accessibility
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && overlay.classList.contains('visible')) {
        overlay.classList.remove('visible');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');
        targetButtons[0].focus(); // Return focus to the first portfolio button
      }
    });
  }
});
