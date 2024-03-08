import {normalize} from './searchUtils.ts';

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
                    const newMatch = [ _pageContents[i], _pageDiffs[i], _hasDiacritics[i], ] = normalize(strBuf.join("")); _textContents.push(newMatch); 
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
                                        
export const searchText = async(pdfDocument, pagesCount, query) => { 
    // Get text content 

    console.clear();
    console.log(pdfDocument);
    console.log(pagesCount);
    console.log(query);
    const textContents = await getPageTextContents(pdfDocument, pagesCount);
    //const sanitizedQuery = await convertQuery(query); // 

    console.log(textContents);
    console.log(query);
    console.log("@@@@@@@@@@@@@@@@");
}