import { Injectable, Output,EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UtilsService } from '../../../../../../../services/utils/utils.service';

@Injectable()
export class CogService {
  constructor( private utils:UtilsService, private http: HttpClient) { }

  private baseUrl = this.utils.baseUrl;
  public cogData:any = [];
  @Output('cogDataEmit') cogDataEmit = new EventEmitter();

  getModelTableById(id: string) {
    return new Promise((resolve) => {
      let header = this.utils.getHeaders() ;
      this.http.get(this.baseUrl + 'modeltable/get/' + id, { headers: header }) .
        subscribe((data) => {
          resolve(data);
        })
    })
  }

  getModelTableByTableName(tableName: string) {
    
    return new Promise((resolve) => {
      let header = this.utils.getHeaders() ;
      this.http.get(this.baseUrl + 'ModelTable/GetModelTableByName?modelTableName=' + tableName, { headers: header })
       
      .subscribe((data) => {  resolve(data) })
    })
  }

  updateRecordState(json:any, url:any) {
    return new Promise((resolve) => {
      let header = this.utils.getHeaders() ;
      this.http.post(this.baseUrl + url, json, { headers: header ,'responseType': 'text'})
         .subscribe((data) => { resolve(data)})
    })
  }

  setCogData(data:any) {
    this.cogData = data;
    this.cogDataEmit.emit();
    

  }

}
