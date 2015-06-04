/* global $i18n */

function $add(newChild, parent, position) {
  if (typeof newChild === "string") {
    newChild = $i18n.bake(newChild);
  } else if (Array.isArray(newChild)) {
    var i = -1, len = newChild.length, ret;
    while (++i < len) {
      ret = $add(newChild[i], parent, position);
    }
    return ret;
  } else if (!(newChild instanceof HTMLElement)) { return null; }
  if (typeof position === "number") {
    var previousChild = parent.children[position];
    if (previousChild) {
      return previousChild.appendBefore(newChild);
    }
  }
  if (parent instanceof HTMLElement) {
    return parent.appendChild(newChild); 
  }
  return document.body.appendChild(newChild);
}
