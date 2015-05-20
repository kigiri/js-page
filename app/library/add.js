
function add(newChild, parent, position) {
  if (typeof newChild === "string") {
    newChild = document.createTextNode(newChild);
  } else if (!(newChild instanceof HTMLElement)) {
    return null;
  }
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
