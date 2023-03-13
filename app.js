const express = require('express');
const app = express();

// Logging middleware
app.use((req, res, next) => {
  console.log(`Request: ${req.url} (${req.method})`);
  res.on('finish', () => {
    if (res.statusCode === 200) {
      console.log(`Response: ${req.url} (${req.method}) ${res.statusCode}`);
      const linkUrls = res.locals.links.map(link => link.url);
      console.log(`Generated links: ${linkUrls.join(', ')}`);
    } else {
      console.log(`Response: ${req.url} (${req.method}) ${res.statusCode} - ${res.statusMessage}`);
    }
  });
  next();
});

// Function to generate a random word for use in link URLs
function generateLinkWord() {
  const words = ['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape', 'honeydew', 'kiwi', 'lemon'];
  return words[Math.floor(Math.random() * words.length)];
}

// Function to generate an array of random links with titles that match the page IDs
function generateLinks(count, pageId) {
  const links = [];
  for (let i = 0; i < count; i++) {
    const linkId = Math.floor(Math.random() * 1000);
    const linkTitle = `Page ${linkId}`;
    let linkFolder;
    if (Math.random() < 0.66) {
      linkFolder = Math.random() < 0.5 ? 'folder-level-1' : 'folder-level-1/folder-level-2';
    }
    const linkUrl = pageId ? `${linkFolder ? `/${linkFolder}` : ''}/${pageId}-${generateLinkWord()}` : `${linkFolder ? `/${linkFolder}` : ''}/${linkId}-${generateLinkWord()}`;
    links.push({
      title: linkTitle,
      url: linkUrl,
    });
  }
  return links;
}

// Route to handle requests for home page and other pages
app.get('*', (req, res) => {
  // Generate random page ID
  const pageId = Math.floor(Math.random() * 1000);

  // Determine if response should be an error
  const isError = Math.random() < 0.1;
  const statusCode = isError ? (Math.random() < 0.5 ? 404 : 500) : 200;

  if (isError) {
    // Return error response
    res.status(statusCode).send('error');
  } else {
    // Generate links for the page
    const links = generateLinks(10, pageId);

    // Generate HTML for the links
    const linkHtml = links.map(link => `<li><a href="${link.url}">${link.title}</a></li>`).join('');

    // Generate HTML for the page
    const pageHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Page ${pageId}</title>
        </head>
        <body>
          <h1>Page ${pageId}</h1>
          <ul>
            ${linkHtml}
          </ul>
        </body>
      </html>
    `;

    // Set status code and send response with HTML for the page
    res.status(statusCode);
    res.locals.links = links;
    res.send(pageHtml);
  }
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}...`));
