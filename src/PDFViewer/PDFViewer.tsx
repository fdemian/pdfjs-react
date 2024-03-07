import React, { useEffect, useState, useRef } from 'react';
import PDFPage from './PDFPage';
import PageControls from './PageControls';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFVIewerParams,  PDFMetadata, PageType} from './pdfTypes';
import { ScrollArea } from '@radix-ui/themes';
import { useReactToPrint } from 'react-to-print';

import './PDFViewer.css';

const PDFVIewer = ({url}:PDFVIewerParams): React.ReactElement => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
    const [pdfRef, setPdfRef] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
    const printAreaRef = useRef<any>();
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pdfData, setPDFData] = useState<PDFMetadata | null>(null);
    const [pageScale, setPageScale] = useState<number>(1);
    const [renderedPages, setRenderedPages] = useState<PageType[]>([]);
    const handlePrint = useReactToPrint({
      content: () => printAreaRef.current,
    });
  
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
        const attachments = await loadedPdf.getAttachments();
        const data = {
           numPages: loadedPdf.numPages,
           attachments: attachments,
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

    const search = () => {
      console.clear();
      console.log(pdfRef);
      console.log("===============");
     
      /*
      const eventBus = new EventBus();
      const pdfLinkService = new PDFLinkService({ eventBus });      
      const pdfFindController = new PDFFindController({
        eventBus,
        linkService: pdfLinkService,
      });
      pdfFindController.setDocument(pdfRef);
      const eventState = Object.assign(
        Object.create(null),
        {
          source: this,
          type: "",
          query: null,
          caseSensitive: false,
          entireWord: false,
          findPrevious: false,
          matchDiacritics: false,
        },
        state
      );
      eventBus.dispatch("find", eventState);
      */

    }

    return(
    <>
        <h2>{url}</h2>
        <div className="pdf-viewer">
          <PageControls 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage} 
            numPages={pdfData.numPages}
            renderedPages={renderedPages}
            changeZoom={changeZoom}
            pageScale={pageScale}
            printDocument={handlePrint}
          />
          <br />
          <ScrollArea 
              type="always" 
              scrollbars={pageScale <= 1 ? "vertical" : "vertical, horizontal"}
              style={{ border: '2px solid gainsboro', textAlign:'center', width: '700px', height: '700px', backgroundColor:'gainsboro' }}
          >
            <span ref={printAreaRef} >
              {Array.from(Array(pdfData.numPages)).map((_, index) => <PDFPage pageScale={pageScale} pdf={pdfRef} pageNumber={index+1} addPage={addPage} />)}
            </span>
          </ScrollArea>
          <br />
        </div>
    </>
    );
}

export default PDFVIewer;