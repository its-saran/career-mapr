// import { firestoreDb } from '../utils/firebase.js';
import config from '../../config/config.json' assert { type: "json" };

const getConfig = async () => {
    console.log(config)
    return config
};

export default getConfig