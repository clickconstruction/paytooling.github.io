# PayTooling - Contractor Pay Stub Generator

A static website for generating contractor pay stubs with mileage tracking and pre-filled form links.

## Features

- Generate professional PDF pay stubs for contractors
- Track miles driven during pay periods
- Create custom links with pre-filled contractor information
- Fully static implementation (works with GitHub Pages)
- No server-side code required
- Mobile-responsive design

## Usage

1. Fill out the contractor and company information in the form
2. Enter payment details including payment amount and miles driven
3. Click "Generate Pay Stub" to create and download a PDF pay stub
4. Click "Generate Pre-fill Link" to create a shareable link with pre-filled information

## Custom Links

You can create custom links that pre-fill the form with contractor information. This is useful for:

- Sending personalized links to contractors
- Saving time by pre-filling common information
- Creating bookmarks for frequent contractors

## Technical Details

This project uses:

- HTML5, CSS3, and JavaScript (ES6+)
- jsPDF for PDF generation
- URL parameters for form pre-filling
- GitHub Pages for hosting

## Deployment

This website is designed to be deployed on GitHub Pages:

1. Push the code to your GitHub repository
2. Go to repository Settings > Pages
3. Select the branch to deploy (usually `main` or `master`)
4. The site will be available at `https://yourusername.github.io/repositoryname/`

## Local Development

To run this project locally:

1. Clone the repository
2. Open `index.html` in your browser

No build process or server is required.

## License

MIT License
