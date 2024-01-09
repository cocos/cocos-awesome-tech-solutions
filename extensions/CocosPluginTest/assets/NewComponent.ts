import { _decorator, Component, find, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

window.addEventListener("message", (e)=>{
    if (e.data === "CocosTest") {
        NewComponent.prototype.test();
    } else {
        alert(`No CocosTest, This is ${e.data}`);
    }
});

window.onhashchange = (e)=>{
    NewComponent.prototype.test();
};

window.cocosTest = ()=>{
    NewComponent.prototype.test();
};

@ccclass('NewComponent')
export class NewComponent extends Component {
    test () {
        var testNode = find("soldier");
        testNode.setScale(new Vec3(testNode.scale.x - 0.1, testNode.scale.y - 0.1, testNode.scale.z - 0.1))
    }
}
