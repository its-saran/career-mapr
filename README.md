# Career Mapr

![Project Cover](/images/career_mapr.jpg)

Career Mapr is a robust job listings scraper crafted with Puppeteer, Cheerio, and Axios. It empowers you to extract job information from major platforms like LinkedIn, Indeed, and Naukri. Packed with features such as stealth mode and proxy support, Career Mapr offers a seamless way to collect, analyze, and export job data in JSON and Excel formats.

```diff
! Disclaimer: Use Career Mapr responsibly and in compliance with the terms of service of the targeted platforms. The developers are not responsible for any misuse or violation of terms. 
```

## Features

### 1. Multi-platform Scraping
- **LinkedIn:** Gather job listings from the world's largest professional network.
- **Indeed:** Collect job information from one of the leading job search engines.
- **Naukri:** Retrieve job listings from one of India's most popular job portals.

### 2. Stealth Mode
- **Bypass Anti-Scraping Measures:** Career Mapr includes a stealth mode that helps you bypass anti-scraping measures implemented by websites, ensuring a smooth and uninterrupted scraping process.

### 3. Proxy Support
- **Enhanced Anonymity:** Utilize proxies to maintain anonymity and avoid IP blocking during scraping. Career Mapr seamlessly integrates with proxy services for a reliable and secure scraping experience.

### 4. Customizable Job Filters
- **Refine Your Search:** Set specific filters to narrow down job listings based on criteria such as location, industry, job type, and more. Customize the scraping process according to your requirements.

### 5. Data Enrichment
- **Comprehensive Information:** Retrieve detailed job information, including job title, company name, location, salary, and other relevant details. Career Mapr ensures you get comprehensive data for analysis.

### 6. Export to JSON and Excel
- **JSON Output:** Save scraped data in a structured JSON format for easy integration into other applications.
- **Excel Output:** Generate Excel spreadsheets with job details, making it convenient for further analysis and reporting.

## Getting Started

### Prerequisites
- Node.js installed on your machine

### Installation
1. Clone the repository: `git clone https://github.com/its-saran/career-mapr.git`
2. Navigate to the project directory: `cd career-mapr`
3. Install dependencies: `npm install`

### Usage
1. Customize your scraping parameters in the index.js file. A sample is already given. searchQuery, serviceName, serviceType, folderPath, fileName, and fileType are the six parameters.


| Parameters       | Values                      |     Type     |     Example      |
| :--------------: | ------------------------:   |  ---------:  |     -------:     |
|  serviceName     |   naukri, linkedin, indeed  |    String    |     'naukri'     |
|  serviceType     |   scrape, search            |    String    |     'scrape'     |
|  folderPath      |      custom                 |    String    |     './Outputs'  |
|  fileName        |      custom                 |    String    |     'jobs'       |
|  fileType        |     .json, .xlsx            |    String    |     '.json'      |

2. Run the scraper: `npm start`

## Configuration

Adjust the configuration file (`config/config.js`) to tailor the scraping process to your needs. Set parameters such as delay, maxJobs, startPage, and more.
