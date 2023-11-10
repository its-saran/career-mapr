import { serviceController } from './controllers/serviceController.js';

const searchQuery = {
    jobKeyword: "Python", 
    jobLocation: "chennai",
    maxJobs: 50
}
const serviceName = "naukri"
const serviceType = "scrape"
const folderPath = "./outputs"
const fileName = "jobs"
const fileType = ".json"

await serviceController(searchQuery, serviceName, serviceType, folderPath, fileName, fileType);







