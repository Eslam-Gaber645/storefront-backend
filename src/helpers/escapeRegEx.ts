/**
 * escape special regex characters.
 * @export
 * @param {string} string
 * @return {string}
 */
export default function escapeRegEx(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
