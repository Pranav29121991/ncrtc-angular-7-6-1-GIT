import { Component, Input, OnInit, AfterViewInit, ChangeDetectorRef, Output, EventEmitter, ElementRef, ViewChild, Renderer2 } from '@angular/core';
import { catchError, take } from 'rxjs';
import { DocumenttypeTreeService } from 'src/app/core/data/documenttypetree.service';
import { RemoteData } from 'src/app/core/data/remote-data';
import { DocumentTypeTree } from 'src/app/core/shared/documenttypetree.model';
import { getFirstCompletedRemoteData } from 'src/app/core/shared/operators';

@Component({
  selector: 'ds-fabric-canvas',
  templateUrl: './fabric-canvas.component.html',
  styleUrls: ['./fabric-canvas.component.scss']
})
export class FabricCanvasComponent implements AfterViewInit {
  @Input() generalNote: boolean = false;
  @Input() itemId: string = '';
  @Input() usePen: boolean;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('scrollContainer', { static: false }) scrollContainer: ElementRef;

  private isDrawing: boolean = false;
  private lastX: number = 0;
  private lastY: number = 0;
  private ctx: CanvasRenderingContext2D;
  private cursorSize: number = 16;
   // Initial canvas height
   initialHeight = 1200;
   heightIncrement = 500; // Amount to increase the canvas height by
   isLoading:boolean = false;
  // constructor(private renderer: Renderer2) {}
  constructor(
    private documenttypeTreeService: DocumenttypeTreeService,
    private renderer: Renderer2,
    private cdref : ChangeDetectorRef
  ) { }

  ngAfterViewInit() {
    // this.setCanvasWidth();
    this.bindEventListeners(this.canvasRef.nativeElement);
    if(!this.generalNote) {
    this.loadCanvasData();
    } else {
      this.loadGeneralNoteData();
    }
    this.ctx = this.canvasRef.nativeElement.getContext('2d');
    this.scrollContainer.nativeElement.addEventListener('scroll', this.onScroll.bind(this));
  }

   
  onScroll(event: any) {
    const element = event.target;
    const tolerance = 10; // Adjust as needed
    if (element.scrollHeight - element.scrollTop <= element.clientHeight + tolerance) {
      this.resizeCanvas();
    }
  }

  resizeCanvas() {
    const canvas = this.canvasRef.nativeElement;
    canvas.height += this.heightIncrement;

    // Optionally, redraw or adjust content here if necessary
    this.redrawCanvasContent();
  }

  redrawCanvasContent() {
    const canvas = this.canvasRef.nativeElement;
    const context = canvas.getContext('2d');
    if(!this.generalNote) {
      this.loadCanvasData();
      } else {
        this.loadGeneralNoteData();
      }

    // Draw or adjust existing content here
    // Example: You may want to preserve the existing content when resizing
    // const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    // context.putImageData(imageData, 0, 0);
  }

  setCanvasWidth() {
      const canvas = this.canvasRef.nativeElement;
      const parentWidth = canvas.parentElement.clientWidth;
      if (!parentWidth || canvas.width === parentWidth) {
        return;
      }
      // Setting the canvas width/height attribute clears the bitmap,
      // so preserve the current content and restore it after resizing.
      const ctx = canvas.getContext('2d')!;
      const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      this.renderer.setAttribute(canvas, 'width', parentWidth.toString());
      ctx.putImageData(snapshot, 0, 0);
  }
  
  loadCanvasData() {
    const storedData = localStorage.getItem(this.noteInfo);
    const canvasDataArray: any[] = storedData ? JSON.parse(storedData) : [];

    const canvasData = canvasDataArray.find((data) => data.canvasId === this.canvasId);
    if (canvasData) {
      const img = new Image();
      img.src = canvasData.data;
      img.onload = () => {
        const ctx = this.canvasRef.nativeElement.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
      };
    }
  }

  loadGeneralNoteData() {
    debugger;
    const storedData = localStorage.getItem(this.itemId);
    const canvasDataArray: any[] = storedData ? JSON.parse(storedData) : [];

    const canvasData = canvasDataArray.find((data) => data.canvasId === this.canvasId);
    if (canvasData) {
      const img = new Image();
      img.src = canvasData.data;
      img.onload = () => {
        const ctx = this.canvasRef.nativeElement.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
      }
      this.cdref.detectChanges();
    }
  }

  bindEventListeners(canvas: HTMLCanvasElement) {
    // Bind event listeners for pointer events
    // canvas.addEventListener('pointerdown', this.startDrawing.bind(this));
    // canvas.addEventListener('pointermove', this.draw.bind(this));
    // canvas.addEventListener('pointerup', this.endDrawing.bind(this));
    // canvas.addEventListener('pointerleave', this.endDrawing.bind(this));
    // Bind event listeners for mouse events
    canvas.addEventListener('mousedown', this.startDrawing.bind(this));
    canvas.addEventListener('mousemove', this.draw.bind(this));
    canvas.addEventListener('mouseup', this.endDrawing.bind(this));
    canvas.addEventListener('mouseleave', this.endDrawing.bind(this));

    // Bind event listeners for touch events
    canvas.addEventListener('touchstart', this.startDrawing.bind(this));
    canvas.addEventListener('touchmove', this.draw.bind(this));
    canvas.addEventListener('touchend', this.endDrawing.bind(this));
    canvas.addEventListener('touchcancel', this.endDrawing.bind(this));
  }

  startDrawing(event: MouseEvent | TouchEvent) {
    this.isDrawing = true;

    if (event instanceof PointerEvent && event.pointerType === 'pen'&& !this.usePen) {
      console.log('Drawing with a pen');
      // You can customize your drawing logic for pen here
    } else if (event instanceof PointerEvent && event.pointerType === 'touch' && this.usePen) {
      console.log('Drawing with a finger');
      // You can customize your drawing logic for touch here
    }

    const { offsetX, offsetY } = this.getCoordinates(event);
    this.lastX = offsetX;
    this.lastY = offsetY;
    event.preventDefault(); // Prevent default touch event behavior
  }

  draw(event: MouseEvent | TouchEvent) {
    if (!this.isDrawing) return;

    const { offsetX, offsetY } = this.getCoordinates(event);
    const ctx = this.canvasRef.nativeElement.getContext('2d')!;
    
    ctx.strokeStyle = this.penColor; // Example color
    ctx.lineWidth = this.penColor === '#ffffff' ? 20 : 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(this.lastX, this.lastY);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();

    this.lastX = offsetX;
    this.lastY = offsetY;
    event.preventDefault(); // Prevent default touch event behavior
  }
  private points: Array<{ x: number, y: number }> = [];
  endDrawing() {
    this.isDrawing = false;
    // if (this.points.length > 0) {
    //   const decimatedPoints = this.decimatePoints(this.points, 0.5); // Adjust decimation factor as needed
    //   this.redrawCanvas(decimatedPoints);
      this.saveCanvas();
    // }
  }

  redrawCanvas(points: Array<{ x: number, y: number }>) {
    const ctx = this.canvasRef.nativeElement.getContext('2d')!;
    ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = this.penColor;
    for (let i = 0; i < points.length - 1; i++) {
      ctx.moveTo(points[i].x, points[i].y);
      ctx.lineTo(points[i + 1].x, points[i + 1].y);
    }
    ctx.stroke();
  }

  decimatePoints(points: Array<{ x: number, y: number }>, tolerance: number) {
    if (points.length < 3) return points;
    const sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;
    let prevPoint = points[0];
    let newPoints = [prevPoint];
    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      const dx = point.x - prevPoint.x;
      const dy = point.y - prevPoint.y;
      if (dx * dx + dy * dy > sqTolerance) {
        newPoints.push(point);
        prevPoint = point;
      }
    }
    newPoints.push(points[points.length - 1]);
    return newPoints;
  }

  getCoordinates(event: MouseEvent | TouchEvent): { offsetX: number, offsetY: number } {
    let offsetX: number;
    let offsetY: number;

    const canvasRect = this.canvasRef.nativeElement.getBoundingClientRect();

    if (event instanceof MouseEvent) {
      offsetX = event.offsetX;
      offsetY = event.offsetY;
    } else if (event instanceof TouchEvent) {
      const touch = event.touches[0] || event.changedTouches[0];
      offsetX = touch.clientX - canvasRect.left;
      offsetY = touch.clientY - canvasRect.top;
    } else {
      offsetX = 0;
      offsetY = 0;
    }

    return { offsetX, offsetY };
  }

  addNewCanvas() {
    const newCanvas = this.renderer.createElement('canvas');
    this.setCanvasWidth();
    this.renderer.setAttribute(newCanvas, 'height', '600');
    this.bindEventListeners(newCanvas);
    const parentElement = this.canvasRef.nativeElement.parentElement;
    this.renderer.appendChild(parentElement, newCanvas);
  }
  @Input() canvasId: string = '';
  @Input() noteInfo: string;
  @Output() changeInCanvas = new EventEmitter<void>;

  @Input() penColor: string = '#000000';
  @Input() eraserMode: boolean = false;
  @Input() isFirst: boolean = false;

  // canvas: fabric.Canvas | undefined;
  isDrawingMode: boolean = true;
  canvasDataString: any = [];

  

  ngOnInit() {
    this.canvasId = this.canvasId || 'canvas' + new Date().getTime();
    if(!this.generalNote) {
      this.canvasDataString = this.parsedData(localStorage.getItem(this.noteInfo));
    }
  }

  saveCanvas() {
      const json =  this.canvasRef.nativeElement.toDataURL();

      // Retrieve existing data from local storage
      if(!this.generalNote) {
        const storedData = localStorage.getItem(this.noteInfo);
      
        let canvasDataArray: any[] = storedData ? JSON.parse(storedData) : [];
  
        // Find the index of the current canvas data if it exists
        const canvasIndex = canvasDataArray.findIndex((data) => data.canvasId === this.canvasId);
  
        if (canvasIndex !== -1) {
          // Update the existing canvas data
          canvasDataArray[canvasIndex].data = json;
        } else {
          // Add new canvas data to the array
          canvasDataArray.push({ canvasId: this.canvasId, data: json });
        }
  
        // Store updated array back to local storage
        localStorage.setItem(this.noteInfo, JSON.stringify(canvasDataArray));
        this.saveNotes();
      } else {
        const storedData = localStorage.getItem(this.itemId);
      
        let canvasDataArray: any[] = storedData ? JSON.parse(storedData) : [];
  
        // Find the index of the current canvas data if it exists
        const canvasIndex = canvasDataArray.findIndex((data) => data.canvasId === this.canvasId);
  
        if (canvasIndex !== -1) {
          // Update the existing canvas data
          canvasDataArray[canvasIndex].data = json;
        } else {
          // Add new canvas data to the array
          canvasDataArray.push({ canvasId: this.canvasId, data: json });
        }
  
        // Store updated array back to local storage
        localStorage.setItem(this.itemId, JSON.stringify(canvasDataArray));
          this.saveGeneralNotes(canvasDataArray);
        }
        // Store updated array back to local storage
        // localStorage.setItem(this.noteInfo, JSON.stringify(canvasDataArray));
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

  saveGeneralNotes(notedata: any) {
    var data = {};
    data = {
      "itemRest": {
        "uuid": this.itemId
      },
      "pdfannotationStr": "",
      "noteannotatiostr": JSON.stringify(notedata)
    };
    this.documenttypeTreeService.saveAnnotation(data).pipe(
      getFirstCompletedRemoteData(),
      take(1)
    ).subscribe((response: RemoteData<DocumentTypeTree>) => {
      this.isLoading = false;
      this.cdref.detectChanges();
      // if(this.canvasDataString = []) {
        // this.loadGeneralNoteData();
      // }
    });
  }

  saveNotes() {
    if(!this.generalNote) {
      var note = localStorage.getItem(this.noteInfo);
      const idRegex = /\/bitstreams\/([a-f0-9-]+)\/content/;
  
      // Executing the regular expression on the URL
      const match = this.noteInfo.match(idRegex);
      var uuidArrayNote: any = [];
      var uuid: string = '';
      var uuidArray = [];
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
  
        // Check if the key contains the pattern 'bitstreams'
        if (key.includes(match[1])) {
          // Push the UUID into the array
          if (key.includes("?page-")) {
            const substringRegex = /\?([^?]+)$/;
            const match1 = key.match(substringRegex);
            const data = localStorage.getItem(key);
            const obj = {};
            obj[match1[1]] = data;
            uuidArrayNote.push(obj);
          }
          if (key.includes("content_page_fabric")) {
            const data = localStorage.getItem(key);
            uuidArray.push(data);
          }
          if (key.includes("uuid")) {
            const data2 = localStorage.getItem(key);
            uuid = data2;
          }
        }
  
      }
      var data = {};
      data = {
        bitstreamRest: {
          uuid: match[1]
        },
        pdfannotationStr: JSON.stringify(uuidArray),
        noteannotatiostr: JSON.stringify(uuidArrayNote),
        uuid: uuid
      };
      this.documenttypeTreeService.saveAnnotation(data).pipe(
        getFirstCompletedRemoteData(),
        take(1)
      ).subscribe((response: RemoteData<DocumentTypeTree>) => {
        this.isLoading = false;
        this.cdref.detectChanges();
      });
    } else {

    }
    
  }

  // setDrawingMode() {
  //   if (this.canvas) {
  //     this.isDrawingMode = true;
  //     this.canvas.isDrawingMode = true;
  //     this.canvas.freeDrawingBrush.color = this.penColor; // Set drawing color
  //     this.canvas.freeDrawingBrush.width = 1;
  //   }
  // }

  // setEraserMode() {
  //   if (this.canvas) {
  //     this.isDrawingMode = false;
  //     this.canvas.isDrawingMode = true;
  //     this.canvas.freeDrawingBrush.color = '#ffffff'; // Set eraser color (assuming white background)
  //     this.canvas.freeDrawingBrush.width = 10;
  //   }
  // }



  clearCanvas() {
    this.isLoading = true;
      const ctx = this.canvasRef.nativeElement.getContext('2d')!;
      ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
      // if(this.generalNote) {
        this.saveCanvas();
      // } else {
      //   this.saveNotes();
      // }
      
  }

  deleteCanvas() {
    // Remove the canvas data from local storage
    if(this.generalNote) {

      const storedData = localStorage.getItem(this.itemId);
      let canvasDataArray: any[] = storedData ? JSON.parse(storedData) : [];
  
      canvasDataArray = canvasDataArray.filter((data) => data.canvasId !== this.canvasId);
  
      localStorage.setItem(this.itemId, JSON.stringify(canvasDataArray));
  
      // Clear the canvas from the fabric.js canvas
      // if (this.canvas) {
      //   this.canvas.clear();
      //   this.canvas.dispose();
      // }
      this.changeInCanvas.emit();
    } else {
      const storedData = localStorage.getItem(this.noteInfo);
      let canvasDataArray: any[] = storedData ? JSON.parse(storedData) : [];
  
      canvasDataArray = canvasDataArray.filter((data) => data.canvasId !== this.canvasId);
  
      localStorage.setItem(this.noteInfo, JSON.stringify(canvasDataArray));
  
      // Clear the canvas from the fabric.js canvas
      // if (this.canvas) {
      //   this.canvas.clear();
      //   this.canvas.dispose();
      // }
      this.changeInCanvas.emit();
    }
    
  }
}
