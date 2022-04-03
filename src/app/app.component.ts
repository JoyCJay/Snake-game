import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, debounceTime, filter, Observable, Subject, take } from 'rxjs';
import { APPLE_NUMS, CANVAS_HEIGHT, CANVAS_WIDTH, INITIAL_POSITION, TIMEINTERVAL } from 'src/config';
import { Apple } from 'src/types/Apple';
import { directionStr2NumMap, IPosition, KeyBoardDirection } from 'src/types/interfaces';
import { Snake } from 'src/types/Snake';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
	title = 'snake-game';

	// Canvas
	@ViewChild('canvas')
	canvasRef!: ElementRef<HTMLCanvasElement>;
	canvasCtx!: CanvasRenderingContext2D | null;
	canvasConfig = {
		width: CANVAS_WIDTH,
		height: CANVAS_HEIGHT
	}

	// game related
	ongoing: boolean = false;
	snake: Snake = new Snake(INITIAL_POSITION)
	targetAppleCount = APPLE_NUMS
	eatenApples: Apple[] = []
	apple$ = new BehaviorSubject<Apple>(new Apple())

	// game control source
	nativeInterval: any;
	timeCount = 0
	gameTimer$ = new BehaviorSubject<number>(this.timeCount);
	keyDownBusSignal$ = new Subject<string>();
	enterDownSignal = this.keyDownBusSignal$.pipe(
		filter((v) => v === "Enter")
	);
	directionDownSignal = this.keyDownBusSignal$.pipe(
		filter((v) => this.ongoing && Object.keys(KeyBoardDirection).includes(v)),
		// debounceTime(200)
	);

	@HostListener('window:keydown', ['$event'])
	keyDownEvent(event: KeyboardEvent) {
		this.keyDownBusSignal$.next(event.key) // "ArrowRight" || "Enter"
	}

	constructor() {
		// behavior subject take one more initial value
		this.apple$.pipe(take(APPLE_NUMS + 1)).subscribe({
			next: (newApple) => {
				console.log("new apple created: ", newApple)
			},
			complete: () => console.log("test complete!!!")
		});
	}

	ngOnInit(): void {
		this.nativeInterval = setInterval(() => {
			if (this.snake.checkAlive()) {
				if (this.ongoing) {
					this.timeCount += TIMEINTERVAL;
					this.gameTimer$.next(this.timeCount)
				}
			} else {
				clearInterval(this.nativeInterval);
				alert("You died")
				window.location.reload()
			}
		}, TIMEINTERVAL)

		this.directionDownSignal.subscribe((v: string) => {
			const t = directionStr2NumMap.get(v);
			this.snake.turn(t as KeyBoardDirection)
		})

		this.enterDownSignal.subscribe(v => {
			this.ongoing = !this.ongoing
		})
	}

	ngAfterViewInit(): void {
		this.canvasCtx = this.canvasRef.nativeElement.getContext('2d');

		this.gameTimer$.subscribe(time => {
			this.snake.forward()
			const currentApple = this.apple$.getValue();
			if (this.snake.checkApple(currentApple)) {
				this.eatenApples.push(currentApple)
				this.apple$.next(new Apple())
			}

			this.clear()
			this.draw()
		})
	}

	ngOnDestroy(): void {
		clearInterval(this.nativeInterval)
	}

	debug() {
		console.log("cj debug button")

		this.snake.grow()
		this.clear()
		this.draw()
	}

	// canvas render methodes
	clear() {
		this.canvasCtx?.clearRect(0, 0, this.canvasConfig.width, this.canvasConfig.height)
	}

	draw() {
		this.canvasCtx?.restore();
		this.drawSnake(this.snake)
		this.drawApple(this.apple$.getValue());
	}

	drawSnake(snake: Snake) {
		let headFlag = true;
		let iterNode: any = snake.head
		while (iterNode) {
			this.drawCircle(iterNode.position, {headFlag})
			iterNode = iterNode.next
			headFlag =false
		}
	}

	drawApple(a: Apple) {
		this.canvasCtx!.beginPath();
		this.canvasCtx!.arc(a.position.x, a.position.y, 5, 0, 2*Math.PI); // radius, 0-2PI
		this.canvasCtx!.fillStyle = "red"
		this.canvasCtx!.fill()
	}

	drawCircle(p: IPosition, options?: any) {
		this.canvasCtx!.beginPath();
		if (options.headFlag) {
			this.canvasCtx!.arc(p.x, p.y, 7, 0, 2*Math.PI);
			this.canvasCtx!.fillStyle = "blue"
		} else {
			this.canvasCtx!.arc(p.x, p.y, 3, 0, 2*Math.PI);
			this.canvasCtx!.fillStyle = "black"
		}
		this.canvasCtx!.fill()
	}
}
