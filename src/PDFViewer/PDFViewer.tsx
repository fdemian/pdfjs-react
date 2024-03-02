import React, { useEffect, useState } from 'react';
import PDFPage from './PDFPage';
import * as pdfjsLib from 'pdfjs-dist';

interface PDFVIewerParams {
    url: string;
};

const PDFVIewer = ({url}:PDFVIewerParams): React.ReactElement => {

    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
    const [pdfRef, setPdfRef] = useState();
    //const [currentPage, setCurrentPage] = useState(1);
    const [pdfData, setPDFData] = useState(null);

    useEffect(() => {
      //const metadata = await this.pdfDocument.getMetadata();
      
      const loadingTask = pdfjsLib.getDocument(url);
      loadingTask.promise.then(async (loadedPdf) => {
        setPdfRef(loadedPdf);
        const metadata = await loadedPdf.getMetadata();
        const data = {
           numPages: loadedPdf.numPages,
           ...metadata
        };
        setPDFData(data);
      }, function (reason) {
        console.error(reason);
      });
    }, [])
    
    if(!pdfRef || !pdfData)
        return <p>Loading....</p>;

    return(
    <div>
        <h2>{url}</h2>
        <PDFPage pdf={pdfRef} pageNumber={1} />
        <PDFPage pdf={pdfRef} pageNumber={2} />
        <PDFPage pdf={pdfRef} pageNumber={3} />
    </div>
    );
}

export default PDFVIewer;