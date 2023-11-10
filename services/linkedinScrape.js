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
        this.config = config.linkedin
        this.launchOptions = {
            headless: 'new',
            executablePath: path.resolve(config.chromePath),
            args: ['--start-maximized']
        };

        this.platform = 'Linkedin';
        this.browser = null;
        this.page = null;
        this.proxyInfo = 'Not connected';
        this.jobs = [];
        this.totalJobs = null;
        this.proxy = {};

        // Check if proxy configuration is provided and proxy is enabled
        if (this.config.proxy && this.config.proxyStatus) {
            this.browserLaunchOptions.args.push(`--proxy-server=http://${this.config.proxy.host}:${this.config.proxy.port}`);
            this.proxy.username = this.config.proxy.username;
            this.proxy.password = this.config.proxy.password;
        }


        // Set configuration properties from the config object
        this.startPage = this.config.startPage;
        this.maxJobs = this.config.maxJobs;
        this.userAgent = this.config.userAgent;
        this.viewportSize = this.config.viewportSize;

        // Set searchQuery properties
        const { jobKeyword, jobLocation, maxJobs, startPage } = searchQuery;
        this.jobKeyword = jobKeyword;
        this.jobLocation = jobLocation;

        // Override maxJobs and startPage if provided in the searchQuery
        if (maxJobs) this.maxJobs = maxJobs;
        if (startPage) this.startPage = startPage;
    }

    async initialize() {
        try {
            console.log(`Initializing scraper`);

            // Initialize browser
            puppeteer.use(stealth());
            this.browser = await puppeteer.launch(this.launchOptions);
            this.page = await this.browser.newPage();
            await this.page.setUserAgent(this.userAgent);
            await this.page.setViewport(this.viewportSize);
        } catch (error) {
            throw error
        }
    }

    async checkProxy() {
        try {
            console.log('Checking proxy....')
            // Authenticate proxy
            await this.page.authenticate({ username: this.proxy.username, password: this.proxy.password });
            // Get IP information from NORD VPN - IP locator
            const proxyCheckUrl = 'https://nordvpn.com/wp-admin/admin-ajax.php?action=get_user_info_data';
            await this.page.goto(proxyCheckUrl);

            const proxyInfo = await this.page.evaluate(async () => {
                const response = await fetch(window.location.href);
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return response.json();
                }
                return null;
            });
            this.proxyInfo = proxyInfo
            console.log(`Proxy working properly`)
        } catch (error) {
            throw error
        }
    }

    async scrape() {
        try {

            console.log(`Loading ${this.platform}`)
            let url = `https://in.linkedin.com/jobs/search?position=1&pageNum=1`
            
            // Append job keyword and/or location to the URL if provided
            if (this.jobLocation && this.jobKeyword) {
                url = url + `&keywords=${this.jobKeyword}&location=${this.jobLocation}`
            } else if (this.jobLocation && !this.jobKeyword) {
                url = url + `&location=${this.jobLocation}`
            } else if (!this.jobLocation && this.jobKeyword) {
                url = url + `&keywords=${this.jobKeyword}`
            }

            await this.page.goto(url);

            await this.page.waitForSelector('.jobs-search__results-list', {timeout: 60000});
            this.totalJobs = await this.page.$eval('.results-context-header__job-count', el => el.textContent.trim())
            console.log(`Total jobs: ${this.totalJobs}`)
    
            const viewedAll = '.see-more-jobs__viewed-all.hidden'
            const loadMore = 'button.infinite-scroller__show-more-button--visible'
    
            let selectorFound = true;
            let pageNo = 0;
            let extractedItems
    
            while (selectorFound) {
                if (extractedItems >= this.maxJobs) {
                    console.log('Max jobs listed')
                    break;
                }
        
                try {
                    await this.page.waitForSelector(viewedAll, { timeout: 5000 });
                    await this.page.evaluate(() => {
                        window.scrollTo(0, document.body.scrollHeight);
                    });
        
                    try {
                        await this.page.waitForSelector(loadMore, {timeout: 3000});
                        pageNo++
        
                        await utils.waitFor(3000)
                        await this.page.click(loadMore)
        
                        const jobItems = await this.page.$$('.job-search-card')
                        extractedItems = jobItems.length
                        console.log(`Page No: ${pageNo}, total: ${extractedItems} jobs found`)
        
                    } catch (error) {
                        pageNo++
                        const jobItems = await this.page.$$('.job-search-card')
                        extractedItems = jobItems.length
                        this.errorMessage(`Page No: ${pageNo}, total: ${extractedItems} jobs found`)
        
                    }
                } catch (error) {
                    console.log('You\'ve loaded all jobs for this search');
                    selectorFound = false;
                }
            }
    
    
            const jobItems = await this.page.$$('.jobs-search__results-list > li')
            let i = 0
    
            for (const job of jobItems) {
                if (i >= this.maxJobs) {
                    console.log('Max jobs extracted')
                    break; 
                }
                await job.click();
                await utils.waitFor(3000)
                await this.page.waitForSelector('.show-more-less-html__markup')
    
                let salary
                let status
                let applicants
                let description
                let location
    
                const title = await job.$eval('.base-search-card__title', el => el.textContent.trim());
                const company = await job.$eval('.base-search-card__subtitle', el => el.textContent.trim());
                location = await job.$eval('.job-search-card__location', el => el.textContent.trim());
                const posted = await job.$eval('time[datetime]', el => el.textContent.trim());
                const jobUrl = await job.$eval('a[data-tracking-control-name="public_jobs_jserp-result_search-card"]', el => el.getAttribute('href').trim())
                const jobId = jobUrl.match(/-(\d+)\?/)?.[1];
    
                //location
                if(location.includes('India')) {
                    location = location.replace(', India', '')
                }
    
                //Salary
                try {
                    salary = await job.$eval('.job-search-card__salary-info', el => el.textContent.trim())
                } catch (error) {
                    salary = ''
                }
    
                //status
                try {
                    status = await job.$eval('.result-benefits__text', el => el.textContent.trim())
                    if(status.includes('early')){
                        status = 'Apply Soon'
                    }                
                    if(status.includes('Actively')){
                        status = 'Open'
                    }
    
                } catch (error) {
                    status = ''
                }
                
                //Applicants
                try {
                    applicants = await this.page.$eval('.num-applicants__caption', el => el.textContent.trim())
                    applicants = applicants.replace(' applicants', '')
    
                    if(applicants.includes('among')){
                    applicants = applicants.replace('Be among the first ', 'First ')
                    }
    
                    if(applicants.includes('Over')){
                    applicants = applicants.replace('Over ', '')
                    applicants = applicants.concat('+')
                    }
    
                } catch (error) {
                    applicants = ''
                }
    
                //Description
                try {
                    description = await this.page.$eval('.show-more-less-html__markup', el => el.textContent.trim())
                } catch (error) {
                    description = ''
                }
    
                //Criteria
                const jobCriteria = await this.page.$$eval('.description__job-criteria-item', elements => elements.map(el => el.innerText.trim()));
    
                const rawSeniority = jobCriteria.find(item => item.includes('Seniority level'));
                const rawType = jobCriteria.find(item => item.includes('Employment type'));
                const rawFunction = jobCriteria.find(item => item.includes('Job function'));
                const rawIndustries = jobCriteria.find(item => item.includes('Industries'));
                
                const seniority = rawSeniority ? rawSeniority.replace('Seniority level\n', '').trim() : '';
                const type = rawType ? rawType.replace('Employment type\n', '').trim() : '';
                const functions = rawFunction ? rawFunction.replace('Job function\n', '').trim() : '';
                const industries = rawIndustries ? rawIndustries.replace('Industries\n', '').trim() : '';
                const platform = this.platform

                const jobItem = {
                    platform, jobId, title, company, location, salary,
                    posted, status, applicants, seniority, type, 
                    functions, industries, jobUrl, description
                }
    
                this.jobs = [...this.jobs, jobItem];
                i++
                console.log(`Job No: ${i}`)
    
            }
            console.log(`Scraping ${this.platform} completed!`)
        } catch (error) {
            throw error
        }
    }

    async start() {
        try {
            console.log(`Starting scraper`);

            await this.initialize();
            if (this.config.proxyStatus) {
                await this.checkProxy();
            }

            await this.scrape();
        } catch (error) {
            throw error
        }
    }

    async stop() {
        try {
            await this.browser.close();
            console.log('Scraper closed');
        } catch (error) {
            throw error
        }
    }
}


export default Scrape;
