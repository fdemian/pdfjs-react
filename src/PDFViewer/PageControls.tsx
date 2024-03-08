import React from 'react';
import { PageControlsParams } from './pdfTypes';

const PageControls = (props:PageControlsParams):React.ReactElement => {

    const {
        currentPage, 
        setCurrentPage, 
        numPages, 
        renderedPages, 
        changeZoom, 
        pageScale, 
        printDocument,
        searchDocument
    } = props;

    const nextPageFn = async () => {
       if(currentPage < numPages) {
        const newPageNumber = currentPage+1;
        const nextPage = renderedPages.find(p => p.number === newPageNumber);
        if(nextPage) {
          setCurrentPage(newPageNumber);
          nextPage.page.current?.scrollIntoView();
        }
       }
    };

    const prevPageFn = () => {
       if(currentPage > 1) {
        const newPageNumber = currentPage-1;
        const prevPage = renderedPages.find(p => p.number === newPageNumber);
        if(prevPage) {
            setCurrentPage(newPageNumber);
            prevPage.page.current?.scrollIntoView();
        }
       }
    }

    //
    const zoomIn = () => changeZoom(pageScale+0.1);
    const zoomOut = () => changeZoom(pageScale-0.1);
    
    return(
    <div>
        <button onClick={prevPageFn}>PREV</button> &nbsp;
        <button onClick={nextPageFn}>NEXT</button> &nbsp;
        <span>{currentPage}/{numPages}</span> &nbsp;
        &nbsp;
        <button onClick={zoomIn}>Zoom IN</button> &nbsp;
        <span>{Math.floor(pageScale*100)}%</span>
        <button onClick={zoomOut}>Zoom OUT</button> &nbsp;
        <button onClick={printDocument}>PRINT</button>
        <button onClick={searchDocument}>SEARCH</button>
    </div>
    );
}

export default PageControls;