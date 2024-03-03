import React from 'react';

const PageControls = ({currentPage, setCurrentPage, numPages, renderedPages }):React.ReactElement => {

    const nextPageFn = async () => {
       if(currentPage < numPages) {
        const newPageNumber = currentPage+1;
        const nextPage = renderedPages.find(p => p.number === newPageNumber);
        if(nextPage) {
          setCurrentPage(newPageNumber);
          nextPage.page.current.scrollIntoView();
        }
       }
    };

    const prevPageFn = () => {
       if(currentPage > 1) {
        const newPageNumber = currentPage-1;
        const prevPage = renderedPages.find(p => p.number === newPageNumber);
        if(prevPage) {
            setCurrentPage(newPageNumber);
            prevPage.page.current.scrollIntoView();
        }
       }
    }

    return(
    <div>
        <button onClick={prevPageFn}>PREV</button> &nbsp;
        <button onClick={nextPageFn}>NEXT</button> &nbsp;
        <span>{currentPage}/{numPages}</span>
    </div>
    );
}

export default PageControls;