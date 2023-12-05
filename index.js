import { serviceController } from './controllers/serviceController.js';

const jobConfig = {
    searchQuery: {
        jobKeyword: "python", 
        jobLocation: "kochi",
        maxJobs: 20
    },
    serviceName : "indeed",
    serviceType : "scrape",
}
const ouputConfig = {
    fileName : "jobs",
    fileType : "json",
}


await serviceController(jobConfig, ouputConfig);









