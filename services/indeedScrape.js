import puppeteer from 'puppeteer-extra';
import stealth from 'puppeteer-extra-plugin-stealth';
import path from 'path';
import utils from '../utils/helper.js'


class Scrape {
    constructor(searchQuery, config) {
        if (!searchQuery || !config) {
            throw new Error("searchQuery and config parameters are required.");
        }

        // Initialize class properties
        this.config = config.indeed
        this.launchOptions = {
            headless: 'new',
            executablePath: path.resolve(config.chromePath),
            args: ['--start-maximized']
        };

        if (this.config && this.config.proxyStatus) {
            this.launchOptions.args.push(`--proxy-server=http://${config.proxy.host}:${config.proxy.port}`)
        }

        this.platform = 'Indeed'
        this.browser = null;
        this.page = null;
        this.proxyInfo = 'Not connected';
        this.jobs = [];
        this.totalJobs = null;

        this.startPage = this.config.startPage;
        this.maxJobs = this.config.maxJobs;

        this.jobKeyword = searchQuery.jobKeyword;
        this.jobLocation = searchQuery.jobLocation;
        if (searchQuery.maxJobs) this.maxJobs = searchQuery.maxJobs;
        if (searchQuery.startPage) this.startPage = searchQuery.startPage;
    }

    async initialize() {
        try {
            console.log(`Initializing scraper`);
            puppeteer.use(stealth());
            this.browser = await puppeteer.launch(this.launchOptions);
            this.page = await this.browser.newPage();
            await this.page.setUserAgent(this.config.userAgent);
            await this.page.setViewport(this.config.viewportSize);
        } catch (error) {
            console.error(error);
        }
    }

    async connectProxy() {
        try {
            console.log('Connecting proxy....')
            await this.page.authenticate({ username: this.config.proxy.username, password: this.config.proxy.password });
            console.log('Proxy connected')

            console.log('Checking ip location')
            const ip_check_url = 'https://nordvpn.com/wp-admin/admin-ajax.php?action=get_user_info_data';
            await this.page.goto(ip_check_url);

            const ip_data = await this.page.evaluate(async () => {
                const response = await fetch(window.location.href);
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return response.json();
                }
                return null;
            });
            this.proxyInfo = ip_data
        } catch (error) {
            console.error(error);
        }
    }

    async scrape() {
        try {
            const platform = this.platform
            console.log(`\nLoading ${platform}`)
            let url = `https://in.indeed.com/jobs?`

            if (this.jobLocation && this.jobKeyword) {
                url = url + `q=${this.jobKeyword}&l=${this.jobLocation}`
            } else if (jobLocation && !jobKeyword) {
                url = url + `l=${this.jobLocation}`
            } else if (!jobLocation && jobKeyword) {
                url = url + `q=${this.jobKeyword}`
            }

            for (let pageNo = this.startPage, i = 1; this.jobs.length < this.maxJobs; pageNo++, i++) {

                if (pageNo != 1) {
                    const pageIndex = (pageNo - 1) * 10
                    url = `https://in.indeed.com/jobs?q=${this.jobKeyword}&l=${this.jobLocation}&start=${pageIndex}`; 
                }

                await this.page.goto(url);
                console.log(`Visiting url: ${url}`)
                await this.page.waitForSelector('#mosaic-jobResults')
                await this.page.waitForSelector('.jobsearch-JobCountAndSortPane-jobCount')
                this.totalJobs = await this.page.$eval('.jobsearch-JobCountAndSortPane-jobCount', el => el.textContent.replace(/\D/g, ''))
                
                if (i===1) console.log(`Expected jobs : ${this.totalJobs}`)

                console.log(`Page No: ${pageNo}, ${url}`)
                await this.page.waitForSelector('.jobTitle', { timeout: 60000 });

                const closeButton = await this.page.$('.icl-CloseButton');
                if (closeButton) await this.page.click('.icl-CloseButton');
                const jobItems = await this.page.$$('[data-testid="slider_item"]')

                for (const job of jobItems) {
                    await job.click()
                    await utils.waitFor(this.config.delay)

                    await this.page.waitForSelector('#jobDescriptionText', { timeout: 50000 })
                    await this.page.waitForSelector('.jcs-JobTitle', { timeout: 50000 })

                    const title = await job.$eval('.jcs-JobTitle', el => el.textContent.trim());
                    const jobLink = await job.$eval('.jcs-JobTitle', el => el.getAttribute('href').trim())
                    const jobUrl = jobLink.includes('https:') ? jobLink : `https://in.indeed.com${jobLink}`;
                    const urlObject = new URL(jobUrl);
                    const jobId = urlObject.searchParams.get("jk") || '';
                    const company = await job.$eval('[data-testid="company-name"]', el => el.textContent.trim());
                    const location = await job.$eval('[data-testid="text-location"]', el => el.textContent.trim());

                    let ratings
                    let reviews
                    let salary
                    let qualifications
                    let benefits
                    let type
                    let status
                    let vaccancies
                    let responseRate
                    let reviewed
                    let posted
                    let description
                    let companyUrl

                    // Company url
                    try {
                        companyUrl = await this.page.$eval('.jobsearch-CompanyInfoWithoutHeaderImage a', el => el.getAttribute('href').trim())
                    } catch (error) {
                        companyUrl = ''
                    }

                    //Company ratings
                    try {
                        ratings = await this.page.$eval('.jobsearch-CompanyInfoContainer div[aria-label]', el => el.getAttribute('aria-label').trim())
                        const endIndex = ratings.indexOf(" out ");
                        ratings = ratings.substring(0, endIndex);
                    } catch (error) {
                        ratings = ''
                    }

                    //Company reviews and reviews url
                    try {
                        reviews = await this.page.$eval('.jobsearch-CompanyInfoContainer span a', el => el.textContent.trim());
                        reviews = reviews.replace('reviews', '').trim()
                    } catch (error) {
                        reviews = ''
                    }

                    //Salary
                    try {
                        salary = await this.page.$eval('#salaryInfoAndJobType span', el => el.textContent.trim());
                        const rawSalary = await this.page.$eval('#salaryInfoAndJobType span', el => el.textContent.trim());
                        if (rawSalary.includes('month')) {
                            const salaryRegex = /₹([\d,]+)\s*-\s*₹([\d,]+)/;
                            const matches = salaryString1.match(salaryRegex);
                            if (!matches) {
                                console.log('Invalid input format');
                            }
                            const salaryMin = parseInt(matches[1].replace(/,/g, ''));
                            const salaryMax = parseInt(matches[2].replace(/,/g, ''));
                            const yearlySalaryMin = (salaryMin * 12).toLocaleString('en-IN');
                            const yearlySalaryMax = (salaryMax * 12).toLocaleString('en-IN');
                            salary = `₹${yearlySalaryMin} - ₹${yearlySalaryMax}`
                        } else if (rawSalary.includes('Up')) {
                            salary = rawSalary.replace(' a year', '');
                            salary = salary.replace('Up to ', '')
                        } else {
                            salary = rawSalary.replace(' a year', '');
                        }
                    } catch (err) {
                        salary = ''
                    }

                    //Qualifications
                    try {
                        const qelement = await this.page.$$eval('#qualificationsSection > div ul li', el => el.map(el => el.textContent.trim()));
                        qualifications = qelement.join(', ');
                    } catch (err) {
                        qualifications = ''
                    }

                    //Benefits & Perks
                    try {
                        const belement = await this.page.$$eval('#jobDetailsSection .css-1oqmop4 span', el => el.map(el => el.textContent.trim().replace(/,$/, '')));
                        benefits = belement.join(', ');
                    } catch (err) {
                        benefits = ''
                    }

                    //job Tye
                    try {
                        const jelement = await this.page.$$eval('#jobDetailsSection > div', el => el.map(el => el.textContent.trim()));
                        type = jelement.find(el => el.includes('Job type')).replace('Job type', '').trim();

                        if (type.length > 2) {
                            const regex = /(?<!^)(?<![A-Z])\s*[A-Z]/g;
                            type = type.replace(regex, (match) => {
                                if (match.startsWith(" ")) {
                                    return match;
                                } else {
                                    return ", " + match;
                                }
                            });
                        } else {
                            type = ''
                        }
                    } catch (err) {
                        type = ''
                    }

                    //Hiring Insights
                    try {
                        const hiringInsights = await this.page.$$eval('.css-q7fux.eu4oa1w0 > p', el => el.map(el => el.textContent.trim()));
                        status = hiringInsights.find(item => item.includes('hiring')) || '';
                        if (status.includes('Urgently')) {
                            status = 'Apply Soon'
                        }

                        vaccancies = hiringInsights.find(item => item.includes('candidate')) || '';
                        if (vaccancies.includes('candidate')) {
                            vaccancies = vaccancies.match(/Hiring(.*)candidate/)[1].trim()
                        }

                        responseRate = hiringInsights.find(item => item.includes('Application')) || '';
                        if (responseRate.includes('Application')) {
                            responseRate = responseRate.replace('Application response rate: ', '').trim()
                        }

                    } catch (err) {
                        status = ''
                        vaccancies = ''
                        responseRate = ''
                    }

                    //Job Activity
                    try {
                        const jobActivity = await this.page.$$eval('.css-5vsc1i.eu4oa1w0', el => el.map(el => el.textContent.trim()));
                        reviewed = jobActivity.find(item => item.includes('reviewed')) || '';
                        if (reviewed.includes('Employer')) {
                            reviewed = reviewed.replace('Employer reviewed job ', '').trim()
                        }

                        posted = jobActivity.find(item => item.includes('Posted')) || '';
                        if (posted.includes('Posted')) {
                            posted = posted.replace('Posted ', '').trim()
                        }

                    } catch (err) {
                        reviewed = ''
                        posted = ''
                    }

                    //Job Description
                    try {
                        description = await this.page.$eval('#jobDescriptionText', el => el.textContent.trim());
                    } catch (error) {
                        description = ''
                    }

                    const jobItem = {
                        platform, jobId, title, company, location, ratings,
                        reviews, salary, qualifications, benefits, type,
                        status, vaccancies, responseRate, reviewed,
                        posted, jobUrl, companyUrl, description, jobQuery
                    }

                    this.jobs = [...this.jobs, jobItem];
                    console.log(`Job No: ${this.jobs.length}`)

                    if (this.jobs.length == this.maxJobs) break;
                }

                const nextPageButton = await this.page.$('a[data-testid="pagination-page-next"]');
                if (!nextPageButton) break
            }
        } catch (error) {
            console.error(error);
        }
    }

    async start() {
        try {
            console.log(`\nStarting scraper`);

            await this.initialize();
            if (this.config.proxyStatus) {
                await this.connectProxy();
            }

            await this.scrape();
        } catch (error) {
            console.error(error);
        }
    }

    async stop() {
        try {
            await this.browser.close();
            console.log(`Scraper closed`);
        } catch (error) {
            console.error(error);
        }
    }
}


export default Scrape;