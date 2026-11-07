// Atualiza o conteúdo sem recriar os controles que continuam na tela.
// Isso preserva animações, foco, cliques em andamento e a rolagem do painel.
function key(node) {
  if (node.nodeType !== 1) return null;
  if (node.id) return `id:${node.id}`;
  if (node.hasAttribute('data-ui-key')) return node.getAttribute('data-ui-key');
  if (!node.hasAttribute('data-action')) return null;
  return ['data-action','data-id','data-eq-action','data-drawer-tab','data-tab']
    .map(attribute => node.getAttribute(attribute) ?? '').join(':');
}

function compatible(current, next) {
  return current.nodeType === next.nodeType && current.nodeName === next.nodeName && key(current) === key(next);
}

function updateNode(current, next) {
  if (current.nodeType !== 1) {
    if (current.nodeValue !== next.nodeValue) current.nodeValue = next.nodeValue;
    return;
  }
  for (const attribute of [...current.attributes]) {
    if (!next.hasAttribute(attribute.name)) current.removeAttribute(attribute.name);
  }
  for (const attribute of [...next.attributes]) {
    if (current.getAttribute(attribute.name) !== attribute.value) {
      current.setAttribute(attribute.name, attribute.value);
    }
  }
  updateChildren(current, next);
}

function updateChildren(parent, nextParent) {
  let cursor = parent.firstChild;
  for (const desired of [...nextParent.childNodes]) {
    let current = cursor;
    if (key(desired)) {
      while (current && !compatible(current, desired)) current = current.nextSibling;
    }
    if (current && compatible(current, desired)) {
      if (current !== cursor) parent.insertBefore(current, cursor);
      updateNode(current, desired);
      cursor = current.nextSibling;
    } else {
      parent.insertBefore(desired.cloneNode(true), cursor);
    }
  }
  while (cursor) {
    const next = cursor.nextSibling;
    parent.removeChild(cursor);
    cursor = next;
  }
}

export function syncMarkup(container, markup) {
  const template = container.ownerDocument.createElement('template');
  template.innerHTML = markup;
  updateChildren(container, template.content);
}
