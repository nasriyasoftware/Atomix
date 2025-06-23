import atomix from '../src/atomix';

const ips = await atomix.networks.getLocalIPs();
console.log(ips);