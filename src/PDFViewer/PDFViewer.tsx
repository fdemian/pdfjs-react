import React, { useEffect, useState, useRef } from 'react';
import PDFPage from './PDFPage';
import PageControls from './PageControls';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFVIewerParams,  PDFMetadata, PageType} from './pdfTypes';
import { ScrollArea } from '@radix-ui/themes';

const PDFVIewer = ({url}:PDFVIewerParams): React.ReactElement => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
    const [pdfRef, setPdfRef] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
    const printAreaRef = useRef();
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pdfData, setPDFData] = useState<PDFMetadata | null>(null);
    const [pageScale, setPageScale] = useState<number>(1);
    const [renderedPages, setRenderedPages] = useState<PageType[]>([]);

    // Todo: this is a hack.
    let rendered:PageType[] = [];

    const addPage = (page:PageType) => {
       const inArray = rendered.find(p => p.number === page.number);
       if(!inArray){
           rendered = [...rendered, page];
       }
       if(pdfData && rendered.length === pdfData.numPages){
          setRenderedPages(rendered);
       }
    }
    
    useEffect(() => {      
      const loadingTask = pdfjsLib.getDocument(url);
      loadingTask.promise.then(async (loadedPdf:pdfjsLib.PDFDocumentProxy ) => {
        setPdfRef(loadedPdf);
        const metadata = await loadedPdf.getMetadata();
        const data = {
           numPages: loadedPdf.numPages,
           ...metadata
        };
        setPDFData(data);
      }, function (reason:string) {
        console.error(reason);
      });
    }, [])
    
    if(!pdfRef || !pdfData)
        return <p>Loading....</p>;

    const changeZoom = (newScale:number) => setPageScale(newScale);

    return(
    <div style={{marginLeft: '40%'}}>
        <h2>{url}</h2>
        <PageControls 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          numPages={pdfData.numPages}
          renderedPages={renderedPages}
          changeZoom={changeZoom}
          pageScale={pageScale}
          printAreaRef={printAreaRef}
        />
        <ScrollArea type="always" scrollbars="vertical" style={{ border: '2px solid gainsboro', width: '700px', height: '500px' }}>
             <div ref={printAreaRef}>
              {Array.from(Array(pdfData.numPages)).map((_, index) => <PDFPage pageScale={pageScale} pdf={pdfRef} pageNumber={index+1} addPage={addPage} />)}
            </div>
        </ScrollArea>
    </div>
    );
}

export default PDFVIewer;