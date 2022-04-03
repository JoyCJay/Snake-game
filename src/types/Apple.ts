import { CANVAS_HEIGHT, CANVAS_WIDTH } from "src/config";
import { IPosition } from "./interfaces";

export class Apple {

    position: IPosition

    constructor() {
        this.position = {
            x: Math.floor(Math.random() * CANVAS_WIDTH),
            y: Math.floor(Math.random() * CANVAS_HEIGHT)
        }
    }

    /**
     * absolute random position is a temp solution, it has the following problems
     * 1. new apple may be created on the snake body
     * 2. may be initialized on the board side
     */

}