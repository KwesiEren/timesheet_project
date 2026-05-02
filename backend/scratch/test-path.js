const { pathToRegexp, match } = require('path-to-regexp');
function test(pattern, url) {
  try {
    const fn = match(pattern);
    const result = fn(url);
    console.log('Pattern:', pattern, 'URL:', url, '->', result ? 'MATCH' : 'NO MATCH');
  } catch (e) {
    console.error('Pattern:', pattern, '-> FAILED:', e.message);
  }
}

console.log('--- TESTING /manager/(:path)* ---');
test('/manager/(:path)*', '/manager');
test('/manager/(:path)*', '/manager/');
test('/manager/(:path)*', '/manager/index.html');
test('/manager/(:path)*', '/manager/assets/main.js');
