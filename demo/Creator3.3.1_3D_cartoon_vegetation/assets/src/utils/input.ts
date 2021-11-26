import { macro, systemEvent, EventKeyboard, Game, game, SystemEvent } from 'cc';

class Input {
    key = {
        left: false,
        right: false,
        up: false,
        down: false,
        space: false,
        shift: false
    }

    moveDir = 0;
    moveForward = 0;
    moveBack = 0;
    moveBrake = 0;

    registerEvents () {
        // Your initialization goes here.
        systemEvent.on(SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        systemEvent.on(SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    onKeyDown (event: EventKeyboard) {
        switch (event.keyCode) {
            case macro.KEY.left:
            case macro.KEY.a:
                this.key.left = true;
                // this.moveDir = -1;
                break;
            case macro.KEY.right:
            case macro.KEY.d:
                this.key.right = true;
                // this.moveDir = 1;
                break;
            case macro.KEY.up:
            case macro.KEY.w:
                this.key.up = true;
                this.moveForward = 1;
                break;
            case macro.KEY.down:
            case macro.KEY.s:
                this.key.down = true;
                this.moveBack = 1;
                break;
            case macro.KEY.space:
                this.key.space = true;
                this.moveBrake = 1;
                break;
            case macro.KEY.shift:
                this.key.shift = true;
                break;
        }
    }

    onKeyUp (event: EventKeyboard) {
        switch (event.keyCode) {
            case macro.KEY.left:
            case macro.KEY.a:
                this.key.left = false;
                // this.moveDir = 0;
                break;
            case macro.KEY.right:
            case macro.KEY.d:
                this.key.right = false;
                // this.moveDir = 0;
                break;
            case macro.KEY.up:
            case macro.KEY.w:
                this.key.up = false;
                this.moveForward = 0;
                break;
            case macro.KEY.down:
            case macro.KEY.s:
                this.key.down = false;
                this.moveBack = 0;
                break;
            case macro.KEY.space:
                this.key.space = false;
                this.moveBrake = 0;
                break;
            case macro.KEY.shift:
                this.key.shift = false;
                break;
        }
    }
}

let input = new Input;

game.on(Game.EVENT_GAME_INITED, () => {
    input.registerEvents();
})

export default input;