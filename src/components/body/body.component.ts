import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { translateXY, columnsByPin, columnGroupWidths, RowHeightCache } from '../../utils';
import { SelectionType } from '../../types';
import { ScrollerComponent } from './scroller.component';
import { UtilsService } from '../../../../../../services/utils/utils.service';
import { MainLayoutComponent } from '../../../../../../main-layout/main-layout.component';
import { CookieService } from 'ngx-cookie';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'datatable-body',
  template: `
    <datatable-selection
      #selector
      [selected]="selected"
      [rows]="temp"
      [selectCheck]="selectCheck"
      [selectEnabled]="selectEnabled"
      [selectionType]="selectionType"
      [rowIdentity]="rowIdentity"
      (select)="select.emit($event)"
      (activate)="activate.emit($event)">
      <datatable-progress
        *ngIf="loadingIndicator">
      </datatable-progress>
      <datatable-scroller    style="{{(layout=='Row') ? dataTableScroller : ''}}"
        *ngIf="rows?.length"
        [scrollbarV]="scrollbarV"
        [scrollbarH]="scrollbarH"
        [scrollHeight]="scrollHeight"
        [scrollWidth]="columnGroupWidths.total"
        (scroll)="onBodyScroll($event)" cdkDropList class="example-list" (cdkDropListDropped)="drop($event)">

        <datatable-row-wrapper
          *ngFor="let row of temp; let i = index; trackBy: rowTrackingFn;"
          [ngStyle]="getRowsStyles(row)"
          [layout]="layout"
          [rowDetail]="rowDetail"
          [detailRowHeight]="getDetailRowHeight(row,i)"
          [row]="row"
          [rowIndex]="getRowIndex(row)"
          [expanded]="getRowExpanded(row)"
          (rowContextmenu)="rowContextmenu.emit($event)" cdkDrag [cdkDragDisabled]="!dropDropColumn">

   


<!-->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>[New Cog Functionality ]<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<-->

  <!---------- [Special Case for Model Table MRV] ------------------------->

  <div class="dropdown row-menu" *ngIf="i==currentRowIndex && isRowMenuOpen && component=='Model_Table'" >
    <ul class="dropdown-menu row-menu {{(temp.length == (i + 1) && temp.length > 3) ? 'last-child': ''}} {{((((temp.length == (i + 3)) && i != 0 && temp.length > 1) || i == 1) && (row?.recordState=='Active' || row?.record_state=='Active')&& row?.category  !== 'System' && row?.category !== 'System Plus') ? 'tree-last': ''}} {{(temp.length == (i + 2) && temp.length > 3) ? 'second-last': ''}} {{(i == 2 && temp.length == 3) ? 'second-last': ''}} " style="display: block;min-width: 50px;left: 55px;top: 7px;padding: 0px 0">
    <li [ngClass]="mainlayout.checkisRecordLock('Base_Model_Table', row?.id) != false ? 'wrapper' : '' " [title]="mainlayout.checkisRecordLock('Base_Model_Table', row?.id) != false ? mainlayout.recordLockedByUserName + ' is currently editing the record.' : '' ">
   <ul class="pointer-events-none" style="list-style: none;padding:0px">

     <li  *ngIf="mainlayout.checkCommonPermission(permissions,'Edit',row?.createdBy) &&  row?.recordState=='Active' && row?.category != 'Specialized' && row?.category !== 'System Plus'"  style="color:gray">
     <a (click)="editmode=-1;changeState.emit({row:row,Index:getRowIndex(row),edit:'edit',enablesavebutton:true});editmode=getRowIndex(row);">Edit </a>
      </li>
     
        <li *ngIf="(mainlayout.checkCommonPermission(permissions,'Archive',row?.createdBy)
                  && activeRecord !== 'Single, for Related'
        && (row?.recordState=='Active' || row?.record_state=='Active')
        && getGearMenuItemVisibilityStatus('Archive')) && row?.category  !== 'System' && row?.category !== 'System Plus' && row?.category != 'Specialized'">
        <a (click)="changeState.emit({state:'Archived', row:row});isRowMenuOpen=false">Archive</a>
      </li>

      <li *ngIf="(mainlayout.checkCommonPermission(permissions,'Restore',row?.createdBy)
      && activeRecord !== 'Single, for Related' && checkRestoreAvailablity(component, row)
            && (row?.recordState=='Archived' || row?.record_state=='Archived')
            && getGearMenuItemVisibilityStatus('Restore') && row?.category != 'Specialized') && row?.category  !== 'System' ">
            <a (click)="changeState.emit({state:'Active', row:row});isRowMenuOpen=false">Restore</a>
          </li>
          <li *ngIf="(mainlayout.checkCommonPermission(permissions,'Soft Delete',row?.createdBy) && activeRecord !== 'Single, for Related'
          && (row?.recordState=='Active' || row?.record_state=='Active')
          && getGearMenuItemVisibilityStatus('Soft Delete')) && row?.category != 'Specialized'">
          <a (click)="changeState.emit({state:'Soft Deleted', row:row});isRowMenuOpen=false">Soft Delete</a>
       </li>
       </ul>
       </li>
       <li *ngIf="mainlayout.checkCommonPermission(permissions,'View','')
                  && getGearMenuItemVisibilityStatus('Record Manager') && (row?.recordState=='Active' || row?.record_state=='Active') ">
          <a (click)="changeState.emit({state:'Record Manager', row:row});isRowMenuOpen=false">Record Manager</a>
        </li>

      <li><a (click)="auditlog.emit({row:row , id:row.id})">Audit Log</a></li>

      </ul>

  </div>

  <!----------------------------------------------------------------------------------------------------------------------------------->
  <!--------------------------------------------------Body Gear Functionality-------------------------------------------------------->
  <!----------------------------------------------------------------------------------------------------------------------------------->
  <!---------- [Special Case for Model Table SRV] ------------------------->

  <div class="dropdown row-menu" *ngIf="i==currentRowIndex && isRowMenuOpen && component=='onlyAuditLog'" >
    <ul class="dropdown-menu row-menu  " style="display: block;min-width: 50px;left: 55px;top: 7px;padding: 0px 0">



      <li><a (click)="auditlog.emit({row:row , id:row.id})">Audit Log</a></li>

      </ul>

  </div>

  <!-- ***************************************Model Property*************************************** -->
  <div class="dropdown row-menu" *ngIf="i==currentRowIndex && isRowMenuOpen && component=='Model_Property'"
  (mouseenter)="actionsVisibility.emit({isActionsVisible:true,event:$event})" >
    <ul class="dropdown-menu row-menu {{(temp.length == (i + 1) && temp.length > 3) ? 'last-child': ''}} {{((((temp.length == (i + 3)) && i != 0 && temp.length > 1) || i == 1) && (row?.recordState=='Active' || row?.record_state=='Active')) ? 'tree-lastt': ''}} {{(temp.length == (i + 2) && temp.length > 3) ? 'second-lastt': ''}} {{(i == 2 && temp.length == 3) ? 'second-lastt': ''}} " style="display: block;min-width: 50px;left: 55px;top: 7px;    padding: 0px 0">

    <li [ngClass]="checkisRecordLockByComponent(component,row) != false ? 'wrapper' : '' " [title]="checkisRecordLockByComponent(component,row) != false ? mainlayout.recordLockedByUserName + ' is currently editing the record.' : '' ">
    <ul class="pointer-events-none" style="list-style: none;padding:0px">

    <li *ngIf="mainlayout.checkCommonPermission(permissions,'Edit',row?.createdBy)
    && ( component == 'Model_Property' ? row.category == 'User Created' : row.category !='System' && row.category !='System' ) && row.propertyAutomation != 'Std. Dev' && row?.recordState=='Active'
     && getGearMenuItemVisibilityStatus(row.recordState)"  style="color:gray">
      <a (click)="editmode=-1;changeState.emit(
        {state:'Edit',row:row,Index:getRowIndex(row),edit:'edit',enablesavebutton:true}
        );editmode=getRowIndex(row);">Edit </a>
      </li>

      

  <li *ngIf="(mainlayout.checkCommonPermission(permissions,'Archive',row?.createdBy)
  && activeRecord !== 'Single, for Related'
&& (row?.recordState=='Active' || row?.record_state=='Active') && ( component == 'Model_Property' ? row.category == 'User Created' : row?.category !== 'System' && row.category !='System' && row?.category !== 'Specialized')
&& getGearMenuItemVisibilityStatus('Archive')) && row.id != row.tableRepresentation">
<a (click)="changeState.emit({state:'Archived', row:row});isRowMenuOpen=false">Archive</a>
</li>

<li *ngIf="(mainlayout.checkCommonPermission(permissions,'Restore',row?.createdBy)
      && activeRecord !== 'Single, for Related'
            && (row?.recordState=='Archived' || row?.record_state=='Archived')
            && getGearMenuItemVisibilityStatus('Restore')) && row.id != row.tableRepresentation">
            <a (click)="changeState.emit({state:'Active', row:row});isRowMenuOpen=false">Restore</a>
          </li>

<!-- <li *ngIf="(mainlayout.checkCommonPermission(permissions,'Soft Delete',row?.createdBy) && activeRecord !== 'Single, for Related'
&& (row?.recordState=='Active' || row?.record_state=='Active') && (component == 'Model_Property' ? row.category == 'User Created' : row?.category !== 'System' && row.category !='System' && row?.category !== 'Specialized')
&& getGearMenuItemVisibilityStatus('Soft Delete')) && row.id != row.tableRepresentation">
<a (click)="changeState.emit({state:'Soft Deleted', row:row});isRowMenuOpen=false">Soft Delete</a>
</li> -->
      </ul>
      </li>
<li *ngIf=" (row?.recordState=='Active' || row?.record_state=='Active') && row.id != row.tableRepresentation ">
<!-- Commented for Bug 3035 FE : Copy option for Property <a (click)="changeState.emit({state:'Copy', row:row});isRowMenuOpen=false" >Copy</a>-->
</li>
<!-- // 2907 Implementation in all application -->
<li *ngIf="mainlayout.checkCommonPermission(permissions,'View','') && getGearMenuItemVisibilityStatus('Record Manager') && ( component == 'Model_Property' ? row.category == 'User Created' : row?.category !== 'Specialized') && !recordManagerHide && row?.recordState=='Active' ">
  <a (click)="changeState.emit({state:'Record Manager', row:row});isRowMenuOpen=false">Record Manager</a>
</li>
     <li><a (click)="auditlog.emit({row:row})">Audit Log</a></li>

   </ul>
</div>
  <div class="dropdown row-menu" *ngIf="i==currentRowIndex && isRowMenuOpen &&
  (component=='RecordManager')"
  (mouseenter)="actionsVisibility.emit({isActionsVisible:true,event:$event})" >
    <ul class="dropdown-menu row-menu {{(temp.length == (i + 1) && temp.length > 3) ? 'last-child': ''}} {{((((temp.length == (i + 3)) && i != 0 && temp.length > 1) || i == 1) && (row?.recordState=='Active' || row?.record_state=='Active') && row?.type != 'User') ? 'tree-last': ''}} {{(temp.length == (i + 2) && temp.length > 3) ? 'second-last': ''}} {{(i == 2 && temp.length == 3) ? 'second-last': ''}} " style="display: block;min-width: 50px;left: 55px;top: 7px;    padding: 0px 0">

    <li *ngIf="mainlayout.checkCommonPermission(permissions,'Edit',row?.user)
     && row?.recordState=='Active' && (row?.type != 'User' ? true : (this.storage.get('userId') == row?.user))"  style="color:gray">
      <a (click)="editmode=-1;changeState.emit(
        {state:'Edit',row:row,Index:getRowIndex(row),edit:'edit',enablesavebutton:true}
        );editmode=getRowIndex(row);">Edit </a>
      </li>

    

  <li *ngIf="(mainlayout.checkCommonPermission(permissions,'Archive',row?.createdBy)
  && activeRecord !== 'Single, for Related'
&& (row?.recordState=='Active' || row?.record_state=='Active')
&& getGearMenuItemVisibilityStatus('Archive'))">
<a (click)="changeState.emit({state:'Archived', row:row});isRowMenuOpen=false">Archive</a>
</li>

<li *ngIf="(mainlayout.checkCommonPermission(permissions,'Restore',row?.createdBy)
&& activeRecord !== 'Single, for Related'
&& (row?.recordState=='Archived' || row?.record_state=='Archived')
&& getGearMenuItemVisibilityStatus('Restore'))">
<a (click)="changeState.emit({state:'Active', row:row});isRowMenuOpen=false">Restore</a>
</li>
<li *ngIf="(mainlayout.checkCommonPermission(permissions,'Soft Delete',row?.createdBy) && activeRecord !== 'Single, for Related'
&& (row?.recordState=='Active' || row?.record_state=='Active')
&& getGearMenuItemVisibilityStatus('Soft Delete'))">
<a (click)="changeState.emit({state:'Soft Deleted', row:row});isRowMenuOpen=false">Soft Delete</a>
</li>
     <li><a (click)="auditlog.emit({row:row})">Audit Log</a></li>

   </ul>
</div>
  <!-- **************************************//Model Property//********************************* */  -->

  <div class="dropdown row-menu" *ngIf="i==currentRowIndex && isRowMenuOpen &&
  (component=='modelViewList' || component=='viewList'
   || component== 'MtxRecordManager' || component=='FileManager')"
  (mouseenter)="actionsVisibility.emit({isActionsVisible:true,event:$event})" >
    <ul class="dropdown-menu row-menu {{(temp.length == (i + 1) && temp.length > 3) ? 'last-child': ''}} {{((((temp.length == (i + 3)) && i != 0 && temp.length > 1) || i == 1) && (row?.recordState=='Active' || row?.record_state=='Active') && component !=='modelViewList' && component !=='viewList') ? 'tree-last': ''}} {{(temp.length == (i + 2) && temp.length > 3) ? 'second-last': ''}} {{(i == 2 && temp.length == 3) ? 'second-last': ''}} " style="display: block;min-width: 50px;left: 55px;top: 7px;    padding: 0px 0">

    <li [ngClass]="checkisRecordLockByComponent(component,row) != false ? 'wrapper' : '' " [title]="checkisRecordLockByComponent(component,row) != false ? mainlayout.recordLockedByUserName + ' is currently editing the record.' : '' ">
    <ul class="pointer-events-none" style="list-style: none;padding:0px">

    <li *ngIf="mainlayout.checkCommonPermission(permissions,'Edit',row?.createdBy)
    && row.category !='System' && row.category !='System' && row?.recordState=='Active'
     && component !=='modelViewList'  && component !=='viewList' && getGearMenuItemVisibilityStatus(row.recordState)"  style="color:gray">
      <a (click)="editmode=-1;changeState.emit(
        {state:'Edit',row:row,Index:getRowIndex(row),edit:'edit',enablesavebutton:true}
        );editmode=getRowIndex(row);">Edit </a>
      </li>

   

  <li *ngIf="(mainlayout.checkCommonPermission(permissions,'Archive',row?.createdBy)
  && activeRecord !== 'Single, for Related'
&& ((row?.recordState=='Active' || row?.record_state=='Active') || (row?.recordState=='Active Incomplete' || row?.record_state=='Active Incomplete')) && row?.category !== 'System' && row.category !='System'
&& getGearMenuItemVisibilityStatus('Archive') && (((component=='modelViewList' || component=='viewList') && !row.isSystemGenerated) ? true : false))" [ngClass]="(row.isLinkUsed && component=='modelViewList') ? 'wrapper' : '' " [title]="(row.isLinkUsed && component=='modelViewList') ? 'View is in use on a Link and cannot have a Record State change.' : ''">
<a class="pointer-events-none" (click)="changeState.emit({state:'Archived', row:row});isRowMenuOpen=false">Archive</a>
</li>

<li *ngIf="(mainlayout.checkCommonPermission(permissions,'Restore',row?.createdBy)
      && activeRecord !== 'Single, for Related'
            && ((row?.recordState=='Archived' || row?.record_state=='Archived') || (row?.recordState=='Archived Incomplete' || row?.record_state=='Archived Incomplete'))
            && getGearMenuItemVisibilityStatus('Restore') && (((component=='modelViewList' || component=='viewList') && !row.isSystemGenerated) ? true : false))">
            <a (click)="changeState.emit({state:'Active', row:row});isRowMenuOpen=false">Restore</a>
          </li>

<li *ngIf="(mainlayout.checkCommonPermission(permissions,'Soft Delete',row?.createdBy) && activeRecord !== 'Single, for Related'
&& ((row?.recordState=='Active' || row?.record_state=='Active') || (row?.recordState=='Active Incomplete' || row?.record_state=='Active Incomplete')) && row?.category !== 'System' && row.category !='System'
&& getGearMenuItemVisibilityStatus('Soft Delete') && (((component=='modelViewList' || component=='viewList') && !row.isSystemGenerated) ? true : false))"  [ngClass]="(row.isLinkUsed && component=='modelViewList') ? 'wrapper' : '' " [title]="(row.isLinkUsed && component=='modelViewList') ? 'View is in use on a Link and cannot have a Record State change.' : '' ">
<a class="pointer-events-none" (click)="changeState.emit({state:'Soft Deleted', row:row});isRowMenuOpen=false">Soft Delete</a>
</li>
<li *ngIf=" (row?.recordState=='Active' || row?.record_state=='Active') && component=='modelViewList'">
<a (click)="changeState.emit({state:'Copy', row:row});isRowMenuOpen=false" >Copy Record(s)</a>
</li>
  </ul>
  </li>
  <!-- // 2907 Implementation in all application -->
<li *ngIf="mainlayout.checkCommonPermission(permissions,'View','') && getGearMenuItemVisibilityStatus('Record Manager') && (((component=='modelViewList' || component=='viewList') && !row.isSystemGenerated) ? true : false) && row?.recordState=='Active'">
  <a (click)="changeState.emit({state:'Record Manager', row:row});isRowMenuOpen=false">Record Manager</a>
</li>
     <li><a (click)="auditlog.emit({row:row})">Audit Log</a></li>

   </ul>
</div>
  <div class="dropdown row-menu" *ngIf="i==currentRowIndex && isRowMenuOpen &&
  (component=='RecordManager')"
  (mouseenter)="actionsVisibility.emit({isActionsVisible:true,event:$event})" >
    <ul class="dropdown-menu row-menu {{(temp.length == (i + 1) && temp.length > 3) ? 'last-child': ''}} {{((((temp.length == (i + 3)) && i != 0 && temp.length > 1) || i == 1) && (row?.recordState=='Active' || row?.record_state=='Active') && row?.type != 'User') ? 'tree-last': ''}} {{(temp.length == (i + 2) && temp.length > 3) ? 'second-last': ''}} {{(i == 2 && temp.length == 3) ? 'second-last': ''}} " style="display: block;min-width: 50px;left: 55px;top: 7px;    padding: 0px 0">

    <li *ngIf="mainlayout.checkCommonPermission(permissions,'Edit',row?.user)
     && row?.recordState=='Active' && (row?.type != 'User' ? true : (this.storage.get('userId') == row?.user))"  style="color:gray">
      <a (click)="editmode=-1;changeState.emit(
        {state:'Edit',row:row,Index:getRowIndex(row),edit:'edit',enablesavebutton:true}
        );editmode=getRowIndex(row);">Edit </a>
      </li>

     

  <li *ngIf="(mainlayout.checkCommonPermission(permissions,'Archive',row?.createdBy)
  && activeRecord !== 'Single, for Related'
&& (row?.recordState=='Active' || row?.record_state=='Active')
&& getGearMenuItemVisibilityStatus('Archive'))">
<a (click)="changeState.emit({state:'Archived', row:row});isRowMenuOpen=false">Archive</a>
</li>

<li *ngIf="(mainlayout.checkCommonPermission(permissions,'Restore',row?.createdBy)
&& activeRecord !== 'Single, for Related'
&& (row?.recordState=='Archived' || row?.record_state=='Archived')
&& getGearMenuItemVisibilityStatus('Restore'))">
<a (click)="changeState.emit({state:'Active', row:row});isRowMenuOpen=false">Restore</a>
</li>
<li *ngIf="(mainlayout.checkCommonPermission(permissions,'Soft Delete',row?.createdBy) && activeRecord !== 'Single, for Related'
&& (row?.recordState=='Active' || row?.record_state=='Active')
&& getGearMenuItemVisibilityStatus('Soft Delete'))">
<a (click)="changeState.emit({state:'Soft Deleted', row:row});isRowMenuOpen=false">Soft Delete</a>
</li>
     <li><a (click)="auditlog.emit({row:row})">Audit Log</a></li>

   </ul>
</div>
<!---------- [Permission MRV] ------------------------->
<div class="dropdown row-menu" style="position:absolute"
  *ngIf="i==currentRowIndex && isRowMenuOpen && component=='Permission'"
  (mouseenter)="actionsVisibility.emit({isActionsVisible:true,event:$event})">
    <ul class="dropdown-menu row-menu {{(temp.length == (i + 1) && temp.length > 3) ? 'last-child': ''}} {{((((temp.length == (i + 3)) && i != 0 && temp.length > 1) || i == 1) && (row?.recordState=='Active' || row?.record_state=='Active')) ? 'tree-last': ''}} {{(temp.length == (i + 2) && temp.length > 3) ? 'second-last': ''}} {{(i == 2 && temp.length == 3) ? 'second-last': ''}} " style="display: block;min-width: 50px;left: 55px;top: 7px; padding: 0px 0">
    <li [ngClass]="mainlayout.checkisRecordLock(component, row?.id) != false ? 'wrapper' : '' " [title]="mainlayout.checkisRecordLock(component, row?.id) != false ? mainlayout.recordLockedByUserName + ' is currently editing the record.' : '' ">
   <ul class="pointer-events-none" style="list-style: none;padding:0px">
    <li  disabled="row?.recordState=='Archived Permanantely' || row?.recordState=='Lined - Out'"
      *ngIf="mainlayout.checkCommonPermission(permissions,'Edit',row?.createdBy)
      && activeRecord !== 'Single, for Related'
      && ((row?.recordState === 'Active' ||  row?.record_state=='Active') || (row?.recordState=='Inactive' || row?.record_state=='Inactive'))
      && getGearMenuItemVisibilityStatus('Edit')" style="color:gray"
      (click)="editmode=-1;actionsVisibility.emit({isActionsVisible:false,event:$event});
      changeState.emit({state:'Edit',row:row,Index:getRowIndex(row),edit:'edit',enablesavebutton:true});editmode=getRowIndex(row);">
        <a>Edit</a>
      </li>
   
      <li *ngIf="(mainlayout.checkCommonPermission(permissions,'Archive',row?.createdBy) && activeRecord !== 'Single, for Related'
        && ((row?.recordState=='Active' || row?.record_state=='Active') )
        && getGearMenuItemVisibilityStatus('Archive'))">
        <a (click)="changeState.emit({state:'Archived', row:row});isRowMenuOpen=false">Archive</a>
      </li>

          <li *ngIf="(mainlayout.checkCommonPermission(permissions,'Restore',row?.createdBy)
&& activeRecord !== 'Single, for Related'
&& (row?.recordState=='Archived' && row.navigationNavigation?.recordState == 'Active')
&& getGearMenuItemVisibilityStatus('Restore'))">
<a (click)="changeState.emit({state:'Active', row:row});isRowMenuOpen=false">Restore</a>
</li>
      <li *ngIf="(mainlayout.checkCommonPermission(permissions,'Soft Delete',row?.createdBy) && activeRecord !== 'Single, for Related'
      && (row?.recordState=='Active' || row?.record_state=='Active') && getGearMenuItemVisibilityStatus('Soft Delete'))">
      <a (click)="changeState.emit({state:'Soft Deleted', row:row});isRowMenuOpen=false">Soft Delete</a>
   </li>
   </ul>
   </li>
  <li *ngIf="mainlayout.checkCommonPermission(permissions,'View','')  && getGearMenuItemVisibilityStatus('Record Manager') && row?.recordState=='Active'">
       <a (click)="changeState.emit({state:'Record Manager', row:row});isRowMenuOpen=false">Record Manager</a>
     </li>
     <li *ngIf="getGearMenuItemVisibilityStatus('Audit Log')">
       <a (click)="auditlog.emit({row:row})">Audit Log</a>
     </li>
     </ul>
</div>

<!--.......................................................................................................-->

<!------------------------------------------------------------------------------------------------------------->
<!---------- [All Other MRV's && SRV's] ------------------------->
  <div class="dropdown row-menu" style="position:absolute" *ngIf="i==currentRowIndex && isRowMenuOpen &&
  (component === 'workProduct'|| this.component === 'User_Classification_Edit'|| this.component === 'PtmModule' || component=='TaskRecordManager' || component == 'File-amendement' || component=='System_User'||component == 'modelproperty-automation' || component=='property-automation'  || component=='User_Permission_List' || component=='Pick_List' || component ==  'Pick_List_View_Property' || component=='File_manager_config' || component=='Boiler_Plate_Text' || component == 'Boilerplate_Text_List' || component == 'Controlled_Document' || component == 'Boilerplate_Text_Value' || component=='User_Session_list'
  || component=='User_Session' || component=='User_Session_Up'  || component == 'personsCompany' || component=='User_Management' || component === 'Analytics_Query' || component === 'Level_Qualifiers' || component === 'Text_Qualifier' || component === 'Automation_Setup' || component === 'Action_Table_Setup' || component === 'Setup_Qualifier'  || this.component=='Boilerplate_Text_Value'|| component == 'Analytics_Additional_Data' || component == 'Analytics_Repository' || component=='Automation_Design' || component=='Email_Information'  || component=='Email_Notice' || component=='Automation'  || component=='PersonEditCreate' || component=='PersonEditCreatePersonClassification'|| component=='PersonNameEditCreate'||  component=='tableModel' || component=='fileConfig' || component=='Link'|| component == 'MTx'   || component=='Task_manager' || component == 'Unit' || component=='listMember' || component=='company' || component == 'recordManagerDesign' || component == 'recordManagerPerson' || component =='CompanyEditName' || component=='companyContactInformation' || component == 'personsCompany' || component=='acquiredCompany' || component=='PersonCompany' || component == 'FileVersion' || component  =='propertyAutomaitonDesign' || component == 'TemplateDeign' || component == 'File_Record' || component=='fileDesign' || component === 'extensionTable'|| component == 'RequiredRecord' ||  this.component == 'MTxfileAssociation' || this.component == 'MTxfileHistory' || this.component == 'MTxFileManager' || this.component == 'MTxFileVersion' || this.component == 'MTxUserCreatedMTFile' || component == 'DisplayQualifier' || component == 'EditableQualifier'  || component == 'Validation'
   || component =='Validation_Qualifier' || component == 'formDesign' || component=='Validation-srv' || component == 'System_Setting_Mrv'   || component == 'PicklistPropertysrv' || component == 'recordManagerClassification')"
  (mouseenter)="actionsVisibility.emit({isActionsVisible:true,event:$event})">

    <ul class="dropdown-menu row-menu {{(temp.length == (i + 1) && temp.length > 3 && (component!='User_Permission_List' && component!='FileVersion' && component != 'propertyAutomaitonDesign' && component!='TemplateDeign' && component!='File_Record')) ? 'last-child': ''}} {{(temp.length == (i + 2) && temp.length > 3 && component!='User_Permission_List' && component!='FileVersion' && component != 'propertyAutomaitonDesign' && component!='TemplateDeign' && component!='File_Record') ? 'second-last': ''}} {{(i == 2 && temp.length == 3 && component!='User_Permission_List') ? 'second-last': ''}} " style="display: block;min-width: 50px;left: 55px;top: 7px; padding: 0px 0">

    <li [ngClass]="checkisRecordLockByComponent(component,row) != false ? 'wrapper' : '' " [title]="checkisRecordLockByComponent(component,row) != false ? mainlayout.recordLockedByUserName + ' is currently editing the record.' : '' ">
    <ul class="pointer-events-none" style="list-style: none;padding:0px">

      <li  disabled="row?.recordState=='Archived Permanantely' || row?.recordState=='Lined - Out'"
      *ngIf="(mainlayout.checkCommonPermission(permissions,'Edit',row?.createdBy) || component == 'recordManagerPerson' || component == 'recordManagerDesign') && !isLookup
       && activeRecord !== 'Single, for Related' && (row?.recordState === 'Active' ||  row?.record_state=='Active' || row?.recordState == 'Active Incomplete')
      && getGearMenuItemVisibilityStatus('Edit')  && component != 'TemplateDeign' && component!='User_Permission_List'  && !isSoftDelete  && component!='PersonEditCreatePersonClassification'&& component!='Boiler_Plate_Text'  && component!='Automation_Setup' && component != 'Boilerplate_Text_List' && component!='Boilerplate_Text_Value' &&  component != 'Automation_Design' && component !== 'PicklistPropertysrv' && component !== 'Analytics_Additional_Data' && component !== 'Analytics_Repository' && component !== 'Text_Qualifier' && component !== 'Level_Qualifiers'
       " style="color:gray"
      (click)="editmode=-1;actionsVisibility.emit({isActionsVisible:false,event:$event});
      changeState.emit({state:'Edit',row:row,Index:getRowIndex(row),edit:'edit',enablesavebutton:true});editmode=getRowIndex(row);">
        <a>Edit</a>
      </li>

      <li  disabled="row?.recordState=='Archived Permanantely' || row?.recordState=='Lined - Out'"
      *ngIf="mainlayout.checkCommonPermission(permissions,'Edit',row?.createdBy) && !isLookup
       && activeRecord !== 'Single, for Related' && (row?.recordState === 'Active' ||  row?.record_state=='Active')
      && getGearMenuItemVisibilityStatus('Edit')  && (component == 'Text_Qualifier' || component=='fileDesign' || component === 'extensionTable') && row?.type == 'Related Record'" style="color:gray"
      (click)="editmode=-1;actionsVisibility.emit({isActionsVisible:false,event:$event});
      changeState.emit({state:'Edit',row:row,Index:getRowIndex(row),edit:'edit',enablesavebutton:true});editmode=getRowIndex(row);">
        <a>Edit</a>
      </li>
      <li  disabled="row?.recordState=='Archived Permanantely' || row?.recordState=='Lined - Out'"
      *ngIf="mainlayout.checkCommonPermission(permissions,'Edit',row?.createdBy) && !isLookup
       && activeRecord !== 'Single, for Related' && (row?.recordState === 'Active' ||  row?.record_state=='Active')
      &&  component=='fileDesign'" style="color:gray"
      (click)="editmode=-1;actionsVisibility.emit({isActionsVisible:false,event:$event});
      changeState.emit({state:'Edit',row:row,Index:getRowIndex(row),edit:'edit',enablesavebutton:true});editmode=getRowIndex(row);">
        <a>Edit</a>
      </li>

      <li *ngIf="((mainlayout.checkCommonPermission(permissions,'Archive',row?.createdBy) || component == 'recordManagerDesign' || component == 'recordManagerPerson')
 && activeRecord !== 'Single, for Related'
        && (row?.recordState=='Active' || row?.record_state=='Active' || row?.recordState == 'Active Incomplete') && !row?.isSystemGenerated
        && getGearMenuItemVisibilityStatus('Archive')) &&  component!='User_Permission_List' && component !== 'Analytics_Repository' && component != 'PicklistPropertysrv' && (component == 'PersonEditCreate'? (!row?.actualprimaryNotificationEmail) : true)">
        <a (click)="changeState.emit({state:'Archived', row:row});isRowMenuOpen=false">Archive</a>
      </li>

      <li *ngIf="mainlayout.checkCommonPermissionCreate(permissions,'Archive & Create',row?.createdBy)
       && activeRecord === 'Single, for Related' && component !='CompanyEditName'
        && (row?.recordState=='Active' || row?.record_state=='Active')
        && getGearMenuItemVisibilityStatus('Archive & Create') &&  component!='User_Permission_List'">
        <a (click)="changeState.emit({state:'Archived', row:row});isRowMenuOpen=false">Archive & Create</a>
      </li>
      <li *ngIf="mainlayout.checkCommonPermissionCreate(permissions,'Soft Delete & Create',row?.createdBy)
      && activeRecord === 'Single, for Related' && component !='CompanyEditName'
        && (row?.recordState=='Active' || row?.record_state=='Active')
        && getGearMenuItemVisibilityStatus('Soft Delete & Create') &&  component!='User_Permission_List' ">
        <a (click)="changeState.emit({state:'Soft Deleted', row:row});isRowMenuOpen=false"> Soft Delete & Create</a>
      </li>
      <li *ngIf="((mainlayout.checkCommonPermission(permissions,'Restore',row?.createdBy) || (component == 'recordManagerDesign' ? (row.isActive == false ? false : true): true))
  && activeRecord !== 'Single, for Related'
        && (row?.recordState=='Archived' || row?.record_state=='Archived')
        && getGearMenuItemVisibilityStatus('Restore')) &&  component!='User_Permission_List' && component != 'PicklistPropertysrv' && component != 'FileVersion'">
        <a (click)="changeState.emit({state:'Active', row:row});isRowMenuOpen=false">Restore</a>
      </li>
      <li *ngIf="((mainlayout.checkCommonPermission(permissions,'Soft Delete',row?.createdBy) || component == 'recordManagerDesign' || component == 'recordManagerPerson') && activeRecord !== 'Single, for Related'
        && (row?.recordState=='Active' || row?.record_state=='Active' || row?.recordState == 'Active Incomplete') && !row?.isSystemGenerated && row?.status != 'Approved' && row?.status != 'Uploaded' && !isSoftDelete
         && getGearMenuItemVisibilityStatus('Soft Delete')) && getSoftDeleteForFileVersion(component, row) && (component == 'PersonEditCreate'? (!row?.actualprimaryNotificationEmail) : true) && component != 'User_Management'">
        <a (click)="changeState.emit({state:'Soft Deleted', row:row});isRowMenuOpen=false">Soft Delete</a>
     </li>
     </ul>
      </li>
     <li *ngIf="(mainlayout.checkCommonPermission(permissions,'View','') || component === 'Automation_Setup' || component === 'File_Record' || component === 'User_Permission_List') && getGearMenuItemVisibilityStatus('Record Manager') && component !='propertyAutomaitonDesign' && component != 'recordManagerDesign' && (row?.recordState=='Active' || row?.recordState == 'Active Incomplete') && component != 'PicklistPropertysrv'">
       <a (click)="changeState.emit({state:'Record Manager', row:row});isRowMenuOpen=false">Record Manager</a>
     </li>
  <li *ngIf="(row?.recordState=='Active' || row?.record_state=='Active') && component =='User_Management' && getGearMenuItemVisibilityStatus('Reset Password', row)">
       <a (click)="changeState.emit({state:'Reset Password', row:row})">Reset Password</a>
     </li>
     <li *ngIf="getGearMenuItemVisibilityStatus('Audit Log') && component !='propertyAutomaitonDesign'">
       <a (click)="auditlog.emit({row:row})">Audit Log</a>
     </li>

     </ul>
</div>


<!---------- [ render engine mrv and srv's]] ------------------------->

<div class="dropdown row-menu" style="position:absolute" *ngIf="i==currentRowIndex && isRowMenuOpen && (component=='Render_Engine' || component== 'Render_Engine_Mrv' || component == 'renderEngine' || component== 'Render_Engine_srv')"
  (mouseenter)="actionsVisibility.emit({isActionsVisible:true,event:$event})">

    <ul class="dropdown-menu row-menu {{(temp.length == (i + 1) && temp.length > 3) ? 'last-child': ''}} {{(temp.length == (i + 2) && temp.length > 3) ? 'second-last': ''}} {{(i == 2 && temp.length == 3) ? 'second-last': ''}} " style="display: block;min-width: 50px;left: 55px;top: 7px; padding: 0px 0">
    <li [ngClass]="checkisRecordLockByComponent(component,row) != false ? 'wrapper' : '' " [title]="checkisRecordLockByComponent(component,row) != false ? mainlayout.recordLockedByUserName + ' is currently editing the record.' : '' ">
    <ul class="pointer-events-none" style="list-style: none;padding:0px">
    <li  disabled="row?.recordState=='Archived Permanantely' || row?.recordState=='Lined - Out'"
      *ngIf="mainlayout.checkCommonPermissionRE(linkId,'Edit',row?.createdBy) && !isLookup
       && activeRecord !== 'Single, for Related' && (row?.recordState === 'Active' ||  row?.record_state=='Active')
      && getGearMenuItemVisibilityStatus('Edit') && isEditable" style="color:gray"
      (click)="editmode=-1;actionsVisibility.emit({isActionsVisible:false,event:$event});
      changeState.emit({state:'Edit',row:row,Index:getRowIndex(row),edit:'edit',enablesavebutton:true});editmode=getRowIndex(row);">
        <a>Edit</a>
      </li>



      <li *ngIf="((mainlayout.checkCommonPermissionRE(linkId,'Archive',row?.createdBy)
 && activeRecord !== 'Single, for Related'
        && (row?.recordState=='Active' || row?.record_state=='Active')
        && getGearMenuItemVisibilityStatus('Archive')) ) && cogFunc">
        <a (click)="changeState.emit({state:'Archived', row:row});isRowMenuOpen=false">Archive</a>
      </li>

      <li *ngIf="mainlayout.checkCommonPermissionCreate(permissions,'Archive & Create',row?.createdBy)
       && activeRecord === 'Single, for Related'
        && (row?.recordState=='Active' || row?.record_state=='Active')
        && getGearMenuItemVisibilityStatus('Archive & Create')">
        <a (click)="changeState.emit({state:'Archived', row:row});isRowMenuOpen=false">Archive & Create</a>
      </li>
      <li *ngIf="mainlayout.checkCommonPermissionCreate(permissions,'Soft Delete & Create',row?.createdBy)
      && activeRecord === 'Single, for Related'
        && (row?.recordState=='Active' || row?.record_state=='Active')
        && getGearMenuItemVisibilityStatus('Soft Delete & Create')">
        <a (click)="changeState.emit({state:'Soft Deleted', row:row});isRowMenuOpen=false"> Soft Delete & Create</a>
      </li>
      <li *ngIf="(mainlayout.checkCommonPermissionRE(linkId,'Restore',row?.createdBy)
  && activeRecord !== 'Single, for Related'
        && (row?.recordState=='Archived' || row?.record_state=='Archived')
        && getGearMenuItemVisibilityStatus('Restore'))">
        <a (click)="changeState.emit({state:'Active', row:row});isRowMenuOpen=false">Restore</a>
      </li>
     <li *ngIf="(mainlayout.checkCommonPermissionRE(linkId,'Soft Delete',row?.createdBy) && activeRecord !== 'Single, for Related'
        && (row?.recordState=='Active' || row?.record_state=='Active') && getGearMenuItemVisibilityStatus('Soft Delete'))">
        <a (click)="changeState.emit({state:'Soft Deleted', row:row});isRowMenuOpen=false">Soft Delete</a>
     </li>
      </ul>
      </li>
      <!-- // 2907 Implementation in all application -->
     <li *ngIf="mainlayout.checkCommonPermissionRE(linkId,'View','') && getGearMenuItemVisibilityStatus('Record Manager') && (row?.recordState=='Active' || row.record_state=='Active')">
       <a (click)="changeState.emit({state:'Record Manager', row:row});isRowMenuOpen=false">Record Manager</a>
     </li>
     <li *ngIf="getGearMenuItemVisibilityStatus('Audit Log')">
       <a (click)="auditlog.emit({row:row})">Audit Log</a>
     </li>

     </ul>
</div>
  <div class="dropdown row-menu" style="position:absolute" *ngIf="i==currentRowIndex && isRowMenuOpen &&
  ((component=='Location' || component=='propertyAutomaitonDesign'))"
  (mouseenter)="actionsVisibility.emit({isActionsVisible:true,event:$event})">

    <ul class="dropdown-menu row-menu {{(temp.length == (i + 1) && temp.length > 3) ? 'last-child': ''}} {{((((temp.length == (i + 3)) && i != 0 && temp.length > 1) || i == 1) && (row?.recordState=='Active' || row?.record_state=='Active')) ? 'tree-last': ''}} {{(temp.length == (i + 2) && temp.length > 3) ? 'second-last': ''}} {{(i == 2 && temp.length == 3) ? 'second-last': ''}} " style="display: block;min-width: 50px;left: 55px;top: 7px; padding: 0px 0">
   
       <li [ngClass]="checkisRecordLockByComponent(component,row) != false ? 'wrapper' : '' " [title]="checkisRecordLockByComponent(component,row) != false ? mainlayout.recordLockedByUserName + ' is currently editing the record.' : '' ">
    <ul class="pointer-events-none" style="list-style: none;padding:0px">
      <li  disabled="row?.recordState=='Archived Permanantely' || row?.recordState=='Lined - Out'"
      *ngIf="mainlayout.checkCommonPermission(permissions,'Edit',row?.createdBy)
       && activeRecord !== 'Single, for Related' && (row?.recordState === 'Active' ||  row?.record_state=='Active')
      && getGearMenuItemVisibilityStatus('Edit') &&
      ((component=='Location' || component=='propertyAutomaitonDesign') && row?.category == 'Cabinet/Locker' || row?.category == 'Room Shelf')" style="color:gray"
      (click)="editmode=-1;actionsVisibility.emit({isActionsVisible:false,event:$event});
      changeState.emit({state:'Edit',row:row,Index:getRowIndex(row),edit:'edit',enablesavebutton:true});editmode=getRowIndex(row);">
        <a>Edit</a>
      </li>
   
      <li *ngIf="(mainlayout.checkCommonPermission(permissions,'Archive',row?.createdBy)
 && activeRecord !== 'Single, for Related'
        && (row?.recordState=='Active' || row?.record_state=='Active')
        && getGearMenuItemVisibilityStatus('Archive'))   ">
        <a (click)="changeState.emit({state:'Archived', row:row});isRowMenuOpen=false">Archive</a>
      </li>
      <li *ngIf="mainlayout.checkCommonPermissionCreate(permissions,'Archive & Create',row?.createdBy)
       && activeRecord === 'Single, for Related'
        && (row?.recordState=='Active' || row?.record_state=='Active')
        && getGearMenuItemVisibilityStatus('Archive & Create')">
        <a (click)="changeState.emit({state:'Archived', row:row});isRowMenuOpen=false">Archive & Create</a>
      </li>
      <li *ngIf="mainlayout.checkCommonPermissionCreate(permissions,'Soft Delete & Create',row?.createdBy)
      && activeRecord === 'Single, for Related'
        && (row?.recordState=='Active' || row?.record_state=='Active')
        && getGearMenuItemVisibilityStatus('Soft Delete & Create')">
        <a (click)="changeState.emit({state:'Soft Deleted', row:row});isRowMenuOpen=false"> Soft Delete & Create</a>
      </li>
      <li *ngIf="(mainlayout.checkCommonPermission(permissions,'Restore',row?.createdBy)
  && activeRecord !== 'Single, for Related'
        && (row?.recordState=='Archived' || row?.record_state=='Archived')
        && getGearMenuItemVisibilityStatus('Restore')) ">
        <a (click)="changeState.emit({state:'Active', row:row});isRowMenuOpen=false">Restore</a>
      </li>
     <li *ngIf="(mainlayout.checkCommonPermission(permissions,'Soft Delete',row?.createdBy) && activeRecord !== 'Single, for Related'
        && (row?.recordState=='Active' || row?.record_state=='Active')
         && getGearMenuItemVisibilityStatus('Soft Delete'))">
        <a (click)="changeState.emit({state:'Soft Deleted', row:row});isRowMenuOpen=false">Soft Delete</a>
     </li>
     </ul>
     </li>
       <li *ngIf="mainlayout.checkCommonPermission(permissions,'View','')  && getGearMenuItemVisibilityStatus('Record Manager') && row?.recordState=='Active'">
       <a (click)="changeState.emit({state:'Record Manager', row:row});isRowMenuOpen=false">Record Manager</a>
     </li>
     <li *ngIf="getGearMenuItemVisibilityStatus('Audit Log')">
       <a (click)="auditlog.emit({row:row})">Audit Log</a>
     </li>

     </ul>
</div>

<div class="dropdown row-menu" style="position:absolute" *ngIf="i==currentRowIndex && isRowMenuOpen &&
(component == 'propertyAutomaitonDesign1')"
(mouseenter)="actionsVisibility.emit({isActionsVisible:true,event:$event})">

  <ul class="dropdown-menu row-menu {{(temp.length == (i + 1) && temp.length > 3) ? 'last-child': ''}} {{(temp.length == (i + 2) && temp.length > 3) ? 'second-last': ''}} {{(i == 2 && temp.length == 3) ? 'second-last': ''}} " style="display: block;min-width: 50px;left: 55px;top: 7px; padding: 0px 0">
  <li [ngClass]="mainlayout.checkisRecordLock('Navigation', row?.id) != false ? 'wrapper' : '' " [title]="mainlayout.checkisRecordLock('Navigation', row?.id) != false ? mainlayout.recordLockedByUserName + ' is currently editing the record.' : '' ">
 <ul class="pointer-events-none" style="list-style: none;padding:0px">
  <li  disabled="row?.recordState=='Archived Permanantely' || row?.recordState=='Lined - Out'"
    *ngIf="row?.name != 'System Base' && mainlayout.checkCommonPermission(permissions,'Edit',row?.createdBy)
     && activeRecord !== 'Single, for Related' && (row?.recordState === 'Active' ||  row?.record_state=='Active')
    && getGearMenuItemVisibilityStatus('Edit')" style="color:gray"
    (click)="editmode=-1;actionsVisibility.emit({isActionsVisible:false,event:$event});
    changeState.emit({state:'Edit',row:row,Index:getRowIndex(row),edit:'edit',enablesavebutton:true});editmode=getRowIndex(row);">
      <a>Edit</a>
    </li>
  
    <li *ngIf="row?.name != 'System Base'  && (mainlayout.checkCommonPermission(permissions,'Archive',row?.createdBy)
&& activeRecord !== 'Single, for Related'
      && (row?.recordState=='Active' || row?.record_state=='Active')
      && getGearMenuItemVisibilityStatus('Archive'))">
      <a (click)="changeState.emit({state:'Archived', row:row});isRowMenuOpen=false">Archive</a>
    </li>
    <li *ngIf="row?.name != 'System Base' && mainlayout.checkCommonPermissionCreate(permissions,'Archive & Create',row?.createdBy)
     && activeRecord === 'Single, for Related'
      && (row?.recordState=='Active' || row?.record_state=='Active')
      && getGearMenuItemVisibilityStatus('Archive & Create')">
      <a (click)="changeState.emit({state:'Archived', row:row});isRowMenuOpen=false">Archive & Create</a>
    </li>
    <li *ngIf="row?.name != 'System Base' && mainlayout.checkCommonPermissionCreate(permissions,'Soft Delete & Create',row?.createdBy)
    && activeRecord === 'Single, for Related'
      && (row?.recordState=='Active' || row?.record_state=='Active')
      && getGearMenuItemVisibilityStatus('Soft Delete & Create')">
      <a (click)="changeState.emit({state:'Soft Deleted', row:row});isRowMenuOpen=false"> Soft Delete & Create</a>
    </li>
    <li *ngIf="row?.name != 'System Base' && (mainlayout.checkCommonPermission(permissions,'Restore',row?.createdBy)
&& activeRecord !== 'Single, for Related'
      && (row?.recordState=='Archived' || row?.record_state=='Archived')
      && getGearMenuItemVisibilityStatus('Restore'))">
      <a (click)="changeState.emit({state:'Active', row:row});isRowMenuOpen=false">Restore</a>
    </li>
   <li *ngIf="(row?.name != 'System Base' && (mainlayout.checkCommonPermission(permissions,'Soft Delete',row?.createdBy) && activeRecord !== 'Single, for Related'
      && (row?.recordState=='Active' || row?.record_state=='Active')
      && getGearMenuItemVisibilityStatus('Soft Delete')))">
      <a (click)="changeState.emit({state:'Soft Deleted', row:row});isRowMenuOpen=false">Soft Delete</a>
   </li>
    </ul>
    </li>
   <li *ngIf="mainlayout.checkCommonPermission(permissions,'View','')  && getGearMenuItemVisibilityStatus('Record Manager') && row?.recordState=='Active'">
     <a (click)="changeState.emit({state:'Record Manager', row:row});isRowMenuOpen=false">Record Manager</a>
   </li>
   <li *ngIf="getGearMenuItemVisibilityStatus('Audit Log')">
     <a (click)="auditlog.emit({row:row})">Audit Log</a>
   </li>

   </ul>
</div>



 <div class="dropdown row-menu" style="position:absolute" *ngIf="i==currentRowIndex && isRowMenuOpen &&
  ( component=='Navigation')"
  (mouseenter)="actionsVisibility.emit({isActionsVisible:true,event:$event})">

    <ul class="dropdown-menu row-menu {{(temp.length == (i + 1) && temp.length > 3) ? 'last-child': ''}} {{(temp.length == (i + 2) && temp.length > 3) ? 'second-last': ''}} {{(i == 2 && temp.length == 3) ? 'second-last': ''}} " style="display: block;min-width: 50px;left: 55px;top: 7px; padding: 0px 0">
    <li [ngClass]="mainlayout.checkisRecordLock('Navigation', row?.id) != false ? 'wrapper' : '' " [title]="mainlayout.checkisRecordLock('Navigation', row?.id) != false ? mainlayout.recordLockedByUserName + ' is currently editing the record.' : '' ">
   <ul class="pointer-events-none" style="list-style: none;padding:0px">
    <li  disabled="row?.recordState=='Archived Permanantely' || row?.recordState=='Lined - Out'"
      *ngIf="row?.name != 'System Base' && mainlayout.checkCommonPermission(permissions,'Edit',row?.createdBy)
       && activeRecord !== 'Single, for Related' && (row?.recordState === 'Active' ||  row?.record_state=='Active')
      && getGearMenuItemVisibilityStatus('Edit')" style="color:gray"
      (click)="editmode=-1;actionsVisibility.emit({isActionsVisible:false,event:$event});
      changeState.emit({state:'Edit',row:row,Index:getRowIndex(row),edit:'edit',enablesavebutton:true});editmode=getRowIndex(row);">
        <a>Edit</a>
      </li>
      
      <li *ngIf="row?.name != 'System Base' && row?.isNavigationArchivable && (mainlayout.checkCommonPermission(permissions,'Archive',row?.createdBy)
 && activeRecord !== 'Single, for Related'
        && (row?.recordState=='Active' || row?.record_state=='Active')
        && getGearMenuItemVisibilityStatus('Archive'))">
        <a (click)="changeState.emit({state:'Archived', row:row});isRowMenuOpen=false">Archive</a>
      </li>
      <li *ngIf="row?.name != 'System Base' && mainlayout.checkCommonPermissionCreate(permissions,'Archive & Create',row?.createdBy)
       && activeRecord === 'Single, for Related'
        && (row?.recordState=='Active' || row?.record_state=='Active')
        && getGearMenuItemVisibilityStatus('Archive & Create')">
        <a (click)="changeState.emit({state:'Archived', row:row});isRowMenuOpen=false">Archive & Create</a>
      </li>
      <li *ngIf="row?.name != 'System Base' && mainlayout.checkCommonPermissionCreate(permissions,'Soft Delete & Create',row?.createdBy)
      && activeRecord === 'Single, for Related'
        && (row?.recordState=='Active' || row?.record_state=='Active')
        && getGearMenuItemVisibilityStatus('Soft Delete & Create')">
        <a (click)="changeState.emit({state:'Soft Deleted', row:row});isRowMenuOpen=false"> Soft Delete & Create</a>
      </li>
      <li *ngIf="row?.name != 'System Base' && (mainlayout.checkCommonPermission(permissions,'Restore',row?.createdBy)
  && activeRecord !== 'Single, for Related'
        && (row?.recordState=='Archived' || row?.record_state=='Archived')
        && getGearMenuItemVisibilityStatus('Restore'))">
        <a (click)="changeState.emit({state:'Active', row:row});isRowMenuOpen=false">Restore</a>
      </li>
     <li *ngIf="row?.name != 'System Base' && (mainlayout.checkCommonPermission(permissions,'Soft Delete',row?.createdBy) && activeRecord !== 'Single, for Related'
        && (row?.recordState=='Active' || row?.record_state=='Active')
        && getGearMenuItemVisibilityStatus('Soft Delete'))">
        <a (click)="changeState.emit({state:'Soft Deleted', row:row});isRowMenuOpen=false">Soft Delete</a>
     </li>
      </ul>
      </li>
     <li *ngIf="mainlayout.checkCommonPermission(permissions,'View','')  && getGearMenuItemVisibilityStatus('Record Manager') && row?.recordState=='Active'">
       <a (click)="changeState.emit({state:'Record Manager', row:row});isRowMenuOpen=false">Record Manager</a>
     </li>
     <li *ngIf="getGearMenuItemVisibilityStatus('Audit Log')">
       <a (click)="auditlog.emit({row:row})">Audit Log</a>
     </li>

     </ul>
</div>



  <div class="dropdown row-menu" style="position:absolute" *ngIf="i==currentRowIndex && isRowMenuOpen &&
  this.component === 'User_Classification'"
  (mouseenter)="actionsVisibility.emit({isActionsVisible:true,event:$event})">

    <ul class="dropdown-menu row-menu {{(temp.length == (i + 1) && temp.length > 3) ? 'last-child': ''}} {{((((temp.length == (i + 3)) && i != 0 && temp.length > 1) || i == 1) && (row?.recordState=='Active' || row?.record_state=='Active')) ? '': ''}} {{(temp.length == (i + 2) && temp.length > 3) ? 'second-last': ''}} {{(i == 2 && temp.length == 3) ? 'second-last': ''}} " style="display: block;min-width: 50px;left: 55px;top: 7px; padding: 0px 0">
    <li [ngClass]="mainlayout.checkisRecordLock(this.component, row?.id) != false ? 'wrapper' : '' " [title]="mainlayout.checkisRecordLock(this.component, row?.id) != false ? mainlayout.recordLockedByUserName + ' is currently editing the record.' : '' ">
   <ul class="pointer-events-none" style="list-style: none;padding:0px">
    <li  disabled="row?.recordState=='Archived Permanantely' || row?.recordState=='Lined - Out'"
      *ngIf="mainlayout.checkCommonPermission(permissions,'Edit',row?.createdBy) && row.name !='External User' && row.name !='Internal User' && row.name !='Application Administrator' && row.name !='System Administrator' && row.name !='User Administrator'
       && activeRecord !== 'Single, for Related' && (row?.recordState === 'Active' ||  row?.record_state=='Active')
      && getGearMenuItemVisibilityStatus('Edit')" style="color:gray"
      (click)="editmode=-1;actionsVisibility.emit({isActionsVisible:false,event:$event});
      changeState.emit({state:'Edit',row:row,Index:getRowIndex(row),edit:'edit',enablesavebutton:true});editmode=getRowIndex(row);">
        <a>Edit</a>
      </li>
   
      <li *ngIf="(mainlayout.checkCommonPermission(permissions,'Archive',row?.createdBy)
       && activeRecord !== 'Single, for Related'
        && (row?.recordState=='Active' || row?.record_state=='Active')
        && getGearMenuItemVisibilityStatus('Archive'))&& !((row.type === 'User'
        && row.name === 'External User' ) ||
        (row.type === 'Administrator' && row.name === 'System Administrator' )||
        (row.type === 'Administrator' && row.name === 'Application Administrator' ) ||
        (row.type === 'Administrator' && row.name === 'User Administrator' ) ||
        (row.type === 'User' && row.name === 'Internal User'))">
        <a (click)="changeState.emit({state:'Archived', row:row});isRowMenuOpen=false">Archive</a>
      </li>      <li *ngIf="(mainlayout.checkCommonPermission(permissions,'Restore',row?.createdBy)
        && activeRecord !== 'Single, for Related'
        && (row?.recordState=='Archived' || row?.record_state=='Archived')
        && getGearMenuItemVisibilityStatus('Restore'))">
        <a (click)="changeState.emit({state:'Active', row:row});isRowMenuOpen=false">Restore</a>
      </li>
     <li *ngIf="(mainlayout.checkCommonPermission(permissions,'Soft Delete',row?.createdBy) && activeRecord !== 'Single, for Related' && row.name !='External User' && row.name !='Internal User' && row.name !='Application Administrator' && row.name !='System Administrator' && row.name !='User Administrator'
        && (row?.recordState=='Active' || row?.record_state=='Active')
        && getGearMenuItemVisibilityStatus('Soft Delete'))">
        <a (click)="changeState.emit({state:'Soft Deleted', row:row});isRowMenuOpen=false">Soft Delete</a>
     </li>
     </ul>
      </li>
     <li *ngIf="mainlayout.checkCommonPermission(permissions,'View','')  && getGearMenuItemVisibilityStatus('Record Manager')">
       <a (click)="changeState.emit({state:'Record Manager', row:row});isRowMenuOpen=false">Record Manager</a>
     </li>
     <li *ngIf="getGearMenuItemVisibilityStatus('Audit Log')">
       <a (click)="auditlog.emit({row:row})">Audit Log</a>
     </li>

     </ul>
</div>
  <div class="dropdown row-menu" style="position:absolute" *ngIf="i==currentRowIndex && isRowMenuOpen && component=='PersonNameEditCreateNew'"
  (mouseenter)="actionsVisibility.emit({isActionsVisible:true,event:$event})">

    <ul class="dropdown-menu row-menu {{(temp.length == (i + 1) && temp.length > 3) ? 'last-child': ''}} {{((((temp.length == (i + 3)) && i != 0 && temp.length > 1) || i == 1) && (row?.recordState=='Active' || row?.record_state=='Active')) ? '': ''}} {{(temp.length == (i + 2) && temp.length > 3) ? 'second-last': ''}} {{(i == 2 && temp.length == 3) ? 'second-last': ''}} " style="display: block;min-width: 50px;left: 55px;top: 7px; padding: 0px 0">
    <li *ngIf="mainlayout.checkCommonPermission(permissions,'View','') && getGearMenuItemVisibilityStatus('Record Manager') && row?.recordState=='Active'">
      <a (click)="changeState.emit({state:'Record Manager', row:row});isRowMenuOpen=false">Record Manager</a>
    </li>
      <li *ngIf="mainlayout.checkCommonPermissionCreate(permissions,'Archive & Create',row?.createdBy) && activeRecord === 'Single, for Related'

        && getGearMenuItemVisibilityStatus('Archive & Create') && component !='PersonNameEditCreateNew'">
        <a (click)="changeState.emit({state:'Archived', row:row});isRowMenuOpen=false">Archive & Create</a>
      </li>
      <li *ngIf="mainlayout.checkCommonPermissionCreate(permissions,'Soft Delete & Create',row?.createdBy)
       && activeRecord === 'Single, for Related' && getGearMenuItemVisibilityStatus('Soft Delete & Create') && component !='PersonNameEditCreateNew'">
        <a (click)="changeState.emit({state:'Soft Deleted', row:row});isRowMenuOpen=false"> Soft Delete & Create</a>
      </li>
     <li *ngIf="getGearMenuItemVisibilityStatus('Audit Log')">
       <a (click)="auditlog.emit({row:row})">Audit Log</a>
     </li>

     </ul>
</div>



<!---------- [Person MRV] ------------------------->

<div class="dropdown row-menu " style="position:absolute"
  *ngIf="i==currentRowIndex && isRowMenuOpen && (component=='Person')"
  (mouseenter)="actionsVisibility.emit({isActionsVisible:true,event:$event})">
    <ul class="dropdown-menu row-menu {{(temp.length == (i + 1) && temp.length > 3) ? 'last-child': ''}} {{((((temp.length == (i + 3)) && i != 0 && temp.length > 1) || i == 1) && (row?.recordState=='Active' || row?.record_state=='Active')) ? 'tree-last': ''}} {{(temp.length == (i + 2) && temp.length > 3) ? 'second-last': ''}} {{(i == 2 && temp.length == 3) ? 'second-last': ''}}  {{(temp.length == (i + 1) && temp.length > 2) ? 'last-child': ''}}" style="display: block;min-width: 50px;left: 55px;top: 7px; padding: 0px 0">

    <li [ngClass]="checkisRecordLockByComponent(component,row) != false ? 'wrapper' : '' " [title]="checkisRecordLockByComponent(component,row) != false ? mainlayout.recordLockedByUserName + ' is currently editing the record.' : '' ">
    <ul class="pointer-events-none" style="list-style: none;padding:0px">
    <li  disabled="row?.recordState=='Archived Permanantely' || row?.recordState=='Lined - Out'"
      *ngIf="mainlayout.checkCommonPermission(permissions,'Edit',row?.createdBy) && activeRecord !== 'Single, for Related'
      && ((row?.recordState === 'Active' ||  row?.record_state=='Active') || (row?.recordState=='Inactive' || row?.record_state=='Inactive'))
      && getGearMenuItemVisibilityStatus('Edit')" style="color:gray"
      (click)="editmode=-1;actionsVisibility.emit({isActionsVisible:false,event:$event});
      changeState.emit({state:'Edit',row:row,Index:getRowIndex(row),edit:'edit',enablesavebutton:true});editmode=getRowIndex(row);">
        <a>Edit</a>
      </li>
 
      <li *ngIf="(mainlayout.checkCommonPermission(permissions,'Archive',row?.createdBy) && activeRecord !== 'Single, for Related'
        && ((row?.recordState=='Active' || row?.record_state=='Active') || (row?.recordState=='Inactive' || row?.record_state=='Inactive'))
        && getGearMenuItemVisibilityStatus('Archive'))">
        <a (click)="changeState.emit({state:'Archived', row:row});isRowMenuOpen=false">Archive</a>
      </li>
    <li *ngIf="(mainlayout.checkCommonPermission(permissions,'Restore',row?.createdBy)
      && activeRecord !== 'Single, for Related'
            && (row?.recordState=='Archived' || row?.record_state=='Archived')
            && getGearMenuItemVisibilityStatus('Restore'))">
            <a (click)="changeState.emit({state:'Active', row:row});isRowMenuOpen=false">Restore</a>
          </li>
      <li *ngIf="(mainlayout.checkCommonPermission(permissions,'Soft Delete',row?.createdBy) && activeRecord !== 'Single, for Related'
      && (row?.recordState=='Active' || row?.record_state=='Active')
      && getGearMenuItemVisibilityStatus('Soft Delete'))">
      <a (click)="changeState.emit({state:'Soft Deleted', row:row});isRowMenuOpen=false">Soft Delete</a>
   </li>
      </ul>
      </li>
   <li *ngIf=" mainlayout.checkCommonPermission(permissions,'View','') && getGearMenuItemVisibilityStatus('Record Manager') && row?.recordState=='Active'">
     <a (click)="changeState.emit({state:'Record Manager', row:row});isRowMenuOpen=false">Record Manager</a>
   </li>
     <li *ngIf="getGearMenuItemVisibilityStatus('Audit Log')">
       <a (click)="auditlog.emit({row:row})">Audit Log</a>
     </li>
     </ul>
</div>

<!--.......................................................................................................-->

<!---------- [TSD & GD MRV] ------------------------->

<div class="dropdown row-menu" style="position:absolute"
  *ngIf="i==currentRowIndex && isRowMenuOpen && (component=='PtmModuleTsdAndGD')"
  (mouseenter)="actionsVisibility.emit({isActionsVisible:true,event:$event})">
    <ul class="dropdown-menu row-menu {{(temp.length == (i + 1) && temp.length > 3) ? 'last-child': ''}} {{((((temp.length == (i + 3)) && i != 0 && temp.length > 1) || i == 1) && (row?.recordState=='Active' || row?.record_state=='Active')) ? 'tree-last': ''}} {{(temp.length == (i + 2) && temp.length > 3) ? 'second-last': ''}} {{(i == 2 && temp.length == 3) ? 'second-last': ''}} " style="display: block;min-width: 50px;left: 55px;top: 7px; padding: 0px 0">
      <li  disabled="row?.recordState=='Archived Permanantely' || row?.recordState=='Lined - Out'"
      *ngIf="mainlayout.checkCommonPermission(permissions,'Edit',row?.createdBy) && activeRecord !== 'Single, for Related'
      && (row?.recordState !== 'Archived' )
      && getGearMenuItemVisibilityStatus('Edit')" style="color:gray"
      (click)="editmode=-1;actionsVisibility.emit({isActionsVisible:false,event:$event});
      changeState.emit({state:'Edit',row:row,Index:getRowIndex(row),edit:'edit',enablesavebutton:true});editmode=getRowIndex(row);">
        <a>Edit</a>
      </li>
      <li *ngIf="(mainlayout.checkCommonPermission(permissions,'Archive',row?.createdBy) && activeRecord !== 'Single, for Related'
        && (row?.workProductPhase=='In Development' || row?.workProductPhase=='Testing') &&  row?.recordState !== 'Archived'
        && getGearMenuItemVisibilityStatus('Archive'))">
        <a (click)="changeState.emit({state:'Archived', row:row});isRowMenuOpen=false">Archive</a>
      </li>
      <li *ngIf="(mainlayout.checkCommonPermission(permissions,'Restore',row?.createdBy)  && activeRecord !== 'Single, for Related'
        && (row?.recordState=='Archived' || row?.record_state=='Archived') &&  (row?.workProductPhase=='In Development' || row?.workProductPhase=='Testing')
        && getGearMenuItemVisibilityStatus('Restore'))">
        <a (click)="changeState.emit({state:'Active', row:row});isRowMenuOpen=false">Restore</a>
      </li>
      <li *ngIf="(mainlayout.checkCommonPermission(permissions,'Soft Delete',row?.createdBy) && activeRecord !== 'Single, for Related'
        && (row?.workProductPhase=='In Development'&& row?.workProductPhase!='Testing') &&  (row?.recordState=='Active' || row?.record_state=='Active')
        && getGearMenuItemVisibilityStatus('Soft Delete'))">
        <a (click)="changeState.emit({state:'Soft Deleted', row:row});isRowMenuOpen=false">Soft Delete</a>
     </li>
     <li *ngIf="getGearMenuItemVisibilityStatus('Audit Log')">
       <a (click)="auditlog.emit({row:row})">Audit Log</a>
     </li>
     </ul>
</div>

<!--.......................................................................................................-->
<!---------- [Audit log by AuditLog] ------------------------->

<div class="dropdown row-menu" *ngIf="i==currentRowIndex && isRowMenuOpen && component=='Record_Audit' " >
<ul *ngIf="row?.alChildFlag"  class="dropdown-menu row-menu " style="display: block;min-width: 50px;left: 45px;top: 2px;padding: 0px 0">



  <li><a (click)="auditlog.emit({row:row , id:row.id})">Audit Log</a></li>

  </ul>

</div>

<!---------- [Related View] ------------------------->
<div class="dropdown row-menu" style="position:absolute"
  *ngIf="i==currentRowIndex && isRowMenuOpen && component=='Related_View'"
  (mouseenter)="actionsVisibility.emit({isActionsVisible:true,event:$event})">
    <ul class="dropdown-menu row-menu {{(temp.length == (i + 1) && temp.length > 3) ? 'last-child': ''}} {{((((temp.length == (i + 3)) && i != 0 && temp.length > 1) || i == 1) && (row?.recordState=='Active' || row?.record_state=='Active')) ? 'tree-last': ''}} {{(temp.length == (i + 2) && temp.length > 3) ? 'second-last': ''}} {{(i == 2 && temp.length == 3) ? 'second-last': ''}} " style="display: block;min-width: 50px;left: 55px;top: 7px; padding: 0px 0">
      

      <li *ngIf="(mainlayout.checkCommonPermission('Related Create View','Archive',row?.createdBy) && activeRecord !== 'Single, for Related'
      &&
(row?.recordState=='Active' || row?.record_state=='Active')
             && getGearMenuItemVisibilityStatus('Archive'))">
             <a (click)="changeState.emit({state:'Archived', row:row});isRowMenuOpen=false">Archive</a>
           </li>
      <li *ngIf="(mainlayout.checkCommonPermission('Related Create View','Restore',row?.createdBy)  && activeRecord !== 'Single, for Related'
           && (row?.recordState=='Archived' || row?.record_state=='Archived')
           && getGearMenuItemVisibilityStatus('Restore'))">
           <a (click)="changeState.emit({state:'Active', row:row});isRowMenuOpen=false">Restore</a>
      </li>
      <li *ngIf="( mainlayout.checkCommonPermission('Related Create View','Soft Delete',row?.createdBy) && activeRecord !== 'Single, for Related'
      && (row?.recordState=='Active' || row?.record_state=='Active') && getGearMenuItemVisibilityStatus('Soft Delete'))">
      <a (click)="changeState.emit({state:'Soft Deleted', row:row});isRowMenuOpen=false">Soft Delete</a>
   </li>
  <!-- <li *ngIf="mainlayout.checkCommonPermission(permissions,'View','') && getGearMenuItemVisibilityStatus('Record Manager')" >
       <a (click)="changeState.emit({state:'Record Manager', row:row});isRowMenuOpen=false">Record Manager</a>
     </li> -->
     <li *ngIf="getGearMenuItemVisibilityStatus('Audit Log')">
       <a (click)="auditlog.emit({row:row})">Audit Log</a>
     </li>
     </ul>
</div>

<!--.......................................................................................................-->

<!---------- [Qualifiers] ------------------------->
<div class="dropdown row-menu" style="position:absolute"
  *ngIf="i==currentRowIndex && isRowMenuOpen && (component == 'Required_Qualifier' || component == 'Validation_Qualifier' || component == 'Related_Filter' || component == 'DependencyQualifier' || component == 'Editable_Qualifier_Group' || component === 'Required_Qualifier_Group'  || component === 'Display_Qualifier_Group')"
  (mouseenter)="actionsVisibility.emit({isActionsVisible:true,event:$event})">
 
    <ul class="dropdown-menu row-menu " style="display: block;min-width: 50px;left: 55px;top: 7px; padding: 0px 0">
   
      <li [ngClass]="checkisRecordLockByComponent(component,row) != false ? 'wrapper' : '' " [title]="checkisRecordLockByComponent(component,row) != false ? mainlayout.recordLockedByUserName + ' is currently editing the record.' : '' ">
       <ul class="pointer-events-none" style="list-style: none;padding:0px">
      <li *ngIf="(mainlayout.checkCommonPermission(permissions,'Archive',row?.createdBy) && activeRecord !== 'Single, for Related'
      &&
(row?.recordState=='Active' || row?.record_state=='Active')
             && getGearMenuItemVisibilityStatus('Archive'))">
             <a (click)="changeState.emit({state:'Archived', row:row});isRowMenuOpen=false">Archive</a>
           </li>
           <li *ngIf="(mainlayout.checkCommonPermission(permissions,'Restore',row?.createdBy)
      && activeRecord !== 'Single, for Related'
            && (row?.recordState=='Archived' || row?.record_state=='Archived')
            && getGearMenuItemVisibilityStatus('Restore'))">
            <a (click)="changeState.emit({state:'Active', row:row});isRowMenuOpen=false">Restore</a>
          </li>

      <li *ngIf="( mainlayout.checkCommonPermission(permissions,'Soft Delete',row?.createdBy) && activeRecord !== 'Single, for Related'
      && (row?.recordState=='Active' || row?.record_state=='Active') && getGearMenuItemVisibilityStatus('Soft Delete'))">
      <a (click)="changeState.emit({state:'Soft Deleted', row:row});isRowMenuOpen=false">Soft Delete</a>
   </li>
</ul>
</li>
  <li *ngIf="mainlayout.checkCommonPermission(permissions,'View','') && getGearMenuItemVisibilityStatus('Record Manager')" >
       <a (click)="changeState.emit({state:'Record Manager', row:row});isRowMenuOpen=false">Record Manager</a>
     </li>
     <li *ngIf="getGearMenuItemVisibilityStatus('Audit Log')">
       <a (click)="auditlog.emit({row:row})">Audit Log</a>
     </li>
     </ul>
</div>

<!--.......................................................................................................-->
<a *ngIf="!openNewTabLink" style="color: #333 ;text-decoration: none;">
          <datatable-body-row #datatableBodyCom
          [editmode]="editmode"
            tabindex="-1"
            [layout]="layout"
            [style.display]=" layout=='Row'?'inline-block':''"
            [style.width]="(layout=='Row')?'initial':'none'"
            [isSelected]="selector.getRowSelected(row)"
            [innerWidth]="innerWidth"
            [offsetX]="offsetX"
            [columns]="columns"
            [rowHeight]="getRowHeight(row)"
            [row]="row"
            [rowIndex]="getRowIndex(row)"
            [expanded]="getRowExpanded(row)"
            [rowClass]="rowClass"
            [isPerson]="isPerson"
            (activate)="selector.onActivate($event, i)"
            >

          </datatable-body-row>
      </a>
<a [href]="hrefValue" id="myLink" *ngIf="openNewTabLink" (contextmenu)="onRightClick($event,row,openNewTabLinkId)" style="color: #333 ;text-decoration: none;">
          <datatable-body-row
          [editmode]="editmode"
            tabindex="-1"
            [layout]="layout"
            [style.display]=" layout=='Row'?'inline-block':''"
            [style.width]="(layout=='Row')?'initial':'none'"
            [isSelected]="selector.getRowSelected(row)"
            [innerWidth]="innerWidth"
            [offsetX]="offsetX"
            [columns]="columns"
            [rowHeight]="getRowHeight(row)"
            [row]="row"
            [rowIndex]="getRowIndex(row)"
            [expanded]="getRowExpanded(row)"
            [rowClass]="rowClass"
            [isPerson]="isPerson"
            (activate)="selector.onActivate($event, i)">

          </datatable-body-row>
      </a>

          </datatable-row-wrapper>
          </datatable-scroller>

    </datatable-selection>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'datatable-body'
  }
})
export class DataTableBodyComponent implements OnInit, OnDestroy {
  @ViewChild('datatable-selection', { read: ViewContainerRef, static: true }) datatables: ViewContainerRef;
  @ViewChild('datatableBodyCom') datatableBodyCom: ElementRef;
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.temp, event.previousIndex, event.currentIndex);
    this.dropColumn.emit(this.temp);
  }
  dataTableScroller = {
    'display': 'flex',
    'width': 'initial'
  };
  public editmode = -1;
  hrefValue: any = 'javascript:void(0)';
  @Input() isPerson: boolean;
  @Input() isStdDev: boolean;
  @Input() dropDropColumn: boolean;
  @Input() scrollbarV: boolean;
  @Input() isEditable: boolean;
  @Input() isSoftDelete: boolean;
  @Input() scrollbarH: boolean;
  @Input() loadingIndicator: any = false;
  @Input() externalPaging: boolean;
  @Input() rowHeight: any;
  @Input() offsetX: number;
  @Input() emptyMessage: string;
  @Input() selectionType: SelectionType;
  @Input() selected: any[] = [];
  @Input() rowIdentity: any;
  @Input() rowDetail: any;
  @Input() selectCheck: any;
  @Input() trackByProp: string;
  @Input() rowClass: any;
  @Input() isMenuOpen: boolean;
  @Input() isRowMenuOpen: boolean;
  @Input() recordManagerHide: boolean;
  @Input() currentRowIndex: number;
  @Input() component: string;
  @Input() activeRecord: string;
  @Input() permissions: string;
  @Input() inactivatable: string;
  @Input() archivable: string;
  @Input() mainRecordState: string;
  @Input() mainRecordId: string;
  @Input() lineOutable: string;
  @Input() layout: any;
  @Input() isLookup: any;
  @Input() openNewTabLink = '';
  @Input() openNewTabLinkId = '';
  @Input() cogFunc = true;
  @Input() linkId: any;

  //module model table details
  @Input() baseModelTable: any;

  @Input() set pageSize(val: number) {
    this._pageSize = val;
    this.recalcLayout();
  }

  get pageSize(): number {
    return this._pageSize;
  }

  @Input() set rows(val: any[]) {
    this._rows = val;
    this.rowExpansions.clear();
    this.recalcLayout();
  }

  get rows(): any[] {
    return this._rows;
  }

  @Input() set columns(val: any[]) {
    this._columns = val;

    const colsByPin = columnsByPin(val);
    this.columnGroupWidths = columnGroupWidths(colsByPin, val);
  }

  get columns(): any[] {
    return this._columns;
  }

  @Input() set offset(val: number) {
    this._offset = val;
    this.recalcLayout();
  }

  get offset(): number {
    return this._offset;
  }

  @Input() set rowCount(val: number) {
    this._rowCount = val;
    this.recalcLayout();
  }

  get rowCount(): number {
    return this._rowCount;
  }

  @Input() innerWidth: number;

  @HostBinding('style.width')
  get bodyWidth(): string {
    if (this.scrollbarH) {
      return this.innerWidth + 'px';
    } else {
      return '100%';
    }
  }

  @Input()
  @HostBinding('style.maxHeight')
  // set bodyHeight(val) {                   //prev on 10-1-18
  //   if (this.scrollbarV) {
  //     this._bodyHeight = val + 'px';
  //   } else {
  //     this._bodyHeight = 'auto';
  //   }

  set bodyHeight(val) {

    this._bodyHeight = val + 'px';

    this.recalcLayout();
  }

  get bodyHeight() {
    return this._bodyHeight;
  }

  @Output() scroll: EventEmitter<any> = new EventEmitter();
  @Output() page: EventEmitter<any> = new EventEmitter();
  @Output() activate: EventEmitter<any> = new EventEmitter();
  @Output() changeState: EventEmitter<any> = new EventEmitter();
  @Output() auditlog: EventEmitter<any> = new EventEmitter();
  @Output() dropColumn: EventEmitter<any> = new EventEmitter();
  @Output() select: EventEmitter<any> = new EventEmitter();
  @Output() detailToggle: EventEmitter<any> = new EventEmitter();
  @Output() actionsVisibility: EventEmitter<any> = new EventEmitter();
  @Output() rowContextmenu = new EventEmitter<{ event: MouseEvent, row: any }>(false);
  // giving undifined error Bug 2755
  @ViewChild(ScrollerComponent) scroller: any;

  /**
   * Returns if selection is enabled.
   */
  get selectEnabled(): boolean {
    return !!this.selectionType;
  }

  /**
   * Property that would calculate the height of scroll bar
   * based on the row heights cache for virtual scroll. Other scenarios
   * calculate scroll height automatically (as height will be undefined).
   */
  get scrollHeight(): any {
    if (this.scrollbarV) {
      return this.rowHeightsCache.query(this.rowCount - 1);
    }
  }

  onRightClick(event: any, row: any, id: any) {
    if (event) { }
    if (this.component == "System_Setting_Mrv") {
      this.hrefValue = window.location.protocol + '//' + window.location.host + '/#/' + this.openNewTabLink;
      this.changeHref();
    } else if (this.component == "User_Permission_List") {
      this.hrefValue = window.location.protocol + '//' + window.location.host + '/#/' + this.openNewTabLink + row.permission;
      this.changeHref();
    } else if (this.openNewTabLink && !id) {
      this.hrefValue = window.location.protocol + '//' + window.location.host + '/#/' + this.openNewTabLink + row.id;
      this.changeHref();
    } else {
      this.hrefValue = window.location.protocol + '//' + window.location.host + '/#/' + this.openNewTabLink + row.id + '/' + id;
      this.changeHref();
    }
  }

  changeHref() {
    setTimeout(() => {
      this.hrefValue = 'javascript:void(0)';
    }, 200);
  }


  rowHeightsCache: RowHeightCache = new RowHeightCache();
  temp: any[] = [];
  offsetY = 0;
  indexes: any = {};
  columnGroupWidths: any;
  rowTrackingFn: any;
  listener: any;
  rowIndexes: any = new Map();
  rowExpansions: any = new Map();

  _rows: any[];
  _bodyHeight: any;
  _columns: any[];
  _rowCount: number;
  _offset: number;
  _pageSize: number;

  /**
   * Creates an instance of DataTableBodyComponent.
   */
  constructor(private cd: ChangeDetectorRef, public utils: UtilsService, public mainlayout: MainLayoutComponent, public storage: CookieService) {
    // declare fn here so we can get access to the `this` property
    this.rowTrackingFn = function (index: number, row: any): any {
      if (index) { }
      const idx = this.rowIndexes.get(row);

      if (this.trackByProp) {
        return `${idx}-${this.trackByProp}`;
      } else {
        return idx;
      }
    }.bind(this);
  }

  /**
   * Called after the constructor, initializing input properties
   */
  ngOnInit(): void {




    if (this.rowDetail) {

      this.listener = this.rowDetail.toggle
        .subscribe(({ type, value }: { type: string, value: any }) => {
          if (type === 'row') this.toggleRowExpansion(value);
          if (type === 'all') this.toggleAllRows(value);

          // Refresh rows after toggle
          // Fixes #883
          this.updateIndexes();
          this.updateRows();
          this.cd.markForCheck();
        });
    }
  }

  /**
   * Called once, before the instance is destroyed.
   */
  ngOnDestroy(): void {

    if (this.rowDetail) this.listener.unsubscribe();
  }

  /**
   * Updates the Y offset given a new offset.
   */
  updateOffsetY(offset?: number): void {
    // scroller is missing on empty table
    if (!this.scroller) return;

    if (this.scrollbarV && offset) {
      // First get the row Index that we need to move to.
      const rowIndex = this.pageSize * offset;
      offset = this.rowHeightsCache.query(rowIndex - 1);
    }

    this.scroller.setOffset(offset || 0);
  }

  /**
   * Body was scrolled, this is mainly useful for
   * when a user is server-side pagination via virtual scroll.
   */
  onBodyScroll(event: any): void {
    const scrollYPos: number = event.scrollYPos;
    const scrollXPos: number = event.scrollXPos;

    // if scroll change, trigger update
    // this is mainly used for header cell positions
    if (this.offsetY !== scrollYPos || this.offsetX !== scrollXPos) {
      this.scroll.emit({
        offsetY: scrollYPos,
        offsetX: scrollXPos
      });
    }

    this.offsetY = scrollYPos;
    this.offsetX = scrollXPos;


  }

  /**
   * Updates the page given a direction.
   */
  updatePage(direction: string): void {
    let offset = this.indexes.first / this.pageSize;

    if (direction === 'up') {
      offset = Math.ceil(offset);
    } else if (direction === 'down') {
      offset = Math.ceil(offset);
    }

    if (direction !== undefined && !isNaN(offset)) {
      this.page.emit({ offset });
    }
  }

  /**
   * Updates the rows in the view port
   */
  updateRows(): void {
    const { first, last } = this.indexes;
    let rowIndex = first;
    let idx = 0;
    const temp: any[] = [];

    this.rowIndexes.clear();

    while (rowIndex < last && rowIndex < this.rowCount) {
      const row = this.rows[rowIndex];


      if (row) {
        this.rowIndexes.set(row, rowIndex);
        temp[idx] = row;

      }

      idx++;
      rowIndex++;
    }

    this.temp = temp;
  }

  /**
   * Get the row height
   */
  getRowHeight(row: any): number {
    let rowHeight = this.rowHeight;

    // if its a function return it
    if (typeof this.rowHeight === 'function') {
      rowHeight = this.rowHeight(row);
    }

    return rowHeight;
  }

  /**
   * Calculate row height based on the expanded state of the row.
   */
  getRowAndDetailHeight(row: any): number {
    let rowHeight = this.getRowHeight(row);
    const expanded = this.rowExpansions.get(row);

    // Adding detail row height if its expanded.
    if (expanded === 1) {
      rowHeight += this.getDetailRowHeight(row);
    }

    return rowHeight;
  }

  /**
   * Get the height of the detail row.
   */
  getDetailRowHeight = (row?: any, index?: any): number => {
    if (!this.rowDetail) return 0;
    const rowHeight = this.rowDetail.rowHeight;
    return typeof rowHeight === 'function' ? rowHeight(row, index) : rowHeight;
  };

  /**
   * Calculates the styles for the row so that the rows can be moved in 2D space
   * during virtual scroll inside the DOM.   In the below case the Y position is
   * manipulated.   As an example, if the height of row 0 is 30 px and row 1 is
   * 100 px then following styles are generated:
   *
   * transform: translate3d(0px, 0px, 0px);    ->  row0
   * transform: translate3d(0px, 30px, 0px);   ->  row1
   * transform: translate3d(0px, 130px, 0px);  ->  row2
   *
   * Row heights have to be calculated based on the row heights cache as we wont
   * be able to determine which row is of what height before hand.  In the above
   * case the positionY of the translate3d for row2 would be the sum of all the
   * heights of the rows before it (i.e. row0 and row1).
   */
  getRowsStyles(row: any): any {
    const rowHeight = this.getRowAndDetailHeight(row);

    const styles = {
      height: rowHeight + 'px'
    };


    if (this.scrollbarV) {
      const idx = this.rowIndexes.get(row) || 0;


      // The position of this row would be the sum of all row heights
      // until the previous row position.
      const pos = this.rowHeightsCache.query(idx - 1);

      translateXY(styles, 0, pos);
    }

    return styles;
  }

  /**
   * Hides the loading indicator
   */
  hideIndicator(): void {
    setTimeout(() => this.loadingIndicator = false, 500);
  }

  /**
   * Updates the index of the rows in the viewport
   */
  updateIndexes(): void {
    let first = 0;
    let last = 0;

    if (this.scrollbarV) {
      // Calculation of the first and last indexes will be based on where the
      // scrollY position would be at.  The last index would be the one
      // that shows up inside the view port the last.
      const height = parseInt(this.bodyHeight, 0);
      first = this.rowHeightsCache.getRowIndex(this.offsetY);
      last = this.rowHeightsCache.getRowIndex(height + this.offsetY) + 1;
    } else {
      // The server is handling paging and will pass an array that begins with the
      // element at a specified offset.  first should always be 0 with external paging.
      if (!this.externalPaging) {
        first = Math.max(this.offset * Number(this.pageSize), 0);
      }
      last = Math.min((first + Number(this.pageSize)), this.rowCount);
    }

    this.indexes = { first, last };
  }

  /**
   * Refreshes the full Row Height cache.  Should be used
   * when the entire row array state has changed.
   */
  refreshRowHeightCache(): void {
    if (!this.scrollbarV) return;

    // clear the previous row height cache if already present.
    // this is useful during sorts, filters where the state of the
    // rows array is changed.
    this.rowHeightsCache.clearCache();

    // Initialize the tree only if there are rows inside the tree.
    if (this.rows && this.rows.length) {
      this.rowHeightsCache.initCache({
        rows: this.rows,
        rowHeight: this.rowHeight,
        detailRowHeight: this.getDetailRowHeight,
        externalVirtual: this.scrollbarV && this.externalPaging,
        rowCount: this.rowCount,
        rowIndexes: this.rowIndexes,
        rowExpansions: this.rowExpansions
      });
    }
  }

  /**
   * Gets the index for the view port
   */
  getAdjustedViewPortIndex(): number {
    // Capture the row index of the first row that is visible on the viewport.
    // If the scroll bar is just below the row which is highlighted then make that as the
    // first index.
    const viewPortFirstRowIndex = this.indexes.first;

    if (this.scrollbarV) {
      const offsetScroll = this.rowHeightsCache.query(viewPortFirstRowIndex - 1);
      return offsetScroll <= this.offsetY ? viewPortFirstRowIndex - 1 : viewPortFirstRowIndex;
    }

    return viewPortFirstRowIndex;
  }

  /**
   * Toggle the Expansion of the row i.e. if the row is expanded then it will
   * collapse and vice versa.   Note that the expanded status is stored as
   * a part of the row object itself as we have to preserve the expanded row
   * status in case of sorting and filtering of the row set.
   */
  toggleRowExpansion(row: any): void {
    // Capture the row index of the first row that is visible on the viewport.
    const viewPortFirstRowIndex = this.getAdjustedViewPortIndex();
    let expanded = this.rowExpansions.get(row);

    // If the detailRowHeight is auto --> only in case of non-virtualized scroll
    if (this.scrollbarV) {
      const detailRowHeight = this.getDetailRowHeight(row) * (expanded ? -1 : 1);
      const idx = this.rowIndexes.get(row) || 0;
      this.rowHeightsCache.update(idx, detailRowHeight);
    }

    // Update the toggled row and update thive nevere heights in the cache.
    expanded = expanded ^= 1;
    this.rowExpansions.set(row, expanded);

    this.detailToggle.emit({
      rows: [row],
      currentIndex: viewPortFirstRowIndex
    });
  }

  /**
   * Expand/Collapse all the rows no matter what their state is.
   */
  toggleAllRows(expanded: boolean): void {
    // clear prev expansions
    this.rowExpansions.clear();

    const rowExpanded = expanded ? 1 : 1;

    // Capture the row index of the first row that is visible on the viewport.
    const viewPortFirstRowIndex = this.getAdjustedViewPortIndex();

    for (const row of this.rows) {
      this.rowExpansions.set(row, rowExpanded);
    }

    if (this.scrollbarV) {
      // Refresh the full row heights cache since every row was affected.
      this.recalcLayout();
    }

    // Emit all rows that have been expanded.
    this.detailToggle.emit({
      rows: this.rows,
      currentIndex: viewPortFirstRowIndex
    });
  }

  /**
   * Recalculates the table
   */
  recalcLayout(): void {
    this.refreshRowHeightCache();
    this.updateIndexes();
    this.updateRows();
  }

  /**
   * Returns if the row was expanded
   */
  getRowExpanded(row: any): boolean {
    const expanded = this.rowExpansions.get(row);
    return expanded === 1;
  }

  /**
   * Gets the row index of the item
   */
  getRowIndex(row: any): number {
    return this.rowIndexes.get(row);
  }


    getGearMenuItemVisibilityStatus(status: string, row?: any): any {

    if (status === 'Edit') {
      return this.component !== 'PersonNameEditCreate' && this.component !== 'Task_manager'  && this.component !== 'formDesign'
        && this.component !== 'listMember' && this.component !== 'System_User'
        && this.component !== 'Navigation'
        && this.component !== 'fileDesign' && this.component !== 'MTxUserCreatedMTFile' && this.component !== 'CompanyEditName'
        && this.component !== 'acquiredCompany' && this.component !== 'RequiredRecord' && this.component !== 'PersonCompany'
        && this.component !== 'Pick_List' && this.component !== 'Pick_List_View_Property'
        && this.component !== 'RequiredRecord' && this.component !== 'DisplayQualifier' && this.component !== 'EditableQualifier'
        && this.component !== 'Validation' && this.component !== 'Validation_Qualifier'
        && this.component !== 'Validation-srv' && this.component !== 'DependencyQualifier' && this.component !== 'MTxFileVersion'
        && this.component !== 'MTxfileAssociation'
        && this.component !== 'personsCompany'
        && this.component !== 'User_Classification_Edit' && (this.mainRecordState !== 'Archived' && this.mainRecordState !== 'Soft Deleted');
    } else if (status === 'Inactive' && (this.mainRecordState !== 'Archived' && this.mainRecordState !== 'Soft Deleted')) {

      return true;

    } else if (status === 'Reactive' && (this.mainRecordState !== 'Archived' && this.mainRecordState !== 'Soft Deleted')) {

      return true;

    } else if (status === 'Archive' && (this.mainRecordState !== 'Archived' && this.mainRecordState !== 'Soft Deleted')) {

      return true;

    } else if (status === 'Archive & Create' && (this.mainRecordState !== 'Archived' && this.mainRecordState !== 'Soft Deleted')) {

      return true;

    } else if (status === 'Soft Delete & Create' && (this.mainRecordState !== 'Archived' && this.mainRecordState !== 'Soft Deleted')) {
      return this.component === 'PersonNameEditCreate' || this.component === 'CompanyEditName'
        || this.activeRecord === 'Single, for Related' && this.component !== 'workProduct' && this.component !== 'PtmModule';
    } else if (status === 'Restore' && (this.mainRecordState !== 'Archived' && this.mainRecordState !== 'Soft Deleted')) {

      return true;

    } else if (status === 'Soft Delete' && (this.mainRecordState !== 'Archived' && this.mainRecordState !== 'Soft Deleted')) {

      return true;

    } else if (status === 'Audit Log') {
      return this.component !== 'Validation-srv' && this.component !== 'workProduct';
    } else if (status === 'Record Manager' && ((this.mainRecordState !== 'Archived' && this.mainRecordState !== 'Soft Deleted')
      || (this.component === 'User_Classification_Edit' || this.component === 'Model_Property' || this.component === 'modelViewList'))) {
      return true;
    } else if (this.component == 'Model_Property' && status === 'Active' && (this.mainRecordState !== 'Archived' && this.mainRecordState !== 'Soft Deleted')) {
      return true;
    } else if (status == 'Reset Password' && this.component == 'User_Management') {
        const tempRow = typeof (row.type) == 'string' ? row.type.split(',') : row.type;
        return tempRow.some((type: any) => type.id == "Administrator (User)");
    }

  }



  checkisRecordLockByComponent(component: any, row: any) {
      if (component == "modelViewList" || component == "Level_Qualifiers" || component == "Validation" || (component == "Model_Property" && this.permissions == "Model Property") || component == 'User_Classification_Edit' || component == 'PicklistPropertysrv' || component == 'Boilerplate_Text_List' || component == 'Text_Qualifier' || component == 'Boilerplate_Text_Value' || component == 'acquiredCompany' || component == 'companyContactInformation' || component == 'personsCompany' || component == 'Location' || component == "PersonNameEditCreateNew" || component == "PersonEditCreate" || component == "PersonCompany" || component == "PersonEditCreatePersonClassification" || component == 'fileDesign' || component === 'extensionTable' || component == 'Automation_Setup' || (component == 'Automation_Design' && this.permissions != 'Automation Design') || component == 'Related_Filter' || component == 'Analytics_Query' || component == 'Analytics_Additional_Data' || component == 'Analytics_Repository' || component == 'FileVersion' || component == 'propertyAutomaitonDesign' || component == 'File_Record' || component == 'formDesign' || component == 'Render_Engine' || component == 'renderEngine' || component == 'Render_Engine_srv' || component == 'TemplateDeign') {
      return this.mainlayout.checkisRecordLock('test', this.mainRecordId);
    } else {
      return this.mainlayout.checkisRecordLock('test', row.id);
    }
  }

  getSoftDeleteForFileVersion(component: any, row: any) {
    if (component == 'FileVersion') {
      if (row.status == 'Approved' || row.status == 'Uploaded') {
        return false;
      } else {
        return true;
      }
    } else if(component == 'File-amendement'){
        if(row.status == 'Approved'){
          return false;
        }else{
          return true;
        }
      }else{
      return true;
    }
  }

  checkRestoreAvailablity(component:string, row:any){
    if(component == 'Model_Table'){
      if(row.type == 'File' &&  row.category == 'User Created'){
        return false;
      }else{
        return true;
      }
    }else{
      return true;
    }
  }
}
