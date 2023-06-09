import { Enum } from "cc";

const GameEnum = {
        pageFlag: Enum({
            common_Problem: 0,
            tchnical_Proposal: 1,
            tools_Techniques: 2
        }),
        level: Enum({
            normal: 0,
            hight: 1
        }),
        viewType: Enum({
            icon: 0,
            table: 1
        }),
        userActionType: Enum({
            register: 0,
            login: 1
        }),
        ColliderGroup: Enum({
            DEFAULT: 0,
            HOLE: 2,
            BALL: 4
        })
}
export default GameEnum;