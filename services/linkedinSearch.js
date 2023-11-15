import axios from 'axios'
import tunnel from 'tunnel';
import { load } from 'cheerio';
import utils from '../utils/helper.js'


class Search {
    constructor(searchQuery, config, serviceName, serviceType) {
        if (!searchQuery || !config) {
            throw new Error("searchQuery and config parameters are required.");
        }

        // Initialize class properties
        this.config = config.linkedin
        this.platform = 'Linkedin';
        this.proxyInfo = 'Not connected';
        this.totalJobs = null;

        //Check if proxy is enabled in the configuration and create a proxy
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

        this.logMessage = (message) => utils.logMessage(serviceName, serviceType, message);
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
            this.logMessage(`Proxy working properly`)
        } catch (error) {
            throw error
        }
    }

    async search() {
        try {
            // this.logMessage(`Started searching on ${this.platform}`)
            let url = `https://in.linkedin.com/jobs/search?position=1&pageNum=1`

            // Append job keyword and/or location to the URL if provided
            if (this.jobLocation && this.jobKeyword) {
                url = url + `&keywords=${this.jobKeyword}&location=${this.jobLocation}`
            } else if (this.jobLocation && !this.jobKeyword) {
                url = url + `&location=${this.jobLocation}`
            } else if (!this.jobLocation && this.jobKeyword) {
                url = url + `&keywords=${this.jobKeyword}`
            }
            // this.logMessage(url)

            // Send a request to the LinkedIn job search URL
            const response = await axios.get(url, this.axiosConfig);
            const html = response.data

            // Load the HTML data into a Cheerio object
            const $ = load(html);
            const jobCountElement = $('.results-context-header__job-count');

            this.totalJobs = jobCountElement.text();

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

            // Perform the search
            await this.search();
            this.logMessage(`Search finished!`);
            this.logMessage(`Total jobs: ${this.totalJobs}`);
        } catch (error) {
            throw error
        }
    }
}

export default Search;
