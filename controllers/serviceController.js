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
            console.log(this.searchQuery);
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
                    console.log(`Searching Naukri...`);
                    this.search = new naukriSearch(this.searchQuery, this.config);
                    await this.search.start();
                } else if (this.serviceName === 'linkedin') {
                    console.log(`Searching Linkedin...`);  
                    this.search = new linkedinSearch(this.searchQuery, this.config);
                    await this.search.start();
                } else if (this.serviceName === 'indeed') {
                    console.log(`Searching Indeed...`);
                    this.search = new indeedSearch(this.searchQuery, this.config);
                    await this.search.start();
                    await this.search.stop();
                }
                
                console.log(`Search Finished`);
                console.log(`Total jobs: ${this.search.totalJobs}`);
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
                    console.log(`Scraping Naukri...`);
                    this.scrape = new naukriScrape(this.searchQuery, this.config);
                    await this.scrape.start();
                } else if (this.serviceName === 'linkedin') {
                    console.log(`Scraping Linkedin...`);  
                    this.scrape = new linkedinScrape(this.searchQuery, config);
                    await this.scrape.start();
                    await this.scrape.stop();
                } else if (this.serviceName === 'indeed') {
                    console.log(`Scraping Indeed...`);
                    this.scrape = new indeedScrape(this.searchQuery, this.config);
                    await this.scrape.start();
                    await this.scrape.stop();
                }
    
                console.log(`Scraping Finished`);
                this.controllerStatus.startScrape = true
            } catch (error) {
                throw error;
            }
        }
    }
    async writeFile(JSObject, folderPath, fileName, fileType) {
        if (fileType === '.json') {
            fileName = fileName+fileType
            utils.createJSON(JSObject, folderPath, fileName)
        } else {
            console.log('Therewas an error writing file')
        }
    }
}

export const serviceController = async (searchQuery, serviceName, serviceType, folderPath, fileName, fileType) => {

    let serviceNames = ['naukri', 'linkedin', 'indeed']
    let serviceTypes = ['search', 'scrape']

    serviceName = serviceName.toLowerCase();
    serviceType = serviceType.toLowerCase();

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
            console.log(controller.search.totalJobs)
        } else {
            await controller.startScrape();
            await controller.writeFile(controller.scrape.jobs, folderPath, fileName, fileType)
        }

    } catch (error) {
        console.log(error)
        console.log(controller.controllerStatus)
    }
    return null;
}
