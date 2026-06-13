/**
 * Simple script to determine if a string contains mostly RTL characters.
 */
export function isRTL(text: string): boolean {
  // Range of RTL characters (Arabic, Hebrew, Persian, Syriac, etc.)
  const rtlPattern = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
  return rtlPattern.test(text);
}
