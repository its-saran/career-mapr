import Scrape from "../services/naukriScrape.js";
import Search from "../services/naukriSearch.js";
import proxy from '../config/proxy.json' assert { type: "json" };


class Controller {
    constructor(config, searchQuery, serviceType) {
        this.serviceType = serviceType
        this.config = config
        this.searchQuery = searchQuery
        this.controllerStatus = {
            checkQueries: null,
            checkConfig: null,
            getProxyInfo: null,
            startSearch: null,
            startScrape: null,
        }
        this.start();
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
            if (this.config) {
                this.controllerStatus.checkConfig = true
            }
        } else {
            console.log(`Error: Configuration not found`);
        }
    }
    async getProxyInfo() {
        if (this.controllerStatus.checkConfig) {
            if (this.config.proxyStatus) {
                this.config.proxy = proxy
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
                this.search = new Search(this.searchQuery, this.config);
                await this.search.start();
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
                this.scrape = new Scrape(this.searchQuery, this.config);
                await this.scrape.start();
                console.log(`Scraping Finished`);
                console.log(this.scrape.jobs);
                this.controllerStatus.startScrape = true
            } catch (error) {
                throw error;
            }
        }
    }
    async start() {
        console.log(`Keyword: ${this.searchQuery.jobKeyword}, Location: ${this.searchQuery.jobLocation}`);
        console.log(`Running Naukri ${this.serviceType}`);

        await this.checkQueries()
        try {
            await this.checkConfig()
            await this.getProxyInfo()
            if (this.serviceType === "search") {
                await this.startSearch();
                console.log()
            } else {
                await this.startScrape();
            }

        } catch (error) {
            console.log(error)
            console.log(this.controllerStatus)
        }
    }
}

export const naukriController =  (config, searchQuery, serviceType) => new Controller (config, searchQuery, serviceType)

