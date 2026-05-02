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

console.log('--- TESTING /manager/(.*) ---');
test('/manager/(.*)', '/manager/index.html');

console.log('--- TESTING /manager/(.*)? ---');
test('/manager/(.*)?', '/manager');

console.log('--- TESTING /manager/(.*)? with curly ---');
test('/manager/{(.*)}?', '/manager');
test('/manager/{(.*)}?', '/manager/foo');

console.log('--- TESTING /manager{:path(.*)} ---');
test('/manager{:path(.*)}', '/manager');
test('/manager{:path(.*)}', '/manager/foo');
