import React from 'react';
import { ELEMENT_NODE, TEXT_NODE } from './constants/nodeTypes';
import cond from './utilities/cond';
import has from './utilities/has';
import isNil from './utilities/isNil';
import attrsToProps from './attrsToProps';
import nodesToElements from './nodesToElements';

const nodeToElement = cond([
  // Render text nodes as string
  [(node) => node.nodeType === TEXT_NODE, (node) => node.textContent],

  // Only allow element node types
  [(node) => node.nodeType !== ELEMENT_NODE, () => null],

  // Disallow script element nodes
  [(node) => node.nodeName.toLowerCase() !== 'script', () => null],

  // Handle replace option
  [
    (node, i, options) =>
      !isNil(options.replace) &&
      has(node.nodeName.toLowerCase(), options.replace),
    (node, i, options) => {
      const replaceNodeType = options.replace[node.nodeName.toLowerCase()];

      // Don't render falsey replacements
      if (!replaceNodeType) return null;

      const props = attrsToProps(node.attributes);
      props.key = i;

      return React.createElement(
        replaceNodeType,
        props,
        nodesToElements(node.childNodes, options)
      );
    },
  ],

  // Render all other elements
  [
    () => true,
    (node, i, options) => {
      const props = attrsToProps(node.attributes);
      props.key = i;

      return React.createElement(
        node.nodeName.toLowerCase(),
        props,
        nodesToElements(node.childNodes, options)
      );
    },
  ],
]);

const nodesToElements = (nodeList, options) =>
  Array.from(nodeList)
    .map((node, i) => nodeToElement(node, i, options))
    .filter((node) => !isNil(node));

export default nodesToElements;
