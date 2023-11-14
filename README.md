# Career Mapr

![Project Cover](/images/career_mapr.jpg)

Career Mapr is a robust job listings scraper crafted with Puppeteer, Cheerio, and Axios. It empowers you to extract job information from major platforms like LinkedIn, Indeed, and Naukri. Packed with features such as stealth mode and proxy support, Career Mapr offers a seamless way to collect, analyze, and export job data in JSON and Excel formats.

```diff
! Disclaimer: Use Career Mapr responsibly and in compliance with the terms of service of the targeted platforms. The developers are not responsible for any misuse or violation of terms. 
```

## Features

- **Multi-platform Scraping**: Extracting data from various sources, including LinkedIn, Indeed, and Naukri.

- **Stealth Mode**: Includes a stealth mode that helps you bypass anti-scraping measures implemented by websites, ensuring a smooth and uninterrupted scraping process.

- **Proxy Support**: Utilize proxies to maintain anonymity and avoid IP blocking during scraping. Career Mapr seamlessly integrates with proxy services for a reliable and secure scraping experience.

- **Customizable Job Filters**: Set specific filters to narrow down job listings based on criteria such as location, industry, job type, and more. Customize the scraping process according to your requirements.

- **Data Enrichment**: Retrieve detailed job information, including job title, company name, location, salary, and other relevant details. Career Mapr ensures you get comprehensive data for analysis.

- **Export to JSON and Excel**: Supports both Excel and JSON formats for seamless integration and analysis of scraped data.


## Getting Started

### Prerequisites
- Node.js installed on your machine

- Chrome or Chromium must be installed, and its location must be specified in the config.json file under chromePath (e.g., './chrome-win64/chrome.exe').

### Installation
1. Clone the repository: `git clone https://github.com/its-saran/career-mapr.git`
2. Navigate to the project directory: `cd career-mapr`
3. Install dependencies: `npm install`

### Usage
1. Customize your scraping parameters in the index.js file. A sample is already given. searchQuery, serviceName, serviceType, folderPath, fileName, and fileType are the six parameters.

    **Search queries**

    | serviceName      | serviceType     |     Supported search queries              |
    | :--------------: | ------------:   |  ------------------------------:          |   
    |  naukri          |   search        |    jobKeyword, jobLocation, jobExperience |
    |  naukri          |   scrape        |    jobKeyword, jobLocation, jobExperience, sortBy, maxJobs, startPage |
    |  linkedin        |   search        |    jobKeyword, jobLocation, jobExperience |
    |  linkedin        |   scrape        |    jobKeyword, jobLocation, jobExperience, maxJobs, startPage |
    |  indeed          |   search        |    jobKeyword, jobLocation|
    |  indeed          |   scrape        |    jobKeyword, jobLocation, maxJobs, startPage |


    **Other parameters**

    | Parameters       | Values                      |     Type     |     Example      |
    | :--------------: | ------------------------:   |  ---------:  |     -------:     |
    |  serviceName     |   naukri, linkedin, indeed  |    String    |     'naukri'     |
    |  serviceType     |   scrape, search            |    String    |     'scrape'     |
    |  folderPath      |      custom                 |    String    |     './Outputs'  |
    |  fileName        |      custom                 |    String    |     'jobs'       |
    |  fileType        |     .json, .xlsx            |    String    |     '.json'      |

2. Run the scraper: `npm start`

3. The output file will be generated in the specified directory

## Configuration

Adjust the configuration file (`config/config.js`) to tailor the scraping process to your needs. Set parameters such as delay, maxJobs, startPage, and more.
