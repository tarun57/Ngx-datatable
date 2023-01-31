import { Component, Output, EventEmitter, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'datatable-footer',
  template: `
    <div
      class="datatable-footer-inner"
      [ngClass]="{'selected-count': selectedMessage}"
      [style.height.px]="footerHeight">
      <ng-template
        *ngIf="footerTemplate"
        [ngTemplateOutlet]="footerTemplate.template"
        [ngTemplateOutletContext]="{ 
          rowCount: rowCount, 
          pageSize: pageSize, 
          selectedCount: selectedCount,
          curPage: curPage,
          offset: offset
        }">
      </ng-template>
      <div>
      <div class="page-count" *ngIf="!footerTemplate">
        <span *ngIf="selectedMessage">
          {{selectedCount.toLocaleString()}} {{selectedMessage}} / 
        </span>
        {{VisiableRow}} {{totalMessage}}       
      </div>
      </div>
     <div style="width: max-content;margin-left: auto;">
      <div style="padding:0 0.5rem;display:inline-block"><span style="font-size:1.3rem">Display</span> </div>
      <div style="display:inline-block" *ngIf="!footerTemplate">      
       <span>     
        <select class="form-control" name="page" [(ngModel)]="pageSize" (change)="setPageSize()" style="height: 32px;width: 71px">
        <option value="10">10</option>
        <option valuev="25">25</option>
        <option value="50">50</option>
        <option value="100">100</option>  
        <option value="all">All</option>
        </select>  
        </span>    
            
      </div>
      <div style="padding:0 0.5rem;display:inline-block">Records / Page</div>
      </div>
       <div style="margin-left:3rem">
      <datatable-pager *ngIf="!footerTemplate"
        [pagerLeftArrowIcon]="pagerLeftArrowIcon"
        [pagerRightArrowIcon]="pagerRightArrowIcon"
        [pagerPreviousIcon]="pagerPreviousIcon"
        [pagerNextIcon]="pagerNextIcon"
        [page]="curPage"
        [size]="pageSize"
        [count]="rowCount"
        [hidden]="false"
        (change)="setPageSizeEvent($event)">
      </datatable-pager>
      </div>

    </div>
  `,
  host: {
    class: 'datatable-footer'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTableFooterComponent {

  public set_page_size: number;
  @Input() totalRows: any
  @Input() footerHeight: number;
  @Input() rowCount: number;
  @Input() VisiableRow: number;
  @Input() pageSize: any;
  @Input() offset: number;
  @Input() pagerLeftArrowIcon: string;
  @Input() pagerRightArrowIcon: string;
  @Input() pagerPreviousIcon: string;
  @Input() pagerNextIcon: string;
  @Input() totalMessage: string;
  @Input() footerTemplate: any;

  @Input() selectedCount: number = 0;
  @Input() selectedMessage: string | boolean;

  @Output() page: EventEmitter<any> = new EventEmitter();

  ngOnChanges() {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    
    if (this.pageSize !=10 && this.pageSize != 25 && this.pageSize != 50 && this.pageSize != 100) {
      this.pageSize = 'all';
    }
  }
  constructor() {

  }

  get isVisible(): boolean {
    return (this.rowCount / this.pageSize) > 1;
  }

  setPageSize(): void {
    this.page.emit({
      offset: this.offset + 1,
      page: 1,
      pageSize: this.pageSize,
      size: this.pageSize
    })
  }


  setPageSizeEvent(event:any) {
    this.page.emit({
      offset: event.page,
      page: event.page,
      pageSize: this.pageSize
    })
  }



  get curPage(): number {
    return this.offset + 1;
  }

}
