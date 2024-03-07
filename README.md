# Horse Racing Data Scraper

This project consists of a set of scripts designed to scrape horse racing data from the British Horse Racing website. It captures various details about races, including race conditions, runner details, jockey and trainer information, and more. The data is saved in JSON format for easy use in data analysis, machine learning models, or just for horse racing enthusiasts to explore.

## Features

- Scraping horse race fixture details including race conditions and horse/jockey information.
- Saving scraped data in structured JSON format.
- Efficient data collection with checks to avoid re-scraping already processed data.

## Getting Started

### Prerequisites

- Node.js
- npm (Node Package Manager)
- Puppeteer

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/horse-racing-data-scraper.git
cd horse-racing-data-scraper
```

2. Install the required Node.js packages:

```bash
npm install
```

### Usage

The project is divided into stages for data collection and processing:

1. **Stage 1**: Scrape initial set of URLs for race fixtures.
   
   Run the script for stage 1 (replace `stage1.js` with the actual script name):

   ```bash
   node stage1.js
   ```

2. **Stage 2**: Process each URL from stage 1 to scrape detailed race data.
   
   Run the script for stage 2:

   ```bash
   node stage2.js
   ```

3. **Stage 3**: Further process the data from stage 2 to extract detailed race conditions and results.
   
   Run the script for stage 3:

   ```bash
   node stage3.js
   ```

4. **Stage 4**: Optionally, you can process additional information or clean the data as needed for your specific requirements.
   
   Run the script for stage 4:

   ```bash
   node stage4.js
   ```

### Configuration

- Modify the base URL or paths in the scripts as necessary to match the current website structure or to target different data.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or create an issue for any bugs found or enhancements.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Thanks to all contributors who have helped in refining the scripts and adding new features.
- Special thanks to the British Horse Racing for maintaining the source data.