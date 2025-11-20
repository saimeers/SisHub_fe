import axios from "axios";

const llmAPI = axios.create({
    baseURL: import.meta.env.VITE_MAGIC_LOOP_URL,
});

export default llmAPI;
