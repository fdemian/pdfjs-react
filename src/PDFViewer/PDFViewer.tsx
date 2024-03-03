import React, { useEffect, useState } from 'react';
import PDFPage from './PDFPage';
import PageControls from './PageControls';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFVIewerParams,  PDFMetadata } from './pdfTypes';
import { ScrollArea } from '@radix-ui/themes';

function uniq(a) {
    return a.sort().filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
    });
}

const PDFVIewer = ({url}:PDFVIewerParams): React.ReactElement => {

    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
    const [pdfRef, setPdfRef] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pdfData, setPDFData] = useState< PDFMetadata | null>(null);
    const [renderedPages, setRenderedPages ] = useState([]);

    // Todo: this is a hack.
    let rendered = [];

    const addPage = (page) => {
       const inArray = rendered.find(p => p.number === page.number);
       if(!inArray){
           rendered = [...rendered, page];
       }
       if(rendered.length === pdfData.numPages){
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

    return(
    <div style={{marginLeft: '40%'}}>
        <h2>{url}</h2>
        <PageControls 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          numPages={pdfData.numPages}
          renderedPages={renderedPages}
        />
        <ScrollArea type="always" scrollbars="vertical" style={{ border: '2px solid gainsboro', width: '700px', height: '500px' }}>
            {Array.from(Array(pdfData.numPages)).map((_, index) => <PDFPage pdf={pdfRef} pageNumber={index+1} addPage={addPage} />)}
        </ScrollArea>
    </div>
    );
}

export default PDFVIewer;