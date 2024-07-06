import axios from 'axios';
import { sleep } from './sleep.js';

export const getStatusWithRetry = async (url, headers) => {
  try {
    let response = await axios.get(url, { headers });
    let result = response.data;
    while (result.status !== "succeeded") {
      await sleep(1000);
      response = await axios.get(url, { headers });
      result = response.data;
    }
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};