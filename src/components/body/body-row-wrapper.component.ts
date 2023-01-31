import {
  Component, Input, Output, EventEmitter, HostListener, ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector: 'datatable-row-wrapper',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-content></ng-content>
    <div
      *ngIf="expanded"
      [style.height.px]="detailRowHeight"
      class="datatable-row-detail"
      style="{{layout=='Row'?'display: inline-block':''}}"
      >

      <ng-template
        *ngIf="rowDetail && rowDetail.template"
        [ngTemplateOutlet]="rowDetail.template"
        [ngTemplateOutletContext]="{ 
          row: row, 
          expanded: expanded,
          rowIndex: rowIndex
        }">
      </ng-template>
    </div>
  `,
  host: {
    class: 'datatable-row-wrapper'
  }
})
export class DataTableRowWrapperComponent {

  @Input() rowDetail: any;
  @Input() detailRowHeight: any;
  @Input() expanded: boolean = false;
  @Input() row: any;
  @Input() rowIndex: number;
  @Input() layout: any;

  @Output() rowContextmenu = new EventEmitter<{ event: MouseEvent, row: any }>(false);

  @HostListener('contextmenu', ['$event'])
  onContextmenu($event: MouseEvent): void {
    this.rowContextmenu.emit({ event: $event, row: this.row });
  }
}
