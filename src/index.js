import * as serviceWorker from './serviceWorker';
import RenderManager from './renderManager'
const bodyEl =  document.querySelector('body')
bodyEl.style.margin = 0
bodyEl.style.padding = 0
const {innerHeight,innerWidth} = window
const TILE_NUM =11
// create a 51x51 array, and it must be odd number
const renderManager = new RenderManager(Math.min(innerHeight,innerWidth),TILE_NUM)
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
document.body.appendChild(renderManager.app.view)
serviceWorker.unregister();
