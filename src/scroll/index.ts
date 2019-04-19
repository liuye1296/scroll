function setTransform(nodeStyle: CSSStyleDeclaration, value: number) {
    function transform() {
        nodeStyle.transform = `translate3d(0,${value}px,0)`;
        nodeStyle.webkitTransform = `translate3d(0,${value}px,0)`;
    }
    requestAnimationFrame(transform)
}
if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (fn) {
        setTimeout(fn, 17);
        return 0
    };
}
let passiveSupported = false;
try {
    var options = Object.defineProperty({}, "passive", {
        get: function () {
            passiveSupported = true;
            return false
        }
    });
    //  测试兼容性代码
    window.addEventListener("test", null, options);
} catch (err) { }
const passive = passiveSupported ? { passive: false } : false // 判断addEventListener第三个参数是否支持对象
class Scroll {
    private ref: HTMLElement; // 滚动的对象
    private startY: number;// 保存开始按下的位置
    private end: number;// 保存结束时的位置
    private startTime: number;// 开始触摸的时间
    private translate: number;//初始化位置
    private rollH: number; //  滚动区域的高度
    private boundary: Array<number>; // 边界 0 上面的边界默认0  1下面的边界 
    private reverse: string;  // 滚动反向 top down
    private points: Array<any>;
    private HasTop: boolean; // 是否有下拉刷新
    private HasDown: boolean; //
    private topText: Array<string>; // 顶部文字 有三种状态
    // private downText: Array<string>; // 顶部文字 有三种状态
    // private scrollTop: number;// 距离顶部的距离
    constructor(options: ScrollOptions) {
        this.ref = options.target;
        this.startY = 0;
        this.end = 0;
        this.startTime = null
        this.translate = 0
        this.rollH = this.rollH || 500;
        this.boundary = [50, 0];
        this.points = [];
        this.topText = ['下拉可以刷新', '释放立即刷新', '数据刷新中'];
        const downText: Array<string> = ['loading', '没有更多了'];
        //   this.scrollTop = 0
        this.init();
        //   return this;
    }
    private init(): void {
        //this.scrollTop = this.ref.getBoundingClientRect().top
        this.calculationBoundary()
        this._handleTouchStart = this._handleTouchStart.bind(this)
        this._handleTouchMove = this._handleTouchMove.bind(this)
        this._handleTouchEnd = this._handleTouchEnd.bind(this)
        this.ref.addEventListener('touchstart', this._handleTouchStart, passive)
        this.ref.addEventListener('touchmove', this._handleTouchMove, passive)
        this.ref.addEventListener('touchend', this._handleTouchEnd, passive)
    }
    private _handleTouchStart(event: TouchEvent): void {
        this.startY = event.targetTouches[0].pageY;
        this.startTime = +new Date();
    }
    /**
     * 计算down边界 跟实际内容高度 
     */
    private calculationBoundary() {
        const obj = this.ref.getBoundingClientRect()
        const contentH = obj.height - 30; //减去头部高度 实际内容高度
        this.boundary[1] = this.rollH - contentH; // 可以向下滚动的距离  如果是正数 那么不允许向下滚动 就是向下的边界
        console.log(this.boundary[1])
    }
    private _handleTouchMove(event: TouchEvent): boolean {
        const scrollTop = this.ref.getBoundingClientRect().top
        this.end = event.changedTouches[0].pageY
        const diff = this.end - this.startY;
        if (diff < 0) { // 
            this.reverse = 'top'
            if (this.boundary[1] > 0) { //  down 边界是正数 那么拒绝向下滚动
                return false
            }
        } else {
            event.stopPropagation();
            event.preventDefault();
            this.reverse = 'down'
        }
        if (this.translate + diff > 100) {
            setTransform(this.ref.style, 100);
            this.startTime = +new Date(); // 
            return false
        }
        if (this.translate + diff < (this.boundary[1] - this.boundary[0])) {
            setTransform(this.ref.style, this.boundary[1] - this.boundary[0]);
            this.startTime = +new Date(); // 
            return false
        }
        // 计算滚动值
        setTransform(this.ref.style, this.translate + diff);
        this.startTime = +new Date(); // 
        this.points.push({ time: this.startTime, y: this.end });
        if (this.points.length > 40) {
            this.points.shift();
        }
        return true
    }
    private _handleTouchEnd(event: TouchEvent): void {
        if (!this.startY) return; // 开始位置为空 
        const endTime = new Date().getTime();
        this.end = event.changedTouches[0].pageY;
        if (endTime - this.startTime > 100) {
            if (Math.abs(this.end - this.startY) > 50) { // 滚动大于50px
                this.stop(this.end - this.startY);
            } else {
                this.stop(0);
            }
        } else { // 计算惯性
            if (Math.abs(this.end - this.startY) > 10) {
                var endPos = this.points.length - 1;
                var startPos = endPos;
                for (var i = endPos; i > 0 && this.startTime - this.points[i].time < 100; i--) {
                    startPos = i;
                }
                if (startPos !== endPos) {
                    var ep = this.points[endPos];
                    var sp = this.points[startPos];
                    var t = ep.time - sp.time;
                    var s = ep.y - sp.y;
                    var v = s / t; // 出手时的速度
                    var diff = v * 150 + (this.end - this.startY); // 滑行 150ms,这里直接影响“灵敏度”
                    this.stop(diff);
                } else {
                    this.stop(0);
                }
            } else {
                this.stop(this.end - this.startY);
            }
        }
        this.startY = null;
    }
    /**
     * 释放 判断边界 执行 上拉 或者 下拉 回调
     * @param diff 
     */
    private stop(diff: number) {
        // 判断边界
        this.translate += diff;
        // this.translate = this.translate < this.boundary[1] ? this.boundary[1] : this.translate;
        if (this.translate < this.boundary[1]) { // 触发 down 边界
            this.translate = this.boundary[1]
            console.log('我要加载')
        }
        //console.log(this.translate)
        if (this.translate > this.boundary[0]) { // 触发 top 边界
            console.log('我要刷新')
            this.translate = 0
        }
        if (this.translate < this.boundary[0] && this.translate > 0) {
            this.translate = 0
        }
        setTransform(this.ref.style, this.translate);
    }
    private to() {

    }
}
export default Scroll

interface ScrollOptions {
    target: HTMLElement, //运动的对象
    rollH: number; // 滚动区域的高度 必需 
    maxH?: number; // 最大高度 不传 会默认获取 target的高度
}
