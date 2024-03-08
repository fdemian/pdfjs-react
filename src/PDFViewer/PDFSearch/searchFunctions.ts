import { normalize, renderMatches, convertToRegExpString, calculateRegExpMatch } from './searchUtils.ts';

const SEARCH_PARAMS = {
    caseSensitive: false, 
    entireWord: true
};

const getPageTextContents = async (pdfDocument, pagesCount) => {
    let _pageContents = []; 
    // Stores the normalized text for each page. 
    let _pageDiffs = []; 
    let _hasDiacritics = []; 
    let _textContents = []; 
    //let _dirtyMatch = false; 
    const textOptions = { disableNormalization: true }; 
    for (let i = 0, ii = pagesCount; i < ii; i++) { 
        let pdfPage = await pdfDocument.getPage(i + 1);
        try {
                let textContent = await pdfPage.getTextContent(textOptions);
                const strBuf = [];
                for (const textItem of textContent.items) {
                    strBuf.push(textItem.str);
                    if (textItem.hasEOL) {
                        strBuf.push("\n");
                    }
                } 
                // Store the normalized page content (text items) as one string. 
                const newMatch = [ _pageContents[i], _pageDiffs[i], _hasDiacritics[i], ] = normalize(strBuf.join("")); 
                _textContents.push(newMatch); 
        } 
        catch (error) { 
            console.error( `Unable to get text content for page ${i + 1}`, error ); 
            // Page error -- assuming no text content.
            _pageContents[i] = ""; 
            _pageDiffs[i] = null; 
            _hasDiacritics[i] = false; 
        }
    }
    
    return _textContents;                                       
}

const highlightTextMatches = (reset = false) => {

    const { findController, matches, pageIdx } = this;
    const { textContentItemsStr, textDivs } = this;
    let clearedUntilDivIdx = -1;
    
    // Clear all current matches.
    for (const match of matches) {
      const begin = Math.max(clearedUntilDivIdx, match.begin.divIdx);
      for (let n = begin, end = match.end.divIdx; n <= end; n++) {
        const div = textDivs[n];
        div.textContent = textContentItemsStr[n];
        div.className = "";
       }
       clearedUntilDivIdx = match.end.divIdx + 1;
    }
    
    if (!findController?.highlightMatches || reset) {
        return;
    }
    
    // Convert the matches on the `findController` into the match format
    // used for the textLayer.
    const pageMatches = findController.pageMatches[pageIdx] || null;
    const pageMatchesLength = findController.pageMatchesLength[pageIdx] || null;
    
    this.matches = this._convertMatches(pageMatches, pageMatchesLength);
    this._renderMatches(this.matches);
}



export const getNextMatch = (textContents, currentPage, query) => {

    if (query.length === 0) {
        return null; // Do nothing: the matches should be wiped out already.
    }  

    const pageContent = textContents[currentPage];
    const { caseSensitive, entireWord } = SEARCH_PARAMS;
    const hasDiacritics = false; // TODO change?
    let isUnicode = false;
    if (typeof query === "string") {
      [isUnicode, query] = convertToRegExpString(query, hasDiacritics, false);
    } else {
      // Words are sorted in reverse order to be sure that "foobar" is matched
      // before "foo" in case the query is "foobar foo".
      query = query
        .sort()
        .reverse()
        .map(q => {
          const [isUnicodePart, queryPart] = convertToRegExpString(
            q,
            hasDiacritics,
            false
          );
          isUnicode ||= isUnicodePart;
          return `(${queryPart})`;
        })
        .join("|");
    }

    const flags = `g${isUnicode ? "u" : ""}${caseSensitive ? "" : "i"}`;
    query = query ? new RegExp(query, flags) : null;

    const nextMatch = calculateRegExpMatch(query, entireWord, currentPage, pageContent, textContents);

    /*
    // When `highlightAll` is set, ensure that the matches on previously
    // rendered (and still active) pages are correctly highlighted.
    if (this.#state.highlightAll) {
      this.#updatePage(currentPage);
    }
    if (this._resumePageIdx === currentPage) {
      this._resumePageIdx = null;
      this.#nextPageMatch();
    }
    */

    return nextMatch;

    // Update the match count.
    /*const pageMatchesCount = this._pageMatches[pageIndex].length;
    this._matchesCountTotal += pageMatchesCount;
    if (this.#updateMatchesCountOnProgress) {
      if (pageMatchesCount > 0) {
        this.#updateUIResultsCount();
      }
    } else if (++this.#visitedPagesCount === this._linkService.pagesCount) {
      // For example, in GeckoView we want to have only the final update because
      // the Java side provides only one object to update the counts.
      this.#updateUIResultsCount();
    }

    console.clear();
    console.log(pageText);
    console.log("-------------");*/

}
                                        
export const searchText = async (pdfDocument, pagesCount, query) => { 
    // Get text content 

    const textContents = await getPageTextContents(pdfDocument, pagesCount);
    //const sanitizedQuery = await convertQuery(query); // 

   const next = getNextMatch(textContents, 1, query);
   console.clear();
   console.log(next);
   console.log("@@@@@@@@@@@@@@@@----------------_*******************");

}