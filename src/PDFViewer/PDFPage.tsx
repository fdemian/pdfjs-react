import React, { useCallback, useEffect, useRef } from 'react';
import { PDFPageParams } from './pdfTypes';

const SCALE = 1;

const PDFPage = ({pdf, pageNumber, addPage}:PDFPageParams):React.ReactElement => {

    const canvasRef = useRef<HTMLCanvasElement | null>(null);  
    
    const renderPage = useCallback((pageNum:number, pdf:any) => {
        //let pageRendering = true;
    
        pdf && pdf.getPage(pageNum).then(function(page:any) {
          const viewport = page.getViewport({ scale: SCALE });
          const canvas:HTMLCanvasElement | null = canvasRef.current;

          if(canvas === null)
            return;


          // Support HiDPI-screens.
          var outputScale = window.devicePixelRatio || 1;

          canvas.width = Math.floor(viewport.width * outputScale);
          canvas.height = Math.floor(viewport.height * outputScale);
          canvas.style.width = Math.floor(viewport.width) + "px";
          canvas.style.height =  Math.floor(viewport.height) + "px";

          const transform = outputScale !== 1
            ? [outputScale, 0, 0, outputScale, 0, 0]
            : null;

          // Render PDF page into canvas context
          const renderContext = {
            canvasContext: canvas.getContext('2d'),
            transform: transform,
            viewport: viewport,
          };
          
          page.render(renderContext);
          addPage({
            number: pageNumber,
            page: canvasRef
          });
        });   
    }, [pdf]);

    useEffect(() => {
        renderPage(pageNumber, pdf);
    }, [])

    return (<canvas id={`page-${pageNumber}`} key={`canvas-#${pageNumber}`} ref={canvasRef}></canvas>);
};

export default PDFPage;