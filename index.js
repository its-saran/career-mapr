import config from './config/config.json' assert { type: "json" };
import { naukriController } from './controllers/naukriController.js';


const searchQuery = {
    jobKeyword: "Python", 
    jobLocation: "chennai", 
    jobExperience: 0,
    maxJobs: 100, 
}
const serviceType = "search"

naukriController(config.naukri, searchQuery, serviceType);

