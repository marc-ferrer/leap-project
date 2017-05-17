'use strict';

// TODO: export function and import it in any file that uses it.
function vectorToString(vector, digits) { // eslint-disable-line
  if (typeof digits === 'undefined') {
    digits = 1;
  }
  return '(' + vector[0].toFixed(digits) + ', '
             + vector[1].toFixed(digits) + ', '
             + vector[2].toFixed(digits) + ')';
}
