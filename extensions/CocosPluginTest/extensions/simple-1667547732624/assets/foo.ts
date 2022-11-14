import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass('Foo')
export class Foo extends Component {
    start () {
        console.log('foo');
    }
}