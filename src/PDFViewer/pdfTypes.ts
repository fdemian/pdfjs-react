export interface PageType {
  number: number;
  page: {
    current : HTMLCanvasElement | null
  };
};

export interface PageControlsParams {
  currentPage: number;
  setCurrentPage: (page:number) => void; 
  changeZoom: (newScale:number) => void;
  printDocument: () => void;
  numPages: number;
  renderedPages: PageType[];
  pageScale: number;
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
    pageScale: number;
    addPage: (page:PageType) => void;
};