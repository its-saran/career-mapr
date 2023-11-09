import axios from 'axios'
import tunnel from 'tunnel';

class Search {
    constructor(searchQuery, config) {
        if (!searchQuery || !config) {
            throw new Error("searchQuery and config parameters are required.");
        }

        // Initialize class properties
        this.platform = "Naurki"
        this.proxyInfo = 'Not connected';
        this.totalJobs = null;

        // Check if proxy is enabled in the configuration and create a proxy
        if (config.proxyStatus) {
            this.proxy = {
                host: config.proxy.host,
                port: config.proxy.port,
                proxyAuth: `${config.proxy.username}:${config.proxy.password}`
        }}

        this.axiosConfig = {
            headers: config.headers
        };

        // Encode and assign the encoded lowercase job keyword and location from the search query
        this.jobKeyword = searchQuery.jobKeyword && encodeURIComponent(searchQuery.jobKeyword.toLowerCase());
        this.jobLocation = searchQuery.jobLocation && encodeURIComponent(searchQuery.jobLocation.toLowerCase());
        this.jobExperience = searchQuery.jobExperience
    }
    async initialize() {
        try {
            console.log(`Initializing search engine`);

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
            console.log(`Checking proxy..`)
            const proxyCheckUrl = 'https://nordvpn.com/wp-admin/admin-ajax.php?action=get_user_info_data';

            // Get IP information from NORD VPN - IP locator
            const proxyCheckResponse = await axios.get(proxyCheckUrl, this.axiosConfig);
            this.proxyInfo = proxyCheckResponse.data
            console.log(this.proxyInfo)
            console.log(`Proxy working properly`)
        } catch (error) {
            throw error
        }
    }
    async search() {
        try {
            console.log(`Started searching on ${this.platform}`)

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
            console.log(url)

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
            console.log(`Starting search`);
            
            // Initialize the search engine
            await this.initialize();
            // Check proxy connection if enabled
            if (this.proxy) {
                await this.checkProxy();
            }

            // Perform the search
            await this.search();
        } catch (error) {
            throw error
        }
    }
}

export default Search;





