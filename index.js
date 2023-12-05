import { serviceController } from './controllers/serviceController.js';

const jobConfig = {
    searchQuery: {
        jobKeyword: "python", 
        jobLocation: "chennai",
        maxJobs: 5
    },
    serviceName : "all",
    serviceType : "scrape",
}
const ouputConfig = {
    fileName : "jobs",
    fileType : "json",
}


await serviceController(jobConfig, ouputConfig);









