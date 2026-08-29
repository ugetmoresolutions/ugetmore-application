export function Error(message:string, exception:any):void{
    console.log(`[ERROR] ${message}`)
}

export function Diagnostic(message:string, object?:any):void{
  if(object===undefined) {
      console.log(`[DIAGNOSTIC] ${message}`, object)}
  else{
    console.log(`[DIAGNOSTIC] ${message}`, object);
  }
}