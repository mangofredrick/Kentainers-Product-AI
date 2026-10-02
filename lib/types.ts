export type Product={product_id:string;product_code:string;product_name:string;category:string;capacity?:string;capacity_unit?:string;application?:string;dimensions?:string;material?:string;features?:string;source_document:string;source_page?:number};
export type Source={document:string;page?:number};
export type AgentResult={answer:string;sources:Source[];products?:Product[];action:"clarify"|"search"|"details"|"escalate"};
