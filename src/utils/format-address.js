export function fShortenString(address) {
  if (address?.length <= 7) return address;
  return address?.substring(0, 4) + '...' + address?.substring(address.length - 3);
}

export function fShortenLink(link) {
  if (link?.length <= 40) return link;
  return link?.substring(0, 40) + '...';
}
