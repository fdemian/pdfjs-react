import React from 'react';
//import * as pdfjs from 'pdfjs-dist';

interface PDFVIewerParams {
    url: string;
};

const PDFVIewer = ({url}:PDFVIewerParams): React.ReactElement => {
    return <h2>{url}</h2>;
}

export default PDFVIewer;