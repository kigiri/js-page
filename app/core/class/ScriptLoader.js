/* global Promise */

function ScriptLoader(src, forceUncahed) {
  var script = document.createElement('script'),
      q = new Promise();

  if (forceUncahed) {
    src += '?'+ Date.now();
  }

  script.type = "text/javascript";
  script.src = src;
  script.onload = q.resolve.bind(q);
  script.onerror = q.reject.bind(q);
  document.body.appendChild(script);
  return q;
}
