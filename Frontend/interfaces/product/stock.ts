export interface IIncomingStock {
  total: number;
  date: string; 
}

export interface IStockItem {
  simpleCode: string;
  fullCode: string;
  stockType: number;
  colourCode: string;
  stock: number;
  reservedStock: number;
  incomingStock: IIncomingStock[] | null;
  modifiedDate: string; 
  quantityOnHand?:number;
  productCode?:string;
}
