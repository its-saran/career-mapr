import axios from 'axios'
import tunnel from 'tunnel';
import utils from '../utils/helper.js';

class Scrape {
    constructor(searchQuery, config, serviceName, serviceType) {
        if (!searchQuery || !config) {
            throw new Error("searchQuery and config parameters are required.");
        }

        // Initialize class properties
        this.config = config.naukri
        this.config.proxyStatus = config.proxyStatus
        this.config.proxy = config.proxy
        this.proxyInfo = 'Not connected';
        this.totalJobs = null;
        this.jobs = []

        this.platform = this.config.serviceName
        this.noOfResults = this.config.noOfResults
        this.delay = this.config.delay
        this.maxTime = this.config.maxSeconds * 1000
        // Check if proxy is enabled in the configuration and create a proxy
        if (this.config.proxyStatus) {
            this.proxy = {
                host: this.config.proxy.host,
                port: this.config.proxy.port,
                proxyAuth: `${this.config.proxy.username}:${this.config.proxy.password}`
        }}

        this.axiosConfig = {
            headers: this.config.headers
        };


        // Set searchQuery properties
        const { jobKeyword, jobLocation, jobExperience, maxJobs, sortBy, startPage} = searchQuery;
        this.jobKeyword = jobKeyword && encodeURIComponent(jobKeyword.toLowerCase());
        this.jobLocation = jobLocation && encodeURIComponent(jobLocation.toLowerCase());
        this.sortBy = sortBy && encodeURIComponent(sortBy.toLowerCase());
        this.jobExperience = jobExperience
        this.maxJobs = maxJobs || this.config.maxJobs;
        this.startPage = startPage || this.config.startPage;

        this.logMessage = (message) => utils.logMessage(serviceName, serviceType, message);
        this.continue = true;

    }
    async initialize() {
        try {
            // this.logMessage(`Initializing scraper`);

            // Configure axios with proxy if available
            if (this.proxy) {
                const agent = tunnel.httpsOverHttp({ proxy: this.proxy })
                this.axiosConfig = { ...this.axiosConfig, httpsAgent: agent }
            }
        } catch (error) {
            throw error
        }
    }
    async checkProxy() {
        try {
            this.logMessage(`Checking proxy..`)
            const proxyCheckUrl = 'https://nordvpn.com/wp-admin/admin-ajax.php?action=get_user_info_data';

            // Get IP information from NORD VPN - IP locator
            const proxyCheckResponse = await axios.get(proxyCheckUrl, this.axiosConfig);
            this.proxyInfo = proxyCheckResponse.data
            // console.log(this.proxyInfo)
            this.logMessage(`Proxy working properly`)
        } catch (error) {
            this.logMessage(`Invalid proxy`);
            this.continue = false;
        }
    }
    async scrape() {
        try {
            const platform = this.platform
            // this.logMessage(`Started scraping ${platform}`)

            let totalJobs = 100// 100 is a placeholder
            let pageNo = this.startPage
            let jobData = []

            for(let i = 0; i <= totalJobs && jobData.length < this.maxJobs; i += this.noOfResults) {
                if (jobData.length === totalJobs) break;
      
                let url = `https://www.naukri.com/jobapi/v3/search?noOfResults=${this.noOfResults}&searchType=adv&pageNo=${pageNo}`
                if (this.jobLocation && this.jobKeyword) {
                    url = url + `&urlType=search_by_key_loc&keyword=${this.jobKeyword}&location=${this.jobLocation}`
                } else if (this.jobLocation && !this.jobKeyword) {
                    url = url + `&urlType=search_by_location&searchType=adv&location=${this.jobLocation}`
                } else if (!this.jobLocation && this.jobKeyword) {
                    url = url + `&urlType=search_by_keyword&keyword=${this.jobKeyword}`
                }
                
                this.jobExperience && (url += `&experience=${this.jobExperience}`);
                this.sortBy && (url += `&sort=${this.sortBy}`);
      
                const response = await axios.get(url, this.axiosConfig);
                const data = response.data
                totalJobs = data.noOfJobs
                this.totalJobs = totalJobs

                this.logMessage(`Expected jobs: ${this.totalJobs}`)
                
                const jobDetials = data.jobDetails
                jobDetials.map(job => {
                    const getReviewsCount = () => {
                      if (typeof(job.ambitionBoxData) !== 'undefined') {
                        return job.ambitionBoxData.ReviewsCount;
                      } else {
                        return ''
                      }
                    } 
                    const getRatings = () => {
                      if (typeof(job.ambitionBoxData) !== 'undefined') {
                        return job.ambitionBoxData.AggregateRating;
                      } else {
                        return ''
                      }
                    } 
      
                    const platform = this.platform
                    const reviews = getReviewsCount()
                    const ratings = getRatings()
                    const jobId = job.jobId
                    const groupId = job.groupId
                    const title = job.title
                    const company = job.companyName
                    const skills = job.tagsAndSkills?.replace(/,/g, ", ") || "";
                    let salary = job.placeholders[1].label === 'Not disclosed' ? '' : job.placeholders[1].label;
                    const postedDate = job.createdDate
                    const jobUrl = `https://www.naukri.com${job.jdURL}`
                    const description = job.jobDescription
                    const experience = job.placeholders[0].label
                    const location = job.placeholders[2].label
                    const companyId = job.companyId
                    const companyUrl = `https://www.naukri.com${job.staticUrl}`
      
                    if (salary.includes('Lacs')) {
                      const salaryParts = salary.split(' Lacs PA')[0].split('-');
                      const minSalary = Number(salaryParts[0]) * 100000;
                      const maxSalary = Number(salaryParts[1]) * 100000;
                      const formattedMinSalary = '₹' + minSalary.toLocaleString('en-IN', { maximumFractionDigits: 0 });
                      const formattedMaxSalary = '₹' + maxSalary.toLocaleString('en-IN', { maximumFractionDigits: 0 });
                      salary = `${formattedMinSalary} - ${formattedMaxSalary}` //PA
                    } 
      
                    if (salary !== '' && salary.includes('PA')) {
                      salary = '₹' + salary.replace('PA', '').trim() 
                    }
      
                    const jobObject = {
                        platform, jobId, title, company, location, ratings,
                        reviews, salary, experience, skills, postedDate, 
                        jobUrl, groupId, companyUrl, companyId, description
                    }
      
                jobData.push(jobObject);
                })
      
                this.logMessage(`Page no: ${pageNo}`)
                pageNo++
                await utils.waitFor(this.delay)
                this.logMessage(`${jobData.length}/${totalJobs} Data extracted`)

                const endTime =  Date.now();
                const elapsedTime = endTime - this.startTime

                // If the elapsed time exceeds one minute, break out of the loop
                if (elapsedTime >= this.maxTime) {
                    this.logMessage(`${elapsedTime/1000} seconds reached`)
                    break;
                }
            }
    
            if (jobData.length <= this.maxJobs ) {
                // this.logMessage(`Total jobs scraped: ${jobData.length}`)
                this.jobs = jobData
            } else {
                const newJobData = jobData.slice(0, this.maxJobs)
                // this.logMessage(`Total jobs scraped: ${newJobData.length}`)
                this.jobs = newJobData
            }
        } catch(error) {
            throw error
        }
    }
    async start() {
        try {
            this.logMessage(`Starting scraper...`);

            // Initialize the search engine
            await this.initialize();

            // Check proxy connection if enabled
            if (this.proxy) {
                await this.checkProxy();
            }

            if (this.continue) {
                await this.scrape();
                this.logMessage(`Scraping completed!`)
            }

        } catch (error) {
            throw error
        }
    }
}


export default Scrape;
