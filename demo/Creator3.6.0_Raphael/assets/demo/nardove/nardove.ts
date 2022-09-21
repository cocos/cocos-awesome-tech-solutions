import { _decorator, Component, director } from 'cc';
import { RGroup } from '../../raphael/RGroup';
import { Jelly } from './jelly';
const { ccclass, property } = _decorator;

@ccclass('Nardove')
export class Nardove extends Component {
    @property
    public addJellyTimer = 5;
    @property
    public jellyCounter = 0;
    @property
    public numJellies = 7;
    jellies = [];
    time = 0;
    count = 0;
    group = null;
    onLoad () {
        this.time = this.addJellyTimer;
        this.group = this.addComponent(RGroup);
    }

    update (dt: any) {
        this.time += dt;
        this.count ++;
        if (this.time >= this.addJellyTimer && this.jellyCounter < this.numJellies) {
           let jelly = new Jelly();
           jelly.init(this.group, this.jellyCounter);
           this.jellies.push(jelly);
           this.jellyCounter ++;
           this.time = 0;
        }
        for (let i = 0, ii = this.jellies.length; i < ii; i++) {
           let jelly = this.jellies[i];
           jelly.update(this.time, this.count);
        }
    }

    backToList(){
        director.loadScene('TestList');
    }
}

