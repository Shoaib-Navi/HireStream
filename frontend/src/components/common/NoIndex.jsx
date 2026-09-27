// Keeps a page out of search results. The app always answers 200, so "not found" pages need this to
// avoid being indexed as real content. React places the tag in <head> and removes it on unmount.
const NoIndex = () => <meta name="robots" content="noindex" />;

export default NoIndex;
