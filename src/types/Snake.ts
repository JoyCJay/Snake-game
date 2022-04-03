import { APPLE_SNAKE_INCREMENT, APPLE_TOLERANCE, CANVAS_HEIGHT, CANVAS_WIDTH, SNAKE_LENGTH } from "src/config";
import { Apple } from "./Apple";
import { IPosition, KeyBoardDirection } from "./interfaces";

export class Snake {

    direction: KeyBoardDirection;
    nodeRefs: SnakeNode[];
    head: SnakeNode;

    static forwardStrategyMap = new Map<number, Function>([
        [KeyBoardDirection.ArrowUp, (newHead: SnakeNode, step = 1) => { newHead.position.y -= step}],
        [KeyBoardDirection.ArrowDown, (newHead: SnakeNode, step = 1) => { newHead.position.y += step}],
        [KeyBoardDirection.ArrowLeft, (newHead: SnakeNode, step = 1) => { newHead.position.x -= step}],
        [KeyBoardDirection.ArrowRight, (newHead: SnakeNode, step = 1) => { newHead.position.x += step}]
    ])

    constructor(head: IPosition) {
        this.direction = KeyBoardDirection.ArrowRight
        this.head = new SnakeNode(head)
        this.nodeRefs = [this.head]

        let iterNode = this.head
        for (let i = 0; i < SNAKE_LENGTH / 2; i++) {
            const iterPosition = {
                x: head.x - i,
                y: head.y
            };
            const nextNode = new SnakeNode(iterPosition)
            this.nodeRefs.push(nextNode)
            iterNode.next = nextNode;
            iterNode = nextNode
        }

        for (let i = 0; i < SNAKE_LENGTH / 2; i++) {
            const iterPosition = {
                x: head.x - SNAKE_LENGTH / 2,
                y: head.y - i
            };
            const nextNode = new SnakeNode(iterPosition)
            this.nodeRefs.push(nextNode)
            iterNode.next = nextNode;
            iterNode = nextNode
        }
    }

    turn(d: KeyBoardDirection) {
        const diff = Math.abs(this.direction - d)
        if (diff !== 2) {
            this.direction = d
        } else {
            console.warn("cant go back")
        }
    }

    forward() {
        // remove tail and add a newHeadNode with direction
        this.nodeRefs.pop();
        const newTailNode = this.nodeRefs[this.nodeRefs.length - 1]
        newTailNode.next = null;

        const headPosition = Object.assign({}, this.head.position)
        const newHeadNode = new SnakeNode(headPosition);
        Snake.forwardStrategyMap.get(this.direction)?.call(this,newHeadNode) // adjustment
        newHeadNode.next = this.nodeRefs[0]
        this.nodeRefs.unshift(newHeadNode)
        this.head = newHeadNode
    }

    checkAlive(): boolean {
        // check head in the board
        if (
            this.head.position.x * this.head.position.y < 0 ||
            this.head.position.x > CANVAS_WIDTH ||
            this.head.position.y > CANVAS_HEIGHT
        ) {
            return false
        }

        // check head touch body
		let iterNode: any = this.head.next
		while (iterNode) {
			if (
                iterNode.position.x === this.head.position.x &&
                iterNode.position.y === this.head.position.y
            ) {
                return false
            }
			iterNode = iterNode.next
		}
        return true;
    }

    checkApple(a: Apple):boolean {
        let result = false;
        if (
            Math.abs(a.position.x - this.head.position.x) < APPLE_TOLERANCE &&
            Math.abs(a.position.y - this.head.position.y) < APPLE_TOLERANCE
        ) {
            result = true
            
            // eat apple, will grow at head
            this.grow()
        }
        return result
    }

    grow() {
        let iterNode = this.head
        for (let i = 0; i < APPLE_SNAKE_INCREMENT; i++) {
            const iterPosition = {
                x: iterNode.position.x,
                y: iterNode.position.y
            };
            const preNode = new SnakeNode(iterPosition)
            Snake.forwardStrategyMap.get(this.direction)?.call(this, preNode, i) // adjustment
            preNode.next = this.nodeRefs[0];
            this.nodeRefs.unshift(preNode)
            this.head = preNode
        }

        // console.log("snake grow", this.head)
    }

}

class SnakeNode {
    position: IPosition
    next: SnakeNode | null;

    constructor(p: IPosition) {
        this.position = p
        this.next = null
    }
}
