import React, { useEffect /*, useState, useRef*/ } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

interface PDFVIewerParams {
    url: string;
};

const PDFVIewer = ({url}:PDFVIewerParams): React.ReactElement => {

    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs.worker.js';
    //const canvasRef = useRef();  
    //const [pdfRef, setPdfRef] = useState();
    //const [currentPage, setCurrentPage] = useState(1);
  

    useEffect(() => {
      //const metadata = await this.pdfDocument.getMetadata();
      console.log("ZERO MINUS ZERO");
    }, [])

    return <h2>{url}</h2>;
}

export default PDFVIewer;