console.log('Debug script loaded');

window.onerror = function(msg, url, lineNo, columnNo, error) {
  console.log('Error: ' + msg);
  console.log('URL: ' + url);
  console.log('Line: ' + lineNo);
  console.log('Column: ' + columnNo);
  console.log('Error object: ', error);
  return false;
};

console.log('React version:', React?.version);
console.log('ReactDOM version:', ReactDOM?.version);
console.log('Root element:', document.getElementById('root')); 