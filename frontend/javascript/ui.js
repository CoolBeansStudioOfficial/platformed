<<<<<<< Updated upstream
<<<<<<< Updated upstream
import { createMap } from "./file-utils.js"
import { importMap } from "./file-utils.js"
import { mode, setMode } from "./site.js"
import { state } from "./state.js"
import { ctx, canvas, updateTileset } from "./renderer.js"
import { toggleErase, changeSelectedTile, zoomMap, scrollCategoryTiles } from "./editor.js"
const { editor, player } = state

export function toggleEditorUI(on) {
  const grid = document.querySelector(".grid")
  if (on) {
    grid.classList.remove("grid-uihidden")
  } else {
    grid.classList.add("grid-uihidden")
  }
  updateCanvasSize()
}

export function updateSlidersOnLoad(json) {
  jumpWidthSlider.value = json.jumpWidth
  verticalInertiaSlider.value = json.yInertia
  horizontalInertiaSlider.value = json.x
  jumpHeightSlider.value = json.jumpHeightInertia
  if (json.bouncePadHeight) {
    bouncePadHeightSlider.value = json.bouncePadHeight
  }
  if (json.zoom) {
    zoomSlider.value = (json.zoom / (32 / 6))
  }
}

export function updateCanvasSize() {
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = rect.height
  ctx.imageSmoothingEnabled = false
  canvas.style.imageRendering = 'pixelated'
}

export function sortByCategory(category) {
  let tileCount = 0
  const tileSelects = document.querySelectorAll('.tile-select-container')
  let lowestIndexBlock
  tileSelects.forEach(tileSelect => {
    if (tileSelect.dataset.category == category) {
      if (!lowestIndexBlock || tileSelect.dataset.tile < lowestIndexBlock) {
        lowestIndexBlock = tileSelect.dataset.tile
      }
      tileSelect.style.display = 'block'
      tileCount++
=======
=======
>>>>>>> Stashed changes
import { zoomMap, initEditor, setEditorParamsFromJSON, saveMap, editor, changeSelectedTile } from "./editor.js"
import { player, initPlatformer } from "./platformer.js"

function init() {
    initEditor(true)
    updateCanvasSize()
}

export function endLevel() {
    mode = "editor"
    setTimeout(initEditor(false), 1);
}

//canvas stuff
const canvas = document.querySelector("canvas")
const dpr = window.devicePixelRatio
const ctx = canvas.getContext('2d')
const rect = canvas.getBoundingClientRect()
canvas.width = rect.width
canvas.height = rect.height

ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
ctx.imageSmoothingEnabled = false
canvas.style.imageRendering = 'pixelated'

function updateCanvasSize() {
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
    ctx.imageSmoothingEnabled = false
    canvas.style.imageRendering = 'pixelated'
}

export function drawMap(tileSize, cam) {
    let { map, tileset } = editor

    const startX = Math.floor(cam.x / tileSize)
    const endX = startX + (canvas.width / tileSize) + 1
    const startY = Math.floor(cam.y / tileSize)
    const endY = startY + (canvas.width / tileSize) + 1

    ctx.fillStyle = '#C29A62'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
            if (x < 0 || x >= map.w || y < 0 || y >= map.h) continue
            const raw = map.tiles[y * map.w + x]
            const tileId = raw >> 4
            const scrX = Math.floor((x * tileSize) - cam.x)
            const scrY = Math.floor((y * tileSize) - cam.y)
            const selectedTile = tileset[tileId]
            let showTile = true
            if (tileset[tileId] && tileset[tileId].mechanics && tileset[tileId].mechanics.includes("hidden") && mode == 'play') {
                showTile = false
            }
            if (player.collectedCoinList.includes(y * map.w + x) && mode === 'play') {
                showTile = false
            }
            if (selectedTile.type == 'enemy' && mode == 'play') {
                showTile = false
            }
            if (selectedTile.type == 'adjacency' && showTile) {
                ctx.drawImage(selectedTile.images[raw & 15], scrX, scrY, tileSize, tileSize)
            } else if (selectedTile.type == "rotation" && showTile) {
                ctx.drawImage(selectedTile.images[raw & 15], scrX, scrY, tileSize, tileSize)
            } else if (selectedTile.type == 'standalone' && showTile) {
                ctx.drawImage(selectedTile.image, scrX, scrY, tileSize, tileSize)
            } else if (selectedTile.type == 'enemy' && showTile) {
                ctx.drawImage(selectedTile.image, scrX, scrY, tileSize, tileSize)
            }
        }
    }
}

export function drawSelectedTileImage(img, cursorScrX, cursorScrY, tileSize) {
    if (img) {
        ctx.save()
        ctx.imageSmoothingEnabled = false
        canvas.style.imageRendering = 'pixelated'
        ctx.globalAlpha = 0.5
        ctx.drawImage(img, cursorScrX, cursorScrY, tileSize, tileSize)
        ctx.restore()
>>>>>>> Stashed changes
    } else {
      tileSelect.style.display = 'none'
    }
    if (lowestIndexBlock) {
      changeSelectedTile(Number(lowestIndexBlock))
    }
  })
  updateCanvasSize()
  return tileCount
}

<<<<<<< Updated upstream
=======
export function drawImage(sprite, x, y, w, h) {
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(sprite, x, y, w, h)
}

export function drawImage(sprite, x, y, w, h) {
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(sprite, x, y, w, h)
}

//input handling
export const input = {
    x: 0,
    y: 0,
    down: false,
    keys: {}
}

window.addEventListener('keydown', e => input.keys[e.key] = true)
window.addEventListener('keyup', e => input.keys[e.key] = false)

canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect()
    input.x = e.clientX - rect.left
    input.y = e.clientY - rect.top
})
canvas.addEventListener('mousedown', () => input.down = true)
canvas.addEventListener('mouseup', () => input.down = false)


>>>>>>> Stashed changes
// page event listeners
const eraserButton = document.querySelector('.eraser')
const saveButton = document.querySelector('.save')
const importButton = document.querySelector('.import')
const tileSelection = document.querySelector('.tile-selection')
const zoomIn = document.querySelector('.plus')
const zoomOut = document.querySelector('.minus')
const categories = document.querySelectorAll('.category')
const play = document.querySelector(".play")

const jumpHeightSlider = document.querySelector('#jump-height-input')
const verticalInertiaSlider = document.querySelector('#vertical-inertia-input')
const jumpWidthSlider = document.querySelector('#jump-width-input')
const horizontalInertiaSlider = document.querySelector('#horizontal-inertia-input')
const bouncePadHeightSlider = document.querySelector('#bounce-pad-height-input')
const zoomSlider = document.getElementById('zoom-level-input')
const walljumpInput = document.getElementById('walljump-input') 
const tilesetInput = document.getElementById('tileset-input')

tilesetInput.addEventListener("input", () => {
  updateTileset(tilesetInput.value)
})

walljumpInput.addEventListener('input', () => {
  player.wallJump = walljumpInput.value
})

zoomSlider.addEventListener('click', () => {
  player.tileSize = Math.floor((32 / 0.6) * zoomSlider.value)
})

bouncePadHeightSlider.addEventListener('input', () => {
  player.bouncePadHeight = Number(bouncePadHeightSlider.value)
})

jumpHeightSlider.addEventListener('input', () => {
  player.jumpHeight = Number(jumpHeightSlider.value)
})

verticalInertiaSlider.addEventListener('input', () => {
  player.yInertia = Number(verticalInertiaSlider.value)
})

jumpWidthSlider.addEventListener('input', () => {
  player.jumpWidth = Number(jumpWidthSlider.value)
})

horizontalInertiaSlider.addEventListener('input', () => {
  player.xInertia = Number(horizontalInertiaSlider.value)
})

categories.forEach(category => {
  category.addEventListener('click', () => {
    categories.forEach(cat => {
      cat.classList.remove('active')
    })
    let tileCount = sortByCategory(category.dataset.category)
    if (tileCount !== 0) category.classList.add('active')
  })
  window.addEventListener('keypress', (e) => {
    if (e.key == String(((Array.from(categories).indexOf(category)) * -1) + categories.length)) {
      categories.forEach(cat => {
        cat.classList.remove('active')
      })
      let tileCount = sortByCategory(category.dataset.category)
      if (tileCount !== 0) category.classList.add('active')
    }
  })
})

document.addEventListener('wheel', (e) => {
  if (e.wheelDelta > 0) {
    scrollCategoryTiles(true)
  } else {
    scrollCategoryTiles(false)
  }
})

window.addEventListener('resize', () => {
  updateCanvasSize()
})

zoomIn.addEventListener('click', () => {
  zoomMap(false)
})

zoomOut.addEventListener('click', () => {
  zoomMap(true)
})

<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======
=======
>>>>>>> Stashed changes
export let mode = "editor"

>>>>>>> Stashed changes
play.addEventListener('click', () => {
  mode = mode === 'editor' ? 'play' : 'editor'
    if (mode == 'play') {
        initPlatformer()
        play.src = "./assets/icons/stop_noborder.svg"
    } else {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        initEditor()
=======
        toggleEditorUI(on)
        initEditor(false)
>>>>>>> Stashed changes
=======
        toggleEditorUI(on)
        initEditor(false)
>>>>>>> Stashed changes
        play.src = "./assets/icons/play_nofill.svg"
    }
}) 

importButton.addEventListener('click', () => {
  let input = document.createElement('input')
  input.type = 'file'
  input.id = 'mapFileInput'
  input.accept = '.json,application/json'
  input.style.display = 'none'
  input.addEventListener('change', (e) => {
    importMap(e)
  })
  input.value = ''
  input.click()
})

saveButton.addEventListener('click', () => {
  const json = createMap(editor.map.w, editor.map.h, Array.from(editor.map.tiles))
  const text = JSON.stringify(json, null, 2)
  const blob = new Blob([text], {type: 'application/json'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'map.json'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
})
eraserButton.addEventListener('click', () => {
  toggleErase()
})
document.addEventListener('keypress', (e) => {
  if (e.key == 'e') {
    toggleErase()
  } else if (e.key == 'p') {
    const desiredMode = mode == 'editor' ? 'play' : 'editor'
    console.log(desiredMode)
    setMode(desiredMode)
  } else if (e.key == 'o') {
    let input = document.createElement('input')
    input.type = 'file'
    input.id = 'mapFileInput'
    input.accept = '.json,application/json'
    input.style.display = 'none'
    input.addEventListener('change', (e) => {
      importMap(e)
    })
    input.value = ''
    input.click()
  }
})

export function addTileSelection() {
  const categoryBlocks = document.querySelector('.category-blocks')
  categoryBlocks.innerHTML = ''
  for (let i = 1; i < editor.tileset.length; i++) {
    if (editor.tileset[i]) {
      let div = document.createElement('div')
      div.classList.add('tile-select-container')
      div.dataset.tile = i
      div.dataset.category = editor.tileset[i].category
      categoryBlocks.appendChild(div)
      let img = document.createElement('img')
      img.classList.add('tile-select')
      let src
      if (editor.tileset[i].type == 'rotation' || editor.tileset[i].type == 'adjacency') {
        const c = editor.tileset[i].images[0]
        if (c instanceof HTMLCanvasElement) {
          if (c.toBlob) {
            c.toBlob(blob => {
              const url = URL.createObjectURL(blob)
              img.src = url
              img.onload = () => URL.revokeObjectURL(url)
            })
          } else {
            img.src = c.toDataURL()
          }
        } else if (c instanceof HTMLImageElement) {
          img.src = c.src
        }
      } else {
        if (editor.tileset[i].image instanceof HTMLImageElement) {
          img.src = editor.tileset[i].image.src
        } else {
          img.src = ''
        }
      }
      div.appendChild(img)
      div.addEventListener('mousedown', (e) => {
        e.preventDefault()
        editor.lastSelectedTiles.shift()
        changeSelectedTile(Number(div.dataset.tile))
      })
    }
<<<<<<< Updated upstream
  }
  sortByCategory("")
}
=======
    return out
}

function importMap(e) {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onerror = () => console.error('failed to read file', reader.error)
    reader.onload = () => {
        const json = JSON.parse(reader.result)
        //import player settings
        player.jumpHeight = json.jumpHeight
        jumpHeightSlider.value = json.jumpHeight
        player.jumpWidth = json.jumpWidth
        jumpWidthSlider.value = json.jumpWidth
        player.yInertia = json.yInertia
        verticalInertiaSlider.value = json.yInertia
        player.xInertia = json.xInertia
        horizontalInertiaSlider.value = json.xInertia
        if (json.bouncePadHeight) {
            bouncePadHeightSlider.value = json.bouncePadHeight
            player.bouncePadHeight = json.bouncePadHeight
        }
        if (json.zoom) {
            zoomSlider.value = (json.zoom / (32 / 0.6))
            player.tileSize = json.zoom
        }
        player.wallJump = json.wallJump

        //import level editor settings and map
        setEditorParamsFromJSON(json)
    }
    reader.readAsText(file)
}

export function sortByCategory(category) {
    let tileCount = 0
    const tileSelects = document.querySelectorAll('.tile-select-container')
    let lowestIndexBlock
    tileSelects.forEach(tileSelect => {
        if (tileSelect.dataset.category == category) {
            if (!lowestIndexBlock || tileSelect.dataset.tile < lowestIndexBlock) {
                lowestIndexBlock = tileSelect.dataset.tile
            }
            tileSelect.style.display = 'block'
            tileCount++
        } else {
            tileSelect.style.display = 'none'
        }
        if (lowestIndexBlock) {
            changeSelectedTile(Number(lowestIndexBlock))
        }
    })
    updateCanvasSize()
    return tileCount
}

function toggleEditorUI(on) {
    const grid = document.querySelector(".grid")
    if (on) {
        grid.classList.add("grid-uihidden")
    } else {
        grid.classList.remove("grid-uihidden")
    }
}

init()
>>>>>>> Stashed changes
