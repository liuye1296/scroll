import './css/index.css'
import Scroll from './scroll/index'
// import vConsole from 'vconsole'
// new vConsole();
const scroll = new Scroll({
    target: document.getElementById('gundong'),
    rollH: 500, // 滚动区域高度
    callBackTop: () => {
        console.log('重新加载完成')
        setTimeout(() => {
            scroll.LoadComplete()
        }, 1000);

    },
    callBackDown: () => {
        console.log('没有更多了')
        setTimeout(() => {
            scroll.LoadComplete(true)
        }, 1000);
    }
})
