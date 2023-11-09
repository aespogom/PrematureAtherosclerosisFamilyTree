import { Component, Input, OnInit } from '@angular/core';
import { SpinnerService } from 'src/app/services/spinner.service';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent implements OnInit {
  @Input() public message: string;


  constructor(public spinner: SpinnerService) { }

  public ngOnInit():void {
    
  }

}
