
let dtime = 0;

export let TimeEx = {
    get deltaTime(): number { return dtime; },
    set deltaTime(dt: number) { dtime = dt },
    WaitForSeconds: async (delay) => {
        return await new Promise((reslove, reject) => {
            setTimeout(() => {
                reslove(true);
            }, delay * 1000);
        });
    }
}
