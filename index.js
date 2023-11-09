import config from './config/config.json' assert { type: "json" };
import { naukriController } from './controllers/naukriController.js';
import { indeedController } from './controllers/indeedController.js';


const searchQuery = {
    jobKeyword: "Python", 
    jobLocation: "chennai"
}
const serviceType = "search"

// naukriController(config.naukri, searchQuery, serviceType);
indeedController(config, searchQuery, serviceType);

