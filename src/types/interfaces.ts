export interface IPosition {
    x: number;
    y: number;
}

export enum KeyBoardDirection {
    ArrowUp = 38,
    ArrowDown = 40,
    ArrowLeft = 37,
    ArrowRight = 39,
}

export const directionStr2NumMap = new Map([
    ['ArrowUp', 38],
    ['ArrowDown', 40],
    ['ArrowLeft', 37],
    ['ArrowRight', 39],
]);