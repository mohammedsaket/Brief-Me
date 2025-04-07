# Brief Me - Chrome Extension

A Chrome extension that helps you summarize web pages and ask questions in multiple languages using the power of Google's Generative AI.

## Features

- Summarize any web page with a single click
- Ask questions about the content in multiple languages
- Clean and intuitive user interface
- Powered by Google's Generative AI
- Supports multiple languages

## Installation

### Method : Manual Installation (For Development)
1. Clone this repository:
```bash
git clone https://github.com/yourusername/brief-me.git
cd brief-me
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build
```

4. Load the extension in Chrome:
   - Open Chrome and type `chrome://extensions/` in the address bar
   - Enable "Developer mode" by toggling the switch in the top-right corner
   - Click the "Load unpacked" button
   - Navigate to your project directory and select the `dist` folder
   - The extension should now appear in your Chrome toolbar

5. Pin the extension (Optional but recommended):
   - Click the puzzle piece icon (Extensions menu) in the Chrome toolbar
   - Find "Brief Me" in the list
   - Click the pin icon to keep the extension visible in your toolbar

## Development

available scripts:
- `npm run build` - Build the extension for production
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview the production build
- `npm run generate-icons` - Generate icon assets

## Environment Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Add your Google AI API key to the `.env` file:
```
VITE_GOOGLE_AI_API_KEY=your_api_key_here
```

## Technologies Used

- React 18
- TypeScript
- Vite
- TailwindCSS
- Google Generative AI
- Framer Motion
- Lucide React Icons

## Project Structure

```
brief-me/
├── src/            # Source code
├── public/         # Static assets
├── icons/          # Extension icons
├── scripts/        # Utility scripts
├── dist/           # Production build
└── manifest.json   # Extension configuration
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Google Generative AI](https://ai.google.dev/)
- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/) 


## Created By
- Mohammed Saket