import React, { useCallback, useEffect, useRef } from 'react';

interface PDFPageParams {
    pdf: any;
    pageNumber: number;
};

const PDFPage = ({pdf, pageNumber}:PDFPageParams):React.ReactElement => {

    const canvasRef = useRef<HTMLCanvasElement | null>(null);  

    const renderPage = useCallback((pageNum:number, pdf:any) => {
        pdf && pdf.getPage(pageNum).then(function(page:any) {
          const viewport = page.getViewport({scale: 1.5});
          const canvas:HTMLCanvasElement | null = canvasRef.current;

          if(canvas === null)
            return;

          canvas.height = viewport.height;
          canvas.width = viewport.width;
          const renderContext = {
            canvasContext: canvas.getContext('2d'),
            viewport: viewport
          };
          page.render(renderContext);
        });   
    }, [pdf]);

    useEffect(() => {
        renderPage(pageNumber, pdf);
    }, [])

    return <canvas ref={canvasRef}></canvas>;
};

export default PDFPage;