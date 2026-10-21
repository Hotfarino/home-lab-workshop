// Keep previously shared root-page bookmarks pointing to their original lab.
const legacyHashes=new Set(['#learningBar','#scene','#labStudio','#networkWorkshop','#worldLab']);
if(legacyHashes.has(location.hash))location.replace('home-lab.html'+location.search+location.hash);
