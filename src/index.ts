import './css/index.css'
import Scroll from './scroll/index'
// import vConsole from 'vconsole'
// new vConsole();
const scroll = new Scroll({
    target: document.getElementById('gundong'),
    rollH: 500, // 滚动区域高度
})
console.log(scroll)