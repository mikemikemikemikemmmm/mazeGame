import RenderManager from './renderManager'
const bodyEl = document.querySelector('body')
bodyEl.style.margin = 0
bodyEl.style.padding = 0
const { innerHeight, innerWidth } = window
const TILE_NUM = 19 // it must match 7+4n 
const renderManager = new RenderManager(Math.min(innerHeight, innerWidth), TILE_NUM)
document.body.appendChild(renderManager.app.view)