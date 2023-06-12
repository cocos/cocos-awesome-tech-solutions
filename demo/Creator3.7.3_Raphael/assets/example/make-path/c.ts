import { _decorator, Component, director } from 'cc';
const { ccclass } = _decorator;
import { RPath } from '../../raphael/RPath';
// import * as Cheerio  from 'cheerio';
@ccclass('C')
export class C extends Component {

    onLoad () {
        // console.log(Cheerio,' cheerio')
        var path = this.addComponent(RPath);
        // @ts-ignore
        path.selected = true;
        path.fillColor = 'none';
        // @ts-ignore
        path.M(-100, 0);
        // @ts-ignore
        path.C(-100, -100, 50,-100, 50,0);
        // @ts-ignore
        path.S(200,100, 200,0);
        path.makePath();
    }
    backToList(){
        director.loadScene('TestList');
    }
}
