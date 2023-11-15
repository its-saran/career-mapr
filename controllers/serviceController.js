import naukriScrape from "../services/naukriScrape.js";
import naukriSearch from "../services/naukriSearch.js";
import linkedinScrape from "../services/linkedinScrape.js";
import linkedinSearch from "../services/linkedinSearch.js";
import indeedScrape from "../services/indeedScrape.js";
import indeedSearch from "../services/indeedSearch.js";
import proxy from '../config/proxy.json' assert { type: "json" };
import config from '../config/config.json' assert { type: "json" };
import utils from "../utils/helper.js";

class Controller {
    constructor(searchQuery, serviceName, serviceType) {
        this.searchQuery = searchQuery
        this.serviceName = serviceName
        this.serviceType = serviceType
        this.config = config
        this.controllerStatus = {
            checkQueries: null,
            checkConfig: null,
            getProxyInfo: null,
            startSearch: null,
            startScrape: null,
        }

    }
    async checkQueries() {
        if(this.searchQuery.jobKeyword || this.searchQuery.jobLocation) {
            this.controllerStatus.checkQueries = true
        } else {
            console.log(`Error: Insufficient parameters`);
        }
    }
    async checkConfig() {
        if(this.controllerStatus.checkQueries) {
            if (config) {
                this.controllerStatus.checkConfig = true
            }
        } else {
            console.log(`Error: Configuration not found`);
        }
    }
    async getProxyInfo() {
        if (this.controllerStatus.checkConfig) {
            if (config.proxyStatus) {
                config.proxy = proxy
                console.log("Proxy Enabled")
            } else {
                console.log("Proxy not enabled")
            }
            this.controllerStatus.getProxyInfo = true
        } else {
            console.log(`Error: Unable to get proxy info`);
        }
    }
    async startSearch() {
        if (this.controllerStatus.getProxyInfo) {
            try {

                if (this.serviceName === 'naukri') {
                    const supportedQueries = {
                        jobKeyword: this.searchQuery.jobKeyword,
                        jobLocation: this.searchQuery.jobLocation,
                        jobExperience: this.searchQuery.jobExperience
                    }

                    const filteredQueries = utils.filterObject(supportedQueries)
                    console.log(filteredQueries);

                    this.search = new naukriSearch(filteredQueries, this.config);
                    await this.search.start();
                    console.log(this.search.totalJobs)

                } else if (this.serviceName === 'linkedin') {

                    const supportedQueries = {
                        jobKeyword: this.searchQuery.jobKeyword,
                        jobLocation: this.searchQuery.jobLocation,
                        jobExperience: this.searchQuery.jobExperience
                    }

                    const filteredQueries = utils.filterObject(supportedQueries)
                    console.log(filteredQueries);

                    this.search = new linkedinSearch(filteredQueries, this.config);
                    await this.search.start();
                    console.log(this.search.totalJobs)

                } else if (this.serviceName === 'indeed') {

                    const supportedQueries = {
                        jobKeyword: this.searchQuery.jobKeyword,
                        jobLocation: this.searchQuery.jobLocation,
                    }

                    const filteredQueries = utils.filterObject(supportedQueries)
                    console.log(filteredQueries);

                    this.search = new indeedSearch(filteredQueries, this.config);
                    await this.search.start();
                    await this.search.stop();
                    console.log(this.search.totalJobs)

                } else if (this.serviceName === 'all') {

                    const supportedQueries = {
                        jobKeyword: this.searchQuery.jobKeyword,
                        jobLocation: this.searchQuery.jobLocation,
                    }

                    const filteredQueries = utils.filterObject(supportedQueries)
                    console.log(filteredQueries);


                    this.naukriSearch =  new naukriSearch(filteredQueries, this.config);
                    await this.naukriSearch.start();
                    this.linkedinSearch =  new linkedinSearch(filteredQueries, this.config);
                    await this.linkedinSearch.start();
                    this.indeedSearch =  new indeedSearch(filteredQueries, this.config);
                    await this.indeedSearch.start();
                    await this.indeedSearch.stop();

                    this.totalJobs = {
                        Naukri: `${this.naukriSearch.totalJobs}`,
                        Linkedin: `${this.linkedinSearch.totalJobs}`,
                        Indeed: `${this.indeedSearch.totalJobs}`
                    }
                    console.log(this.totalJobs)
                }
                
                this.controllerStatus.startSearch = true
            } catch (error) {
                console.log(error)
            }
        }
    }
    async startScrape() {
        if (this.controllerStatus.getProxyInfo) {
            try {

                if (this.serviceName === 'naukri') {

                    const supportedQueries = {
                        jobKeyword: this.searchQuery.jobKeyword,
                        jobLocation: this.searchQuery.jobLocation,
                        jobExperience: this.searchQuery.jobExperience,
                        sortBy: this.searchQuery.sortBy,
                        maxJobs: this.searchQuery.maxJobs,
                        startPage: this.searchQuery.startPage
                    }

                    const filteredQueries = utils.filterObject(supportedQueries)
                    console.log(filteredQueries);

                    this.scrape = new naukriScrape(filteredQueries, this.config);
                    await this.scrape.start();

                    this.jobs = this.scrape.jobs

                } else if (this.serviceName === 'linkedin') { 

                    const supportedQueries = {
                        jobKeyword: this.searchQuery.jobKeyword,
                        jobLocation: this.searchQuery.jobLocation,
                        jobExperience: this.searchQuery.jobExperience,
                        maxJobs: this.searchQuery.maxJobs,
                        startPage: this.searchQuery.startPage
                    }

                    const filteredQueries = utils.filterObject(supportedQueries)
                    console.log(filteredQueries);

                    this.scrape = new linkedinScrape(filteredQueries, config);
                    await this.scrape.start();
                    await this.scrape.stop();

                    this.jobs = this.scrape.jobs

                } else if (this.serviceName === 'indeed') {

                    const supportedQueries = {
                        jobKeyword: this.searchQuery.jobKeyword,
                        jobLocation: this.searchQuery.jobLocation,
                        maxJobs: this.searchQuery.maxJobs,
                        startPage: this.searchQuery.startPage
                    }

                    const filteredQueries = utils.filterObject(supportedQueries)
                    console.log(filteredQueries);

                    this.scrape = new indeedScrape(filteredQueries, this.config);
                    await this.scrape.start();
                    await this.scrape.stop();

                    this.jobs = this.scrape.jobs

                } else if (this.serviceName === 'all') {

                    const supportedQueries = {
                        jobKeyword: this.searchQuery.jobKeyword,
                        jobLocation: this.searchQuery.jobLocation,
                        maxJobs: this.searchQuery.maxJobs,
                    }

                    const filteredQueries = utils.filterObject(supportedQueries)
                    console.log(filteredQueries);

                    this.naukriScrape =  new naukriScrape(filteredQueries, this.config);
                    await this.naukriScrape.start();
                    this.linkedinScrape =  new linkedinScrape(filteredQueries, this.config);
                    await this.linkedinScrape.start();
                    await this.linkedinScrape.stop();
                    this.indeedScrape =  new indeedScrape(filteredQueries, this.config);
                    await this.indeedScrape.start();
                    await this.indeedScrape.stop();

                    this.jobs = [ ...this.naukriScrape.jobs, ...this.linkedinScrape.jobs, ...this.indeedScrape.jobs,]
                }
    
                console.log(`Scraping Finished`);
                this.controllerStatus.startScrape = true
            } catch (error) {
                throw error;
            }
        }
    }
    async writeFile(ouputConfig, data) {
        const fileType = ouputConfig.fileType
        if (fileType === 'json') {
            utils.createJSON(ouputConfig, data)
        } else if (fileType === 'xlsx') {
            utils.createXLSX(ouputConfig, data)
        } else if (fileType === 'csv') {
            utils.createCSV(ouputConfig, data)
        }
    }
}

export const serviceController = async (jobConfig, outputConfig) => {

    let serviceNames = ['naukri', 'linkedin', 'indeed', 'all']
    let serviceTypes = ['search', 'scrape']

    const searchQuery = jobConfig.searchQuery
    const serviceName = jobConfig.serviceName.toLowerCase();
    const serviceType = jobConfig.serviceType.toLowerCase();

    if (!serviceNames.includes(serviceName)) {
        console.log('Invalid Service name')
        return null;
    }

    if (!serviceTypes.includes(serviceType)) {
        console.log('Invalid Service type')
        return null;
    }

    const controller = new Controller(searchQuery, serviceName, serviceType);
    await controller.checkQueries()
    try {
        await controller.checkConfig()
        await controller.getProxyInfo()
        if (serviceType === "search") {
            await controller.startSearch();
        } else {
            await controller.startScrape();
            await controller.writeFile(outputConfig, controller.jobs)
        }

    } catch (error) {
        console.log(error)
        console.log(controller.controllerStatus)
    }
    return null;
}
