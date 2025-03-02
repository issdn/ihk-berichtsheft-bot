export function parseStringList(text: string) {
  // Split the input text by newlines and filter out empty lines
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  let result = '';
  let currentListItems = [];

  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if this is a list item (starts with dash or hyphen)
    if (/^[-–—]/.test(line)) {
      // Add to current list items
      const cleanedLine = line.replace(/^[-–—]\s*/, '').trim();
      currentListItems.push(cleanedLine);
    } else {
      // This is not a list item, so first close any open list
      if (currentListItems.length > 0) {
        const listItems = currentListItems
          .map((item) => `<li>${item}</li>`)
          .join('');
        result += `<ul>${listItems}</ul>`;
        currentListItems = [];
      }

      // Add the current line as a paragraph
      result += `<p>${line}</p>`;
    }
  }

  // Don't forget to add any remaining list items
  if (currentListItems.length > 0) {
    const listItems = currentListItems
      .map((item) => `<li>${item}</li>`)
      .join('');
    result += `<ul>${listItems}</ul>`;
  }

  return result;
}
