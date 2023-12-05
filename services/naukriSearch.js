import axios from 'axios'
import tunnel from 'tunnel';
import utils from "../utils/helper.js";

class Search {
    constructor(searchQuery, config, serviceName, serviceType) {
        // Initialize class properties
        this.config = config.naukri
        this.config.proxyStatus = config.proxyStatus
        this.config.proxy = config.proxy
        this.platform = "Naurki"
        this.proxyInfo = 'Not connected';
        this.totalJobs = null;

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

        // Encode and assign the encoded lowercase job keyword and location from the search query
        this.jobKeyword = searchQuery.jobKeyword && encodeURIComponent(searchQuery.jobKeyword.toLowerCase());
        this.jobLocation = searchQuery.jobLocation && encodeURIComponent(searchQuery.jobLocation.toLowerCase());
        this.jobExperience = searchQuery.jobExperience

        this.logMessage = (message) => utils.logMessage(serviceName, serviceType, message);
        this.continue = true;
    }
    async initialize() {
        try {
            // this.logMessage(`Initializing search engine`);

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
    async search() {
        try {
            // this.logMessage(`Started searching on ${this.platform}`)

            const pageNo = 1
            let url = `https://www.naukri.com/jobapi/v3/search?searchType=adv&pageNo=${pageNo}`
            if (this.jobLocation && this.jobKeyword) {
                url = url + `&urlType=search_by_key_loc&keyword=${this.jobKeyword}&location=${this.jobLocation}`
            } else if (this.jobLocation && !this.jobKeyword) {
                url = url + `&urlType=search_by_location&searchType=adv&location=${this.jobLocation}`
            } else if (!this.jobLocation && this.jobKeyword) {
                url = url + `&urlType=search_by_keyword&keyword=${this.jobKeyword}`
            }
            this.jobExperience !== undefined && (url += `&experience=${this.jobExperience}`);
            // this.logMessage(url)

            // Send a request to the Naukri job search URL
            const response = await axios.get(url, this.axiosConfig);
            const data = response.data
            this.totalJobs = data.noOfJobs
        } catch (error) {
            throw error
        }
    }
    async start() {
        try {
            this.logMessage(`Starting search...`);
            
            // Initialize the search engine
            await this.initialize();
            // Check proxy connection if enabled
            if (this.proxy) {
                await this.checkProxy();
            }

            if (this.continue) {
                // Perform the search
                await this.search();
                this.logMessage(`Search finished!`);
                this.logMessage(`Total jobs: ${this.totalJobs}`);
            }

        } catch (error) {
            throw error
        }
    }
}

export default Search;





