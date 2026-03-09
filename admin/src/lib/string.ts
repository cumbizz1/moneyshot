/* eslint-disable no-useless-escape */
export function isUrl(url: string): boolean {
  // eslint-disable-next-line no-useless-escape
  const regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
  return regex.test(url);
}

export function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const getExt = (path: string) => {
  const i = path.lastIndexOf('.');
  return i < 0 ? '' : path.substr(i);
};
