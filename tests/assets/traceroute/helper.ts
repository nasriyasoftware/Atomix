import unixData from './unixTrace.json';
import windowsData from './win32Trace.json';

export const win32Trace = {
    trace: `Tracing route to google.com [216.58.211.206]
over a maximum of 30 hops:

  1    <1 ms    <1 ms    <1 ms  192.168.5.1
  2     1 ms     1 ms    <1 ms  192.168.1.254
  3     4 ms     2 ms     2 ms  185.17.235.201
  4     2 ms     2 ms     2 ms  172.16.250.49
  5     2 ms     5 ms     2 ms  10.160.160.253
  6    62 ms    56 ms    55 ms  195.72.86.13
  7    64 ms    56 ms    56 ms  141.136.107.233
  8    71 ms    66 ms    68 ms  46.33.79.250
  9    58 ms    56 ms    57 ms  209.85.244.249
 10    57 ms    58 ms    58 ms  192.178.109.126
 11    56 ms    57 ms    57 ms  209.85.255.205
 12    58 ms    58 ms    58 ms  142.250.57.156
 13    57 ms    58 ms    56 ms  172.253.71.229
 14    59 ms    57 ms    57 ms  192.178.81.248
 15    58 ms    57 ms    57 ms  192.178.105.79
 16    63 ms    68 ms    57 ms  72.14.232.157
 17    55 ms    57 ms    58 ms  216.58.211.206

Trace complete.`,
    hops: windowsData
} as const;

export const unixTrace = {
    trace: `traceroute to google.com (142.251.37.46), 30 hops max, 60 byte packets
 1  192.168.5.1  0.831 ms  1.114 ms  1.487 ms
 2  192.168.1.254  3.584 ms  3.560 ms  3.853 ms
 3  185.17.235.201  6.933 ms  6.913 ms  6.892 ms
 4  172.16.250.113  6.843 ms  6.818 ms  6.920 ms
 5  10.160.160.249  7.167 ms  7.145 ms  7.125 ms
 6  62.115.153.20  46.389 ms 63.220.194.9  44.494 ms 62.115.153.20  45.481 ms
 7  72.14.211.220  45.115 ms * *
 8  192.178.105.27  47.109 ms 192.178.105.91  44.619 ms 192.178.105.27  48.313 ms
 9  * 142.251.78.79  43.775 ms *
10  142.250.236.30  59.221 ms 142.251.37.46  45.288 ms  43.590 ms`,
    hops: unixData
} as const;