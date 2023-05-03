import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, OnChanges {

  @Input()
  public records: any;

  @Input()
  public headerColumns: string[];

  public dataSource: MatTableDataSource<any>;

  displayedColumns: string[] = ['course_code', 'course_coordinator', 'name', 'semester', 'year', 'grade'];


  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.records && this.dataSource) {
      this.dataSource = new MatTableDataSource(this.records);
    }
  }
}
