import axios from 'axios';
import _ from 'lodash';

function query_string(query: any) {
  if (_.isEmpty(query)) return '';
  let keys_arr = Object.keys(query);
  let result = '';
  keys_arr.forEach((val, i) => {
    result += `${val}=${query[val]}${i === keys_arr.length - 1 ? '' : '&'}`;
  });
  return result;
}

async function get(url: string, params: any) {
  url = url + '?' + query_string(params);
  return await axios
    .get(url)
    .then((res) => res.data)
    .catch(function err(error: any) {
      console.error(error);
    });
}

async function post(url: string, body: any, params?: any) {
  url = url + '?' + query_string(params);
  return await axios
    .post(url, body)
    .then((res) => res.data)
    .catch(function err(errror: any) {
      console.error(errror);
    });
}

export { get, post };
