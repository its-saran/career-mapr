import { serviceController } from './controllers/serviceController.js';

const jobConfig = {
    searchQuery: {
        jobKeyword: "Python", 
        jobLocation: "chennai",
        maxJobs: 5
    },
    serviceName : "all",
    serviceType : "scrape",
}
const ouputConfig = {
    fileName : "jobs",
    fileType : "xlsx",
}


await serviceController(jobConfig, ouputConfig);









