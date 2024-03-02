import React, { useEffect, useState } from 'react';
import PDFPage from './PDFPage';
import * as pdfjsLib from 'pdfjs-dist';
import { ScrollArea, Card } from '@radix-ui/themes';

interface PDFVIewerParams {
    url: string;
};

interface PDFMetadata { 
    info: Object; 
    metadata: any;
    numPages: number; 
};

const PDFVIewer = ({url}:PDFVIewerParams): React.ReactElement => {

    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
    const [pdfRef, setPdfRef] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
    //const [currentPage, setCurrentPage] = useState<number>(1);
    const [pdfData, setPDFData] = useState< PDFMetadata | null>(null);

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
        <ScrollArea type="always" scrollbars="vertical" style={{ height: 500, width: 900, border: '2px solid gainsboro' }}>
            {Array.from(Array(pdfData.numPages)).map((_, index) => <PDFPage pdf={pdfRef} pageNumber={index+1} />)}
        </ScrollArea>
    </div>
    );
}

export default PDFVIewer;