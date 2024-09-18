export function fShortenString(address) {
  if (address?.length <= 7) return address;
  return address?.substring(0, 4) + '...' + address?.substring(address.length - 3);
}
