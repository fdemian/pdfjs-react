import React from 'react';

interface PDFPageParams {
    pdf: any;
    pageNumber: number;
};

const PDFPage = ({pdf, pageNumber}:PDFPageParams):React.ReactElement => {

    console.clear();
    console.log(pdf);
    console.log("+++++++++++");

    return <div>{pageNumber}</div>;
};

export default PDFPage;