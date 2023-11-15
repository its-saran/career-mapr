# Career Mapr

![Project Cover](/images/career_mapr.jpg)

Career Mapr is a robust job listings scraper crafted with Puppeteer, Cheerio, and Axios. It empowers you to extract job information from major platforms like LinkedIn, Indeed, and Naukri. Packed with features such as stealth mode and proxy support, Career Mapr offers a seamless way to collect, analyze, and export job data in JSON and Excel formats.


```diff
! Disclaimer: If you intend to use this scraper multiple times a day, it is advisable to use a proxy to prevent potential issues.
```

## Features

- **Multi-platform Scraping**: Extracting data from various sources, including LinkedIn, Indeed, and Naukri.

- **Stealth Mode**: Includes a stealth mode that helps you bypass anti-scraping measures implemented by websites, ensuring a smooth and uninterrupted scraping process.

- **Proxy Support**: Utilize proxies to maintain anonymity and avoid IP blocking during scraping. Career Mapr seamlessly integrates with proxy services for a reliable and secure scraping experience.

- **Customizable Job Filters**: Set specific filters to narrow down job listings based on criteria such as location, industry, job type, and more. Customize the scraping process according to your requirements.

- **Data Enrichment**: Retrieve detailed job information, including job title, company name, location, salary, and other relevant details. Career Mapr ensures you get comprehensive data for analysis.

- **Export to Mutliplt Formats**: Supports '.xlsx, '.json' and '.csv' formats for seamless integration and analysis of scraped data.


## Prerequisites
- Node.js installed on your machine

- Chrome or Chromium must be installed on your machine.

## Installation
1. Clone the repository: `git clone https://github.com/its-saran/career-mapr.git`
2. Navigate to the project directory: `cd career-mapr`
3. Install dependencies: `npm install`
4. Specify chrome or chromium location in the config.json file under chromePath (e.g., './chrome-win64/chrome.exe').

## Usage
1. Customize your scraping options in the index.js file. jobConfig and ouputConfig are the two parameters.

### jobConfig

    | Options          |      Type       |                Values                       |
    | :--------------: | ------------:   |  ------------------------------:            |    
    |  serviceName     |   string        |    naukri, linkedin, indeed, all	           |
    |  serviceType     |   string        |    search, scrape                           |
    |  searchQuery     |   object        |    Search query options are given below     |

    SearchQuery options


    | serviceName      | serviceType     |     Supported searchQuery                 |
    | :--------------: | ------------:   |  ------------------------------:          |   
    |  naukri          |   search        |    jobKeyword, jobLocation, jobExperience |
    |  naukri          |   scrape        |    jobKeyword, jobLocation, jobExperience, sortBy, maxJobs, startPage |
    |  linkedin        |   search        |    jobKeyword, jobLocation, jobExperience |
    |  linkedin        |   scrape        |    jobKeyword, jobLocation, jobExperience, maxJobs, startPage |
    |  indeed          |   search        |    jobKeyword, jobLocation|
    |  indeed          |   scrape        |    jobKeyword, jobLocation, maxJobs, startPage |


### outputConfig 

    | Options              | Type   | Values          |
    | -------------------- | ------ | --------------- |
    | fileName (required)  | string | custom          |
    | fileType (required)  | string | json, xlsx, csv |
    | folderPath (optional)| string | custom          |

2. Run the scraper: `npm start`

3. The output file will be generated in the specified directory

4. To use a proxy, create a 'proxy.json' file in the './config' directory and add the host, port, password, and username to it. A sample is provided below.

```json
{
    "host": "89.31.29.29",
    "port": 18915,
    "username": "sd27fks",
    "password": "sdfsdfsdfa"
}
```


## Configuration

Adjust the configuration file (`config/config.js`) to tailor the scraping process to your needs. Set parameters such as delay, maxJobs, startPage, and more.


## Disclaimer: Usage Guidelines

This web scraper is intended for personal, non-commercial use.

1. **Proxy Usage:** To mitigate the risk of being banned from the targeted website, it is strongly recommended to employ a proxy or a rotating IP address service while utilizing this web scraper. Using a proxy helps distribute requests across different IP addresses, reducing the likelihood of detection and subsequent blocking. 

2. **Time Restrictions:** To minimize the impact on the targeted website's servers and to avoid potential disruptions to its normal operation, we recommend limiting your usage of this web scraper to specific time frames. Please refrain from excessive or continuous scraping, as this could lead to server overload and negatively impact the user experience for other visitors.

3. **Terms of Service Compliance:** Ensure that your use of this web scraper aligns with the terms of service of the targeted website.

4. **Responsibility:** The user assumes full responsibility for any consequences arising from the use of this web scraper. This includes, but is not limited to, legal repercussions, damages, or any other issues that may arise from non-compliance with the targeted website's terms of service.

By proceeding to use this web scraper, you acknowledge that you have read, understood, and agreed to the terms outlined in this disclaimer. The developers and providers of this tool are not responsible for any misuse, legal consequences, or damages resulting from your use of the web scraper.
