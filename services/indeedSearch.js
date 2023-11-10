import puppeteer from 'puppeteer-extra';
import stealth from 'puppeteer-extra-plugin-stealth';
import path from 'path';


class Search {
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

        this.platform = 'Indeed';
        this.browser = null;
        this.page = null;
        this.proxyInfo = 'Not connected';
        this.totalJobs = null;
        this.jobKeyword = searchQuery.jobKeyword;
        this.jobLocation = searchQuery.jobLocation;
    }

    async initialize() {
        try {
            console.log(`Initializing search engine`);
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

    async search() {

        try {
            const platform = this.platform
            console.log(`Loading ${platform}`)
            let url = `https://in.indeed.com/jobs?`

            if (this.jobLocation && this.jobKeyword) {
                url = url + `q=${this.jobKeyword}&l=${this.jobLocation}`
            } else if (jobLocation && !jobKeyword) {
                url = url + `l=${this.jobLocation}`
            } else if (!jobLocation && jobKeyword) {
                url = url + `q=${this.jobKeyword}`
            }

            await this.page.goto(url);
            await this.page.waitForSelector('.jobsearch-JobCountAndSortPane-jobCount', { timeout: 60000 })
            this.totalJobs = await this.page.$eval('.jobsearch-JobCountAndSortPane-jobCount', el => el.textContent.replace(/\D/g, ''))
        } catch (error) {
            console.error(error);
        }
    }

    async start() {
        try {
            console.log(`\nStarting search`);

            await this.initialize();
            if (this.config.proxyStatus) {
                await this.connectProxy();
            }

            await this.search();
        } catch (error) {
            console.error(error);
        }
    }

    async stop() {
        try {
            await this.browser.close();
            console.log(`Search engine closed`);
        } catch (error) {
            console.error(error);
        }
    }
}


export default Search;