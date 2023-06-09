import { _decorator, Component, Node } from 'cc';
import GameEnum from '../../config/GEnum';
const { property } = _decorator;

export class Queue {
    items: any[];

    constructor () {
        this.items = [];
    }

    enqueue (e: any) {
        this.items.push(e);
    }

    dequeue () {
        return this.items.shift();
    }

    front () {
        return this.items[0];
    }

    isEnpty () {
        return this.items.length === 0;
    }

    size () {
        return this.items.length;
    }

    clear () {
        this.items = [];
    }

    toString () {
        let resultString = '';
        for (let i of this.items) {
            resultString += i + '';
        }
        return resultString;
    }
}

