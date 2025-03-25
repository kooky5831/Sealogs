import axios, {AxiosRequestConfig} from 'axios';

export const postRequest = async (apiEndpoint: string, headers: AxiosRequestConfig, payload: any) => {
  const response = await axios.post(apiEndpoint, payload, headers);
  return response;
}

export const getRequest = async (apiEndpoint: string, headers: any) => {
  const response = await axios.get(apiEndpoint, headers);
  return response;
}

export const putRequest = async (apiEndpoint: string, headers: any, payload: any) => {
  const response = await axios.put(apiEndpoint, payload, headers);
  return response;
}

export const deleteRequest = async (apiEndpoint: string, headers: any, params: any) => {
  // Config the params with the endpoint /{params} ors
  const response = await axios.delete(apiEndpoint, headers);
  return response;
}
