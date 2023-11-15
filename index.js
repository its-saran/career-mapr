import { serviceController } from './controllers/serviceController.js';

const jobConfig = {
    searchQuery: {
        jobKeyword: "Python", 
        jobLocation: "chennai",
        jobExperience: 1,
        maxJobs: 5
    },
    serviceName : "naukri",
    serviceType : "scrape",
}
const ouputConfig = {
    fileName : "jobs",
    fileType : "csv",
}


await serviceController(jobConfig, ouputConfig);









