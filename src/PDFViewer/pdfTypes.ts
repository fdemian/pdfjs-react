export interface PageType {
  number: number;
  page: {
    current : HTMLCanvasElement | null
  };
};

export interface PageControlsParams {
  currentPage: number;
  setCurrentPage: (page:number) => void; 
  numPages: number;
  renderedPages: PageType[];
};

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
    addPage: (page:PageType) => void;
};