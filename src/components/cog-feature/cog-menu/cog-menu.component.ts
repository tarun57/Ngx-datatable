import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { CogService } from '../cog-menu/cog-service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationRecordStatus } from '../../../../../../../popups/confirmation-record-status/confirmation-record-status.component';
import { EditSuccessComponent } from '../../../../../../../popups/edit-success/edit-success.component';

@Component({
  selector: 'app-cog-menu',
  templateUrl: './cog-menu.component.html',
  styleUrls: ['./cog-menu.component.css'],
  providers: [CogService]
})

export class CogMenuComponent implements OnInit {

  constructor(private router: Router,private cogService: CogService, public urlparams: ActivatedRoute, public popup: MatDialog) {
  }

  @Input('updateStateBatchUrl') updateStateBatchUrl: string;
  @Input('updateStateUrl') updateStateUrl: string;
  @Input('title') title: string;   //title for popup
  @Input() set slected(val:any) {
    this.checkConditions(val);
  }

  //cog menu list for ui purpose which options show on list
  public cogMenu = {
    edit: false,
    inactivatable: false,
    reactivatable: false,
    archivable: false,
    restorable: false,
    linedoutable: false,
    auditLog: false
  };

  //if not (model table mrv) then, required (related model table) like person, navigation...
  private relatedModelTable:any = null;
  private cogConstants:any;


  ngOnInit() {
    let path = this.router.url.split('/');

    //get model table for model table SRV
    if( path[path.indexOf('view') + 1] === 'modellist' && path[path.indexOf('view') + 2] === 'edit') {
      this.relatedModelTable = this.cogService.getModelTableById(this.urlparams.snapshot.params['id']);
    }

    //get model table for other MRV & SRV exclude model table mrv && srv
    else if(path[path.indexOf('view') + 1] !== 'modellist') {
      let tableName = path[path.indexOf('view') + 1];
      this.relatedModelTable = this.cogService.getModelTableByTableName(tableName);
    }

     /* constant conditions for  not inactivatable, archivable etc...
        if relatedModelTable!=null its mean current module is not model table mrv so
        conditions are based on relatedModelTable.
     */
    this.cogConstants = {
      notInactivatable: (this.relatedModelTable==null)?
      ('Neither Model Table or Records + Records Only'):
      ('Neither Model Table or Records + Model Table Only'),

      notArchivable: (this.relatedModelTable==null)?
      ('Neither Model Table or Records + Records Only Permanent + Records Only Restorable'):
      ('Neither Model Table or Records + Model Table Only Permanent + Model Table Only Restorable'),

      notLineOutable: (this.relatedModelTable==null)?
      ('Neither Model Table or Records + Records Only'):
      ('Neither Model Table or Records + Model Table Only')
    }


  }


  /*
    check selected row properties for
    calculating which options show on cog menu list.
  */
  checkConditions(selectedRows: any) {
    

    /*
      go next step if selected row have same record activity state
      and record state not equal to archive permanent.
    */
    let goNext = true;
    for(let i = 0; i < selectedRows.length; i++) {
      if ( selectedRows[i].recordState !== selectedRows[0].recordState || selectedRows[i].recordState === 'Archived Permanently') {
        goNext = false;
        break;
      }
    }
    //...........................................................

    for (let i = 0; i < selectedRows.length && goNext; i++) {

      // assign model table values if model table mrv
      let modelTableProperites = selectedRows[i];

       // assign related model table if != model table mrv
      if(this.relatedModelTable!=null) {
        modelTableProperites = this.relatedModelTable;
        this.relatedModelTable = null;              // set null after assigned so that it not call every time.
      }

      // inactivatable checks...............................
      if(this.cogConstants.notInactivatable.includes(modelTableProperites.inactivatable as string)) {
          this.cogMenu.inactivatable = false;
          this.cogMenu.reactivatable = false;
      }
      else {
        if(selectedRows[0].recordState == 'Inactive') {
          this.cogMenu.inactivatable = false;
          this.cogMenu.reactivatable = true;
        }
        else if (selectedRows[0].recordState != 'Inactive') {
          this.cogMenu.inactivatable = true;
          this.cogMenu.reactivatable = false;
        }
      }
      //....................................................

      //Archivable Permanent Checks.........................
      if(this.cogConstants.notArchivable.includes(modelTableProperites.archivable as string)) {
        this.cogMenu.archivable = false;
      }
      else {
        if(selectedRows[0].recordState === 'Archived Restorable') {
          this.cogMenu.archivable = false;
          this.cogMenu.restorable = true;
        }
        else if (selectedRows[0].recordState !== 'Archived Restorable') {
          this.cogMenu.archivable = true;
          this.cogMenu.restorable = false;
        }
      }
      //.....................................................

      //lineoutable checkes..................................
      if(this.cogConstants.notLineOutable.includes(modelTableProperites.linedoutable as string)) {
        this.cogMenu.linedoutable = false;
      }
      else if(selectedRows[0].recordState !== 'Soft Deleted') {
        this.cogMenu.linedoutable = true;
      }
      //.....................................................
    }
  }

  /*
    update status of selected row's
  */
  updateState(selectedRows:any,state?: string,title?: string) {
    let reasonforEdit = 'Not Required';
    let authentication = 'Not Required';

    // check all selected row reasonforOperation && authentication
      if(this.relatedModelTable==null) {
      for(let i = 0; i < selectedRows.length; i++) {
        if(selectedRows[i].reasonforEdit == 'Required') {
          reasonforEdit = 'Required';
        }
        if(selectedRows[i].authentication == 'Required') {
          authentication = 'Required';
        }
        if(authentication === 'Required' &&  reasonforEdit === 'Required') {
          break;
        }
      }
    }
    else {
      authentication = this.relatedModelTable.authentication;
      reasonforEdit = this.relatedModelTable.reasonforEdit;
    }
    //.............................................................

    //Post Data for change state...................................
    if (reasonforEdit === 'Required' || authentication === 'Required') {
      let popup = this.popup.open(ConfirmationRecordStatus,  ({data:{ reson: reasonforEdit, authentication: authentication, context: { title: title + ' - ' + state, subtitle: state, from: title + ' List' } }}));
      popup.afterClosed().subscribe((resultPromise:any) => {
      resultPromise.result.then((result:any) => {
        if (result) {
          let jsonObject:any = [],url = this.updateStateUrl;
          for (var i = 0; i < selectedRows.length; i++) {
            //There are two possibility of archive which select by record archivable property.
            let archive = '';
            if (state == 'Archive') {
              if (this.relatedModelTable==null) {
                if (selectedRows[i].archivable.includes("Restorable")) archive = 'Archived Restorable';
                else if (selectedRows[i].archivable.includes("Permanent")) archive = 'Archived Permanently';
              }
              else {
                if(this.relatedModelTable.archivable.includes("Restorable")) archive = 'Archived Restorable';
                else if(this.relatedModelTable.archivable.includes("Permanent")) archive = 'Archived Permanently';
              }
            }
            if(selectedRows.length > 1) {
              url = this.updateStateBatchUrl;
              jsonObject.push({
                "id": selectedRows[i].id,
                "reasonforEdit": result.reason,
                "recordState": archive == '' ? state : archive,
                "password": result.password,
                "baseModelTableId": this.relatedModelTable.id
              });
            }
            else {
              jsonObject = {
                "id": selectedRows[i].id,
                "reasonforEdit": result.reason,
                "recordState": archive == '' ? state : archive,
                "password": result.password,
                "baseModelTableId": this.relatedModelTable.id
              };
            }
          }

          this.cogService.updateRecordState(jsonObject, url).then((data:any) => {
            if (data) {
              this.popup.open(EditSuccessComponent,  ({data:{ title: title + ' Record State Change', context: title + ' record state has been updated' }}));
            }
            else {
              this.popup.open(EditSuccessComponent,  ({data:{ title: 'Error', context: data }}));
            }
          })
        }
      })
      })
    }
    //This else for if resonforopertion && authentication not required.
    else {
      let jsonObject:any = [],url = this.updateStateUrl;
      for (var i = 0; i < selectedRows.length; i++) {
        //There are two possibility of archive which select by record archivable property.
        let archive = '';
        if (state == 'Archive') {
          if (this.relatedModelTable==null) {
            if (selectedRows[i].archivable.includes("Restorable")) archive = 'Archived Restorable';
            else if (selectedRows[i].archivable.includes("Permanent")) archive = 'Archived Permanently';
          }
          else {
            if(this.relatedModelTable.archivable.includes("Restorable")) archive = 'Archived Restorable';
            else if(this.relatedModelTable.archivable.includes("Permanent")) archive = 'Archived Permanently';
          }
        }

        if(selectedRows.length > 1) {
          url = this.updateStateBatchUrl;
          jsonObject.push({
            "id": selectedRows[i].id,
            "reasonforEdit": '',
            "recordState": archive == '' ? state : archive,
            "password": '',
            "baseModelTableId": this.relatedModelTable.id
          });
        }
        else {
          jsonObject = {
            "id": selectedRows[i].id,
            "reasonforEdit": '',
            "recordState": archive == '' ? state : archive,
            "password": '',
            "baseModelTableId": this.relatedModelTable.id
          };
        }
      }

      this.cogService.updateRecordState(jsonObject, url).then((data:any) => {
        if (data) {
          this.popup.open(EditSuccessComponent,  ({data:{ title: title + ' Record State Change', context: title + ' record state has been updated' }}));
         
        }
        else {
          this.popup.open(EditSuccessComponent,  ({data:{ title: 'Error', context: data }}));
          
        }
      })
    }
  }
}
