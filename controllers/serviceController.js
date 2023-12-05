import naukriScrape from "../services/naukriScrape.js";
import naukriSearch from "../services/naukriSearch.js";
import linkedinScrape from "../services/linkedinScrape.js";
import linkedinSearch from "../services/linkedinSearch.js";
import indeedScrape from "../services/indeedScrape.js";
import indeedSearch from "../services/indeedSearch.js";
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
        this.logMessage = (message) => utils.logMessage(this.serviceName, this.serviceType, message);
        this.continue = true;

    }
    async checkQueries() {
        if(this.searchQuery.jobKeyword || this.searchQuery.jobLocation) {
            this.controllerStatus.checkQueries = true
        } else {
            this.logMessage(`Error: Insufficient parameters`)
        }
    }
    async checkConfig() {
        if(this.controllerStatus.checkQueries) {
            if (config) {
                this.controllerStatus.checkConfig = true
            }
        } else {
            this.logMessage(`Error: Configuration not found`);
        }
    }
    async getProxyInfo() {
        if (this.controllerStatus.checkConfig) {
            if (config.proxyStatus) {
                this.config.proxy = utils.getProxyJSON()
                this.logMessage("Proxy Enabled")
            } else {
                this.logMessage("Proxy not enabled")
            }
            this.controllerStatus.getProxyInfo = true
        } else {
            this.logMessage(`Error: Unable to get proxy info`);
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
                    this.logMessage(utils.objectToString(filteredQueries));

                    this.search = new naukriSearch(filteredQueries, this.config, this.serviceName, this.serviceType);
                    await this.search.start();

                } else if (this.serviceName === 'linkedin') {

                    const supportedQueries = {
                        jobKeyword: this.searchQuery.jobKeyword,
                        jobLocation: this.searchQuery.jobLocation,
                        jobExperience: this.searchQuery.jobExperience
                    }

                    const filteredQueries = utils.filterObject(supportedQueries)
                    this.logMessage(utils.objectToString(filteredQueries));

                    this.search = new linkedinSearch(filteredQueries, this.config, this.serviceName, this.serviceType);
                    await this.search.start();

                } else if (this.serviceName === 'indeed') {

                    const supportedQueries = {
                        jobKeyword: this.searchQuery.jobKeyword,
                        jobLocation: this.searchQuery.jobLocation,
                    }

                    const filteredQueries = utils.filterObject(supportedQueries)
                    this.logMessage(utils.objectToString(filteredQueries));

                    this.search = new indeedSearch(filteredQueries, this.config, this.serviceName, this.serviceType);
                    await this.search.start();
                    await this.search.stop();

                } else if (this.serviceName === 'all') {

                    const supportedQueries = {
                        jobKeyword: this.searchQuery.jobKeyword,
                        jobLocation: this.searchQuery.jobLocation,
                    }

                    const filteredQueries = utils.filterObject(supportedQueries)
                    this.logMessage(utils.objectToString(filteredQueries));


                    this.naukriSearch =  new naukriSearch(filteredQueries, this.config, 'naukri', this.serviceType);
                    await this.naukriSearch.start();
                    this.linkedinSearch =  new linkedinSearch(filteredQueries, this.config, 'linkedin', this.serviceType);
                    await this.linkedinSearch.start();
                    this.indeedSearch =  new indeedSearch(filteredQueries, this.config, 'indeed', this.serviceType);
                    await this.indeedSearch.start();
                    await this.indeedSearch.stop();

                    this.totalJobs = {
                        Naukri: `${this.naukriSearch.totalJobs}`,
                        Linkedin: `${this.linkedinSearch.totalJobs}`,
                        Indeed: `${this.indeedSearch.totalJobs}`
                    }
                    this.logMessage(utils.objectToString(this.totalJobs))
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
                    this.logMessage(utils.objectToString(filteredQueries));

                    this.scrape = new naukriScrape(filteredQueries, this.config, this.serviceName, this.serviceType);
                    await this.scrape.start();

                    this.jobs = this.scrape.jobs

                    if (!this.scrape.continue) {
                        this.continue = false;
                    }

                } else if (this.serviceName === 'linkedin') { 

                    const supportedQueries = {
                        jobKeyword: this.searchQuery.jobKeyword,
                        jobLocation: this.searchQuery.jobLocation,
                        jobExperience: this.searchQuery.jobExperience,
                        maxJobs: this.searchQuery.maxJobs,
                        startPage: this.searchQuery.startPage
                    }

                    const filteredQueries = utils.filterObject(supportedQueries)
                    this.logMessage(utils.objectToString(filteredQueries));

                    this.scrape = new linkedinScrape(filteredQueries, this.config, this.serviceName, this.serviceType);
                    await this.scrape.start();
                    await this.scrape.stop();

                    this.jobs = this.scrape.jobs

                    if (!this.scrape.continue) {
                        this.continue = false;
                    }

                } else if (this.serviceName === 'indeed') {

                    const supportedQueries = {
                        jobKeyword: this.searchQuery.jobKeyword,
                        jobLocation: this.searchQuery.jobLocation,
                        maxJobs: this.searchQuery.maxJobs,
                        startPage: this.searchQuery.startPage
                    }

                    const filteredQueries = utils.filterObject(supportedQueries)
                    this.logMessage(utils.objectToString(filteredQueries));

                    this.scrape = new indeedScrape(filteredQueries, this.config, this.serviceName, this.serviceType);
                    await this.scrape.start();
                    await this.scrape.stop();

                    this.jobs = this.scrape.jobs

                    if (!this.scrape.continue) {
                        this.continue = false;
                    }

                } else if (this.serviceName === 'all') {

                    const supportedQueries = {
                        jobKeyword: this.searchQuery.jobKeyword,
                        jobLocation: this.searchQuery.jobLocation,
                        maxJobs: this.searchQuery.maxJobs,
                    }

                    const filteredQueries = utils.filterObject(supportedQueries)
                    this.logMessage(utils.objectToString(filteredQueries));

                    this.naukriScrape =  new naukriScrape(filteredQueries, this.config, 'naurki', this.serviceType);
                    await this.naukriScrape.start();
                    this.linkedinScrape =  new linkedinScrape(filteredQueries, this.config, 'linkedin', this.serviceType);
                    await this.linkedinScrape.start();
                    await this.linkedinScrape.stop();
                    this.indeedScrape =  new indeedScrape(filteredQueries, this.config, 'indeed', this.serviceType);
                    await this.indeedScrape.start();
                    await this.indeedScrape.stop();

                    this.jobs = [ ...this.naukriScrape.jobs, ...this.linkedinScrape.jobs, ...this.indeedScrape.jobs,]

                    if (!this.naukriScrape.continue || !this.linkedinScrape.continue || !this.indeedScrape.continue) {
                        this.continue = false;
                    }

                }
    
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

    const timeLog = (message) => utils.timeLog(message)

    let serviceNames = ['naukri', 'linkedin', 'indeed', 'all']
    let serviceTypes = ['search', 'scrape']

    const searchQuery = jobConfig.searchQuery
    const serviceName = jobConfig.serviceName.toLowerCase();
    const serviceType = jobConfig.serviceType.toLowerCase();


    if (!serviceNames.includes(serviceName)) {
        timeLog('Invalid Service name')
        return null;
    }

    if (!serviceTypes.includes(serviceType)) {
        timeLog('Invalid Service type')
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
            if (controller.continue) {
                await controller.writeFile(outputConfig, controller.jobs)
            }
        }

    } catch (error) {
        console.log(error)
        console.log(controller.controllerStatus)
    }
    return null;
}
