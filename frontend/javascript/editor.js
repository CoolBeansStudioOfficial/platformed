<<<<<<< Updated upstream
import { calcAdjacentAdjacency, calculateAdjacency, enemies } from "./platformer.js"
import { canvas, ctx, drawMap } from "./renderer.js"
import { mode, input, key } from "./site.js"
import { state } from "./state.js"
const { editor } = state
=======
import { decodeRLE, sortByCategory, input, drawSelectedTileImage, mode, drawMap } from "./ui.js"
import { enemies, player } from "./platformer.js"

export const editor = {
    cam: {
        x: 0,
        y: 0
    },
    currentRotation: 0,
    playerSpawn: { x: 0, y: 0 },
    tileSize: 32,
    selectedTile: 1,
    lastSelectedTiles: [2, 1], // [1] is the current selected tile
    map: {
        w: 100, h: 50, tiles: new Uint16Array(5000)
    },
    width: 100,
    height: 50,
    tileset: [],
    limitedPlacedTiles: [],
    tilesetPath: "./assets/medium.json",
    dissipateTime: 2 * 60,
    dissipateDelay: 2 * 60,
}

export function initEditor(firstInit) {
    if (firstInit == true) {
        loadTileset(editor.tilesetPath).then(({ tileset, characterImage }) => {
            editor.tileset = splitStripImages(tileset)
            loadPlayerSprites(characterImage)
            editor.map = {
                w: 100, h: 50, tiles: new Uint16Array(5000)
            }
            addTileSelection()
        })
    }

    enemies.forEach(enemy =>
        enemies.pop()
    )
    lastTime = 0
    levelEditorLoop()
}

export function setEditorParamsFromJSON(json) {
    if (json.tilesetPath) {
        updateTileset(json.tilesetPath)
    }
    const tileLayer = json.layers.find(l => l.type === "tilelayer")
    const rotationLayer = json.layers.find(l => l.type === "rotation")
    const rawRotationLayer = decodeRLE(rotationLayer.data)
    let rawTileLayer = decodeRLE(tileLayer.data)
    if (rawTileLayer.length !== json.width * json.height) {
        console.warn('readData: data length not expected value', rawTileLayer.length, json.width * json.height)
    }
    rawTileLayer = rawTileLayer.map(id => id << 4)
    rawTileLayer = calculateAdjacencies(rawTileLayer, json.width, json.height)
    console.log(rawTileLayer)
    for (let i = 0; i < rawTileLayer.length; i++) {
        if (editor.tileset[rawTileLayer[i] >> 4].type == "rotation") {
            rawTileLayer[i] += rawRotationLayer[i]
        }
        if (editor.tileset[rawTileLayer[i] >> 4].mechanics && editor.tileset[rawTileLayer[i] >> 4].mechanics.includes("spawn")) {
            editor.playerSpawn.y = Math.floor(i / json.width)
            editor.playerSpawn.x = i % json.width
        }
    }
    editor.width = json.width
    editor.height = json.height
    const tiles = new Uint16Array(rawTileLayer)
    const map = {
        tiles,
        w: json.width,
        h: json.height
    }
    editor.map = map
}
>>>>>>> Stashed changes

export function zoomMap(zoomDirectionIsIn) {
  const currentZoom = editor.tileSize
  let newZoom = editor.tileSize
  const zooms = [16, 25, 32, 40, 60, 80, 100]
  const currentZoomIndex = zooms.indexOf(currentZoom)
  if (zoomDirectionIsIn) {
    if (currentZoomIndex !== 0) {
      newZoom = zooms[currentZoomIndex - 1]
    } else {
      newZoom = currentZoom
    }
<<<<<<< Updated upstream
  } else {
    if (currentZoomIndex < zooms.length - 1) {
      newZoom = zooms[currentZoomIndex + 1]
=======
    editor.tileSize = newZoom
}

export function saveMap() {
    const json = createMap(editor.map.w, editor.map.h, Array.from(editor.map.tiles))
    const text = JSON.stringify(json, null, 2)
    const blob = new Blob([text], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'map.json'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
}

let lastTime = 0
function deltaTime(timestamp) {
    if (!timestamp) timestamp = performance.now()
    if (lastTime === 0) lastTime = timestamp
    const seconds = (timestamp - lastTime) / 1000
    lastTime = timestamp
    return Math.min(seconds, 0.1)
}

let mouseDown = false
let rDown = false
let spaceDown = false
let lastIdx
let once = true

function levelEditorLoop(timestamp) {
    let dt = deltaTime(timestamp)
    let timeScale = dt * 60
    const { map, cam, tileSize, tileset } = editor

    const speed = 10
    if ((input.keys['w'] || input.keys["ArrowUp"]) && cam.y >= 0) cam.y -= speed * timeScale
    if ((input.keys['s'] || input.keys["ArrowDown"]) && cam.y <= (map.h * tileSize) - canvas.height) cam.y += speed * timeScale
    if ((input.keys['a'] || input.keys["ArrowLeft"]) && cam.x >= 0) cam.x -= speed * timeScale
    if ((input.keys['d'] || input.keys["ArrowRight"]) && cam.x <= (map.w * tileSize) - canvas.width) cam.x += speed * timeScale
    const worldX = input.x + cam.x
    const worldY = input.y + cam.y
    const tx = Math.floor(worldX / tileSize)
    const ty = Math.floor(worldY / tileSize)

    if (input.down) {
        const idx = ty * map.w + tx
        if (!mouseDown) {
            if (tx >= 0 && tx < map.w && ty >= 0 && ty < map.h) {
                // set a limit on tiles with a mechanic of "onePerLevel"
                let tileLimitPlaced = false
                if (editor.limitedPlacedTiles.includes(editor.selectedTile)) {
                    tileLimitPlaced = true
                }
                if (editor.tileset[editor.selectedTile].mechanics) {
                    if (editor.tileset[editor.selectedTile].mechanics.includes("onePerLevel") && !editor.limitedPlacedTiles.includes(editor.selectedTile)) {
                        editor.limitedPlacedTiles.push(editor.selectedTile)
                    }
                    if (tileset[editor.selectedTile].mechanics.includes("spawn")) {
                        editor.playerSpawn = { x: tx, y: ty }
                    }
                    if (tileset[editor.selectedTile].mechanics.includes("end")) {
                        editor.end = { x: tx, y: ty }
                    }
                }
                if (tileset[editor.selectedTile].type == "adjacency" && !tileLimitPlaced) {
                    calcAdjacentAdjacency(idx, editor.selectedTile)
                } else if (tileset[editor.selectedTile].type == 'rotation' && !tileLimitPlaced) {
                    editor.map.tiles[idx] = (editor.selectedTile * 16) + editor.currentRotation
                } else if (tileset[editor.selectedTile].type == 'empty') {
                    editor.limitedPlacedTiles = editor.limitedPlacedTiles.filter(f => f !== editor.map.tiles[idx] >> 4)
                    calcAdjacentAdjacency(idx, editor.selectedTile)
                } else if (!tileLimitPlaced) {
                    calcAdjacentAdjacency(idx, editor.selectedTile)
                }

            }
        }
        if (lastIdx !== idx) {
            mouseDown = false
        }
>>>>>>> Stashed changes
    } else {
      newZoom = currentZoom
    }
  }
  editor.tileSize = newZoom
}

export function toggleErase() {
  if (editor.selectedTile == 0) {
    editor.selectedTile = editor.lastSelectedTiles[1]
  } else {
    editor.selectedTile = 0
  }
}

export function changeSelectedTile(tileId) {
  if (editor.selectedTile !== editor.lastSelectedTiles[1] && editor.selectedTile != 0) {
    editor.lastSelectedTiles[1] = editor.selectedTile
  }
  if (tileId == "last") { 
    editor.selectedTile = editor.lastSelectedTiles[0]
    editor.lastSelectedTiles.unshift(editor.lastSelectedTiles[1])
    editor.lastSelectedTiles.pop()
  } else {
    editor.lastSelectedTiles.shift()
    editor.lastSelectedTiles.push(tileId)
    editor.selectedTile = tileId
  } 
}

export function scrollCategoryTiles(up) {
  let currentSelectedTiles = document.querySelectorAll(".tile-select-container")
  currentSelectedTiles = Array.from(currentSelectedTiles).filter(f => f.style.display !== "none")
  if (currentSelectedTiles.length !== 0) {
    // sorry
    editor.selectedTile = !up ? Number(currentSelectedTiles[(currentSelectedTiles.indexOf(currentSelectedTiles.find(f => f.dataset.tile == String(editor.selectedTile))) + 1) % currentSelectedTiles.length].dataset.tile) : Number(currentSelectedTiles[(currentSelectedTiles.indexOf(currentSelectedTiles.find(f => f.dataset.tile == String(editor.selectedTile))) - 1 + currentSelectedTiles.length) % currentSelectedTiles.length].dataset.tile)
  }
}export function initEditor() {
  enemies.forEach(enemy => enemies.pop())
  ctx.imageSmoothingEnabled = false
}

export let mouseDown = false;
export let rDown = false;
export let spaceDown = false;
export let lastIdx;

export function levelEditorLoop(dt) {
  let timeScale = dt * 60
  const { map, cam, tileSize, tileset } = editor
  const speed = 10
  if (key("up") && cam.y >= 0) cam.y -= speed * timeScale
  if (key("down") && cam.y <= (map.h * tileSize) - canvas.height) cam.y += speed * timeScale
  if (key("left") && cam.x >= 0) cam.x -= speed * timeScale
  if (key("right") && cam.x <= (map.w * tileSize) - canvas.width) cam.x += speed * timeScale
  const worldX = input.x + cam.x
  const worldY = input.y + cam.y
  const tx = Math.floor(worldX / tileSize)
  const ty = Math.floor(worldY / tileSize)

  if (input.down) {
    const idx = ty * map.w + tx
    if (!mouseDown) {
      if (tx >= 0 && tx < map.w && ty >= 0 && ty < map.h) {
        // set a limit on tiles with a mechanic of "onePerLevel"
        let tileLimitPlaced = false
        if (editor.limitedPlacedTiles.includes(editor.selectedTile)) {
          tileLimitPlaced = true
        }
        if (editor.tileset[editor.selectedTile].mechanics) {
          if (editor.tileset[editor.selectedTile].mechanics.includes("onePerLevel") && !editor.limitedPlacedTiles.includes(editor.selectedTile)) {
            editor.limitedPlacedTiles.push(editor.selectedTile)
          }
          if (tileset[editor.selectedTile].mechanics.includes("spawn")) {
            editor.playerSpawn = { x: tx, y: ty }
          }
          if (tileset[editor.selectedTile].mechanics.includes("end")) {
            editor.end = { x: tx, y: ty }
          }
        }
<<<<<<< Updated upstream
        if (tileset[editor.selectedTile].type == "adjacency" && !tileLimitPlaced) {
          calcAdjacentAdjacency(idx, editor.selectedTile)
        } else if (tileset[editor.selectedTile].type == 'rotation' && !tileLimitPlaced) {
          editor.map.tiles[idx] = (editor.selectedTile * 16) + editor.currentRotation
        } else if (tileset[editor.selectedTile].type == 'empty') {
          editor.limitedPlacedTiles = editor.limitedPlacedTiles.filter(f => f !== editor.map.tiles[idx] >> 4)
          calcAdjacentAdjacency(idx, editor.selectedTile)
        } else if (!tileLimitPlaced) {
          calcAdjacentAdjacency(idx, editor.selectedTile)
=======
    } else {
        spaceDown = false
    }

    drawMap(editor.tileSize, editor.cam)

    const cursorScrX = (tx * tileSize) - cam.x
    const cursorScrY = (ty * tileSize) - cam.y
    let img
    const selectedTileOfTileset = tileset[editor.selectedTile]
    if (selectedTileOfTileset.type == "adjacency") {
        img = selectedTileOfTileset.images[calculateAdjacency(ty * map.w + tx, editor.selectedTile) & 15]
    } else if (selectedTileOfTileset.type == "rotation") {
        img = selectedTileOfTileset.images[editor.currentRotation]
    } else {
        img = selectedTileOfTileset.image
    }

    drawSelectedTileImage(img, cursorScrX, cursorScrY, tileSize)

    if (mode == 'editor') {
        requestAnimationFrame(levelEditorLoop)
    }
}

function isStrip(img) {
    if (img) {
        const w = img.naturalWidth, h = img.naturalHeight
        if (w && h) {
            return w == h * 16
        }
    }
}

function createMap(width, height, data) {
    const json = {}
    json.width = width
    json.height = height
    json.jumpHeight = player.jumpHeight
    json.yInertia = player.yInertia
    json.jumpWidth = player.jumpWidth
    json.xInertia = player.xInertia
    json.wallJump = player.wallJump
    json.bouncePadHeight = player.bouncePadHeight
    json.zoom = player.tileSize
    json.tilesetPath = editor.tilesetPath
    json.layers = []
    const tileIdRLE = encodeRLE(data.map(id => id >> 4))
    let mapLayer = {
        "type": "tilelayer",
        "name": "level",
        "data": tileIdRLE
    }
    json.layers.push(mapLayer)

    // encode layer with 2 bits of rotation data, 0-3 and run length encode it
    let rotationList = []
    for (let i = 0; i < data.length; i++) {
        if (editor.tileset[data[i] >> 4].type == "rotation") {
            rotationList.push(data[i] & 3)
        } else {
            rotationList.push(0)
>>>>>>> Stashed changes
        }

      }
    }
    if (lastIdx !== idx) {
      mouseDown = false
    }
  } else {
    mouseDown = false
  }

  if (input.keys['r']) {
    const idx = ty * map.w + tx
    if (!rDown) {
      if (tx >= 0 && tx < map.w && ty >= 0 && ty < map.h) {
        if (tileset[editor.map.tiles[idx] >> 4].type == 'rotation') {
          const currentRotation = editor.map.tiles[idx] & 15
          const newRotation = (currentRotation + 1) % 4
          editor.map.tiles[idx] = (editor.map.tiles[idx] >> 4 << 4) + newRotation
          editor.currentRotation = newRotation
        } else if (editor.map.tiles[idx] >> 4 == 0) {
          const newRotation = (editor.currentRotation + 1) % 4
          editor.currentRotation = newRotation
        }
      }
      rDown = true
    }
  } else {
    rDown = false
  }

  if (input.keys[" "]) {
    if (!spaceDown) {
      changeSelectedTile("last")
      spaceDown = true
    }
  } else {
    spaceDown = false
  }

  ctx.fillStyle = '#C29A62'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  drawMap()

  const cursorScrX = (tx * tileSize) - cam.x
  const cursorScrY = (ty * tileSize) - cam.y
  let img
  const selectedTileOfTileset = tileset[editor.selectedTile]
  if (selectedTileOfTileset && selectedTileOfTileset.type == "adjacency") {
    img = selectedTileOfTileset.images[calculateAdjacency(ty * map.w + tx, editor.selectedTile) & 15]
  } else if (selectedTileOfTileset && selectedTileOfTileset.type == "rotation") {
    img = selectedTileOfTileset.images[editor.currentRotation]
  } else if (selectedTileOfTileset) {
    img = selectedTileOfTileset.image
  }

  if (img) {
    ctx.save()
    ctx.imageSmoothingEnabled = false
    canvas.style.imageRendering = 'pixelated'
    ctx.globalAlpha = 0.5
    ctx.drawImage(img, cursorScrX, cursorScrY, tileSize, tileSize)
    ctx.restore()
  } else {
    ctx.strokeStyle = 'black'
    ctx.strokeRect(cursorScrX, cursorScrY, tileSize, tileSize)
  }
  ctx.globalAlpha = 1
}
export function updateLevelSize(width, height) {
  // need to update the array with new values or slice old ones 
  // and also update editor object
  // note: add new columns on the right of the map
  // note: and new rows on top and same for removing
  let tiles = Array.from(editor.map.tiles)
  if (editor.width > width) {
    const diff = width - editor.width
    for (let h = 0; h < editor.height; h++) {
      // delete the end of the rows
      tiles.splice((h * width) + width, editor.width - width)
    }
  } else if (editor.width < width) {
    // !!Working!!
    const diff = Math.abs(width - editor.width)
    for (let h = 0; h < editor.height; h++) {
      tiles.splice(((h * width) + width - diff), 0, ...Array(diff).fill(0))
    }
  }
  if (editor.height > height) {
    // !!Working!!
    tiles.splice(0, (editor.height - height) * width)
  } else if (editor.height < height) {
    // !!Working!!
    Array((height - editor.height) * width).fill(0)
    tiles.unshift(...Array((height - editor.height) * width).fill(0))
  }

  editor.map.tiles = new Uint16Array(tiles)
  editor.width = width
  editor.height = height
  editor.map.w = width
  editor.map.h = height
}


<<<<<<< Updated upstream
=======
function calculateAdjacency(tileIdx, tileId, tiles = editor.map.tiles) {
    // calculate the adjacency for a given tile when it's placed
    // bug: walls other than the top and bottom don't work
    let variant = 0

    tileId = (typeof tileId == 'number') ? tileId : tiles[tileIdx] >> 4
    if (tileId == 0) return 0

    if (editor.tileset[tileId].type == 'rotation') {
        return tileId << 4
    }

    const getNeighborId = (idx) => {
        const val = tiles[idx]
        return val ? val >> 4 : 0
    }


    const check = (idx) => {
        const nid = getNeighborId(idx)
        if (nid === 0) return false
        const t = editor.tileset[nid]
        return t && t.triggerAdjacency
    }
    // top
    if (tileIdx - editor.width >= 0) {
        if (check(tileIdx - editor.width)) variant += 1
    } else {
        variant += 1
    }
    // right
    if (tileIdx + 1 < tiles.length) {
        if (check(tileIdx + 1)) variant += 2
    } else {
        variant += 2
    }
    // bottom
    if (tileIdx + editor.width < tiles.length) {
        if (check(tileIdx + editor.width)) variant += 4
    } else {
        variant += 4
    }
    // left
    if (tileIdx - 1 >= 0) {
        if (check(tileIdx - 1)) variant += 8
    } else {
        variant += 8
    }

    return (tileId * 16) + variant

}

function calcAdjacentAdjacency(centerTileIdx) {
    const tiles = editor.map.tiles
    const centerVal = calculateAdjacency(centerTileIdx, editor.selectedTile)
    tiles[centerTileIdx] = centerVal
    const w = editor.width
    const neighbors = []
    if (centerTileIdx - w >= 0) neighbors.push(centerTileIdx - w)
    if ((centerTileIdx % w) < w - 1 && centerTileIdx + 1 < tiles.length) neighbors.push(centerTileIdx + 1)
    if ((centerTileIdx % w) > 0 && centerTileIdx - 1 >= 0) neighbors.push(centerTileIdx - 1)
    if (centerTileIdx + w < tiles.length) neighbors.push(centerTileIdx + w)

    neighbors.forEach(n => {
        const tileId = tiles[n] >> 4
        if (tileId !== 0 && editor.tileset[tileId].type == 'adjacency') {
            tiles[n] = calculateAdjacency(n)
        }
    })

    return centerVal
}

export function changeSelectedTile(tileId) {
    if (editor.selectedTile !== editor.lastSelectedTiles[1] && editor.selectedTile != 0) {
        editor.lastSelectedTiles[1] = editor.selectedTile
    }
    if (tileId == "last") {
        editor.selectedTile = editor.lastSelectedTiles[0]
        editor.lastSelectedTiles.unshift(editor.lastSelectedTiles[1])
        editor.lastSelectedTiles.pop()
    } else {
        editor.lastSelectedTiles.shift()
        editor.lastSelectedTiles.push(tileId)
        editor.selectedTile = tileId
    }
}

function scrollCategoryTiles(up) {
    let currentSelectedTiles = document.querySelectorAll(".tile-select-container")
    currentSelectedTiles = Array.from(currentSelectedTiles).filter(f => f.style.display !== "none")
    if (currentSelectedTiles.length !== 0) {
        // moving up works!
        editor.selectedTile = !up ? Number(currentSelectedTiles[(currentSelectedTiles.indexOf(currentSelectedTiles.find(f => f.dataset.tile == String(editor.selectedTile))) + 1) % currentSelectedTiles.length].dataset.tile) : Number(currentSelectedTiles[(currentSelectedTiles.indexOf(currentSelectedTiles.find(f => f.dataset.tile == String(editor.selectedTile))) - 1 + currentSelectedTiles.length) % currentSelectedTiles.length].dataset.tile)
    }
}

function updateTileset(path) {
    editor.tilesetPath = path
    loadTileset(editor.tilesetPath).then(({ tileset, characterImage }) => {
        editor.tileset = splitStripImages(tileset)
        loadPlayerSprites(characterImage)
        addTileSelection()
    })
}

async function loadTileset(manifestPath) {
    return fetch(manifestPath)
        .then(response => response.json())
        .then(manifest => {

            const promises = manifest.tiles.map(tileData => {

                if (!tileData.file) return Promise.resolve(tileData)
                return new Promise((resolve, reject) => {
                    const img = new Image()
                    img.src = manifest.path + tileData.file
                    img.onload = () => resolve({ ...tileData, image: img })
                    img.onerror = reject
                })
            })

            const characterPromise = new Promise((resolve) => {
                if (!manifest.characterFile) return resolve(null)
                const img = new Image()
                img.src = manifest.path + manifest.characterFile
                img.onload = () => resolve(img)
                img.onerror = () => resolve(null)
            })

            return Promise.all([Promise.all(promises), characterPromise])
                .then(([items, characterImage]) => {
                    const tileset = []
                    items.forEach(item => {
                        tileset[item.id] = item
                    })
                    return { tileset, characterImage }
                })
        })
}

function splitStripImages(tileset) {
    // split strip images 
    const newTileset = []
    tileset.forEach(tile => {
        if (!tile) return
        if (tile.type === 'adjacency' && tile.image) {
            // split the strip into different pieces here 
            const h = tile.image.naturalHeight
            const w = tile.image.naturalWidth
            const sublist = []
            for (let i = 0; i < 16; i++) {
                const c = document.createElement('canvas')
                c.width = h
                c.height = h
                const ctx = c.getContext('2d')
                ctx.drawImage(tile.image, i * h, 0, h, h, 0, 0, h, h)

                sublist.push(c)
            }
            newTileset[tile.id] = { ...tile, images: sublist }
        } else if (tile.type == 'rotation') {
            const h = tile.image.naturalHeight
            const w = tile.image.naturalWidth
            const sublist = []
            if (w == h * 4) {
                for (let i = 0; i < 4; i++) {
                    const c = document.createElement('canvas')
                    c.width = h
                    c.height = h
                    const ctx = c.getContext('2d')
                    ctx.drawImage(tile.image, i * h, 0, h, h, 0, 0, h, h)
                    sublist.push(c)
                }
                newTileset[tile.id] = { ...tile, images: sublist }
            } else if (w == h * 8) {
                for (let i = 0; i < 8; i++) {
                    const c = document.createElement('canvas')
                    c.width = h
                    c.height = h
                    const ctx = c.getContext('2d')
                    ctx.drawImage(tile.image, i * h, 0, h, h, 0, 0, h, h)
                    sublist.push(c)
                }
                newTileset[tile.id] = { ...tile, images: sublist }
            }
        } else {
            newTileset[tile.id] = tile
        }
    })
    return newTileset
}

function loadPlayerSprites(playerImg) {
    if (!playerImg) return
    const h = playerImg.naturalHeight
    const w = playerImg.naturalWidth
    const sprites = []

    const count = Math.floor(w / h)
    for (let i = 0; i < count; i++) {
        const c = document.createElement('canvas')
        c.width = h
        c.height = h
        const ctx = c.getContext('2d')
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(playerImg, i * h, 0, h, h, 0, 0, h, h)
        sprites.push(c)
    }
    player.sprites = sprites
}

function addTileSelection() {
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
    }
    sortByCategory("")
}

function updateLevelSize(width, height) {
    // need to update the array with new values or slice old ones 
    // and also update editor object
    // note: add new columns on the right of the map
    // note: and new rows on top and same for removing
    let tiles = Array.from(editor.map.tiles)
    if (editor.width > width) {
        const diff = width - editor.width
        for (let h = 0; h < editor.height; h++) {
            // delete the end of the rows
            tiles.splice((h * width) + width, editor.width - width)
        }
    } else if (editor.width < width) {
        // !!Working!!
        const diff = Math.abs(width - editor.width)
        for (let h = 0; h < editor.height; h++) {
            tiles.splice(((h * width) + width - diff), 0, ...Array(diff).fill(0))
        }
    }
    if (editor.height > height) {
        // !!Working!!
        tiles.splice(0, (editor.height - height) * width)
    } else if (editor.height < height) {
        // !!Working!!
        Array((height - editor.height) * width).fill(0)
        tiles.unshift(...Array((height - editor.height) * width).fill(0))
    }

    editor.map.tiles = new Uint16Array(tiles)
    editor.width = width
    editor.height = height
    editor.map.w = width
    editor.map.h = height
}
>>>>>>> Stashed changes
