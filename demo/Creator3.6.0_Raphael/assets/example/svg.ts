import { _decorator, Component, resources, error, director, Color } from 'cc';
const { ccclass } = _decorator;
import { RGroup } from '../raphael/RGroup';

@ccclass('Svg')
export class Svg extends Component {

    onLoad () {
        var group = this.addComponent(RGroup);
        resources.load('svg/tiger', (err, txt) => {
           if (err) {
               error(err.toString());
               return;
           }
           console.log(txt,' text')
           group.loadSvg(txt);
        });
        group.strokeColor = Color.BLACK;
    }
    backToList(){
        director.loadScene('TestList');
    }
}

