export interface PDFVIewerParams {
    url: string;
};

export interface PDFMetadata { 
    info: Object; 
    metadata: any;
    numPages: number; 
};

export interface PDFPageParams {
    pdf: any;
    pageNumber: number;
    addPage: (page:any) => void;
};