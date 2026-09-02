import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { catchError, take } from 'rxjs';
import { DocumenttypeTreeService } from 'src/app/core/data/documenttypetree.service';
import { RemoteData } from 'src/app/core/data/remote-data';
import { DocumentTypeTree } from 'src/app/core/shared/documenttypetree.model';
import { getFirstCompletedRemoteData } from 'src/app/core/shared/operators';
import { FabricCanvasComponent } from '../fabric-canvas/fabric-canvas.component';

@Component({
  selector: 'ds-canvas-manager',
  templateUrl: './canvas-manager.component.html',
  styleUrls: ['./canvas-manager.component.scss']
})
export class CanvasManagerComponent implements OnInit,AfterViewInit {

  @Input() noteInfo: string = '';
  @Input() penColor: any;
  @Input() eraserMode: boolean = false;
  @Input() generalNote: boolean = false;
  @Input() itemId: string = '';
  @Input() usePen;
  first:boolean;
  canAddCanvas:boolean = false;

  canvasIds: string[] = [];
  canvasDataString: any = [];
  // @ViewChild('canvases') !canvas: FabricCanvasComponent;
  @ViewChildren('canvases') canvases: QueryList<FabricCanvasComponent>;
  constructor(private documenttypeTreeService: DocumenttypeTreeService,
    private cdref: ChangeDetectorRef,) {}
  ngAfterViewInit(): void {
    this.scrollContainer.nativeElement.addEventListener('scroll', this.onScroll.bind(this));
  }

  ngOnInit(): void {
    debugger;
    if (this.generalNote) {
      this.documenttypeTreeService.getGeneralNoteData(this.itemId).pipe(
        catchError((error) => {
          let data = {
            "itemRest": {
              "uuid": this.itemId
            },
            "pdfannotationStr": "",
            "noteannotatiostr": ""
          };
          this.documenttypeTreeService.saveAnnotation(data).pipe(
            getFirstCompletedRemoteData(),
            take(1)
          ).subscribe((response: RemoteData<DocumentTypeTree>) => {
            if (response.isSuccess) {
              this.canvasIds.push('canvas' + new Date().getTime());
              this.cdref.detectChanges();
            }           
          });
          return error;
        })
      ).subscribe((data) => {
        if (!!data['noteannotatiostr'] && data['noteannotatiostr'] !== "{}") {
          const notedata = this.parsedData(data['noteannotatiostr']);
          localStorage.setItem(this.itemId, data['noteannotatiostr'])
          for (const obj of notedata) {
            for (const key in obj) {
              if (key === 'canvasId') {
                this.canvasIds.push(obj['canvasId']);
                this.cdref.detectChanges();
              }
              // if (Object.hasOwnProperty.call(obj, key)) {
              //   // this.noteList.push('Note' + i);
              //   let objkeydata = this.parsedData(obj[key]);
              //   this.canvasDataString = objkeydata;
              //   if(!!this.canvasDataString && this.canvasDataString.length > 0) {
              //     for (const i of this.canvasDataString) {
              //       for (let key in i) {
              //         if (key === 'canvasId') {
              //           this.canvasIds.push(i['canvasId']);
              //         }
              //       }
              
              //     }
              //   } else {
              //     this.canvasIds.push('canvas' + new Date().getTime());
              //   }
              // }
            }
          }
          // If no canvasIds were found in the data (e.g. empty array "[]"
          // or objects without canvasId), create a default canvas so the
          // sketchpad is still visible.
          if (this.canvasIds.length === 0) {
            this.canvasIds.push('canvas' + new Date().getTime());
            this.cdref.detectChanges();
          }
        } else {
          this.canvasIds.push('canvas' + new Date().getTime());
          this.cdref.detectChanges();
        }
      });
    } else {
      this.loadCanvases();
    }
    
  }

  loadCanvases() {
    debugger;
    this.canAddCanvas = false;
    this.canvasIds = [];
      this.canvasDataString = this.generalNote ? this.parsedData(localStorage.getItem(this.itemId)) : this.parsedData(localStorage.getItem(this.noteInfo));
      // this.canvasDataString = this.parsedData(localStorage.getItem(this.noteInfo));  
    
    if(!!this.canvasDataString && this.canvasDataString.length > 0) {
      for (const i of this.canvasDataString) {
        for (let key in i) {
          if (key === 'canvasId') {
            this.canvasIds.push(i['canvasId']);
          }
        }
  
      }
      // If the data array had items but none contained a canvasId,
      // create a default canvas so the sketchpad is still visible.
      if (this.canvasIds.length === 0) {
        this.canvasIds.push('canvas' + new Date().getTime());
      }
      setTimeout(() => {
        this.canAddCanvas = true; // Re-enable adding new canvases
      }, 500);
    } else {
      this.canvasIds.push('canvas' + new Date().getTime());
    }
 
  }

  parsedData(data: any) {
    while (typeof data !== 'object') {
      try {
        data = JSON.parse(data);
      } catch (error) {
        console.error('Parsing failed:', error);
        break;
      }
    }
    return data;
  }

  addCanvas() {
    const newCanvasId = 'canvas' + new Date().getTime();
    this.canvasIds.push(newCanvasId);
  }
  @ViewChild('scrollContainer', { static: false }) scrollContainer: ElementRef;
  onScroll(event: any) {
    const element = event.target;
    const tolerance = 10; // Adjust the tolerance value as needed
    if (element.scrollHeight - element.scrollTop <= element.clientHeight + tolerance) {
      this.resizeCanvases(element.clientHeight + 500);
    }
  }

  resizeCanvases(newHeight: number) {
    this.canvases.forEach(canvasComponent => {
      // canvasComponent.resizeCanvasElement(newHeight);
    });
  }

 
}
