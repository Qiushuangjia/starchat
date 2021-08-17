/**
 * 存储LocalStorage
 * @param key
 * @param data
 */
export const setLocalStorage = function (key: string | number, data: any) {
  data = JSON.stringify(data);
  key = String(key);
  localStorage.setItem(key, data);
};

/**
 * 获取LocalStorage
 * @param key
 */
export const getLocalStorage = function (key: string) {
  let data = localStorage.getItem(key);
  if (data) {
    data = JSON.parse(data);
    return data;
  } else {
    return null;
  }
};

/**
 * 移除LocalStorage
 * @param key
 */
export const removeLocalStorage = function (key: string) {
  localStorage.removeItem(key);
};
