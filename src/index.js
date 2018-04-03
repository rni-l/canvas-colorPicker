function ColorPicker({
  dom, width = 200, height = 200, outsideWidh = 20, callback = false
}) {
  if (!dom) {
    throw new Error('请传入 dom 节点')
  }
  this.oWrap = document.querySelector(dom)
  this.oCanvas = {}
  this.ctx = {}
  this.w = width // 画布的宽高
  this.h = width
  this.lineW = outsideWidh // 外层颜色的厚度
  this.outsideRadius = this.w / 2 // 外圆半径
  this.insideRadius = this.outsideRadius - this.lineW // 内圆半径
  // 内层颜色块是一个正方形
  // 内层颜色宽高,坐标
  this.rectW = (this.insideRadius - 5) / Math.cos(2 * Math.PI / 360 * 45)
  this.rectX = (this.w - this.rectW) / 2
  this.where = '' // 点击时的位置
  // 属性
  this.opts = {
    insideX: 0,
    insideY: 0,
    oCanvas_left: 0,
    oCanvas_top: 0
  }
  this.callback = callback
  this.bindMove = null
  this.bindUp = null
}

ColorPicker.prototype = {
  // 初始化
  init() {
    this.createDom()
    this.oCanvas.width = this.w
    this.oCanvas.height = this.h
    // 按钮宽度
    this.btnW = this.oInsideBtn.offsetWidth

    const x = this.w / 2,
      y = this.h / 2

    // 按钮位置初始化
    this.transform(this.oInsideBtn, 'translate(' + (this.rectW + this.rectX - this.btnW) + 'px ,' + this.rectX + 'px)')
    this.transform(this.oOutsideBtn, 'translate(' + x + 'px ,' + 0 + 'px)')
    this.opts.insideX = this.rectW + this.rectX - this.btnW
    this.opts.insideY = this.rectX

    // 生成外层颜色
    this.createColorBg(x, y)
    // 生成内颜色
    this.createInsideColor('red')
    
    // 添加事件
    this.bindMove = this.hanldeMove.bind(this)
    this.bindUp = this.handleUp.bind(this)
    // pc端
    this.oCanvas.addEventListener('mousedown', this.AddhanldeMove.bind(this), false)
    // 移动端
    this.oCanvas.addEventListener('touchstart', this.AddhanldeMove.bind(this), false)
  },

  // 自动生成 dom
  createDom() {
    const styles = {
      position: 'absolute',
      width: '2px',
      height: '2px',
      boxSizing: 'border-box',
      border: 'solid 1px #B3B3B3',
      borderRadius: '50%',
      cursor: 'default'
    }
    function createStyle() {
      return Object.keys(styles).map(v => (`${v}: ${styles[v]};`)).join('')
    }
    const dom = `
    <div class='colorPickerbox'>
      <canvas class='colorPicker'></canvas>
      <div class="colorPickerBtnWrap" style="position: absolute;cursor: default;top: 0;left: 0;">
        <div class="insideBtn" style="${createStyle()}"></div>
        <div class="outsideBtn" style="${createStyle()}"></div>
      </div>
    </div>`
    this.oWrap.innerHTML = dom
    this.oCanvas = document.querySelector('.colorPicker')
    this.ctx = this.oCanvas.getContext('2d')
    // 两个颜色选择点
    this.oInsideBtn = document.querySelector('.insideBtn')
    this.oOutsideBtn = document.querySelector('.outsideBtn')
  },

  AddhanldeMove(e) {
    // 每次点击，更新 canvas 到浏览器的左上角的距离
    const { x, y } = this.getElemPos(this.oCanvas)
    this.opts.oCanvas_left = x
    this.opts.oCanvas_top = y
    // 颜色初始化
    document.addEventListener('mousemove', this.bindMove, false)
    document.addEventListener('mouseup', this.bindUp, false)
    document.addEventListener('touchmove', this.bindMove, false)
    document.addEventListener('touchend', this.bindUp, false)
  },

  handleUp() {
    document.removeEventListener('mousemove', this.bindMove, false)
    document.removeEventListener('mouseup', this.bindUp, false)
    document.removeEventListener('touchmove', this.bindMove, false)
    document.removeEventListener('touchend', this.bindUp, false)
  },

  // 生成圆环颜色
  createColorBg(x, y) {
    const ctx = this.ctx
    for (let i = 0; i < 360; i += 0.1) {
      // 获取度数
      const rad = i * (2 * Math.PI) / 360,
        c_x = Math.cos(rad),
        c_y = Math.sin(rad),
        lineW = this.lineW
      ctx.strokeStyle = "hsl(" + i + ", 100%, 50%)"
      ctx.beginPath()
      ctx.moveTo(x + (x - lineW) * c_x, y + (y - lineW) * c_y)
      // 求出另外两点坐标
      ctx.lineTo(x + x * c_x, y + y * c_y)
      ctx.stroke()
      ctx.closePath()
    }
  },

  // 生成矩形颜色
  createInsideColor(color) {
    // 生成内颜色
    const ctx = this.ctx,
      rectW = this.rectW,
      rectX = this.rectX // 起点坐标
    // 清除指定区域
    ctx.clearRect(rectX, rectX, rectW, rectW)
    ctx.fillStyle = color
    ctx.fillRect(rectX, rectX, rectW, rectW)
    // 白色
    let g = ctx.createLinearGradient(rectX, (rectX + rectW) / 2, rectX + rectW, (rectX + rectW) / 2)
    g.addColorStop(0, "#FFFFFF")
    g.addColorStop(1, "rgba(255,255,255,0)")
    ctx.fillStyle = g
    ctx.fillRect(rectX, rectX, rectW, rectW)

    // 黑色
    g = ctx.createLinearGradient(rectX, rectX + rectW, rectX, rectX)
    g.addColorStop(0, "#000000")
    g.addColorStop(1, "rgba(0,0,0,0)")
    ctx.fillStyle = g
    ctx.fillRect(rectX, rectX, rectW, rectW)
  },

  hanldeMove(e) {
    //移动事件
    const { oCanvas_left, oCanvas_top } = this.opts
    const { clientX, clientY } = e.touches ? e.touches[0] : e,
      x = clientX - oCanvas_left,
      y = clientY - oCanvas_top
    // 获取点击的位置，如果不在范围内，结束
    const pos = this.getPosition(x, y)
    if (!pos) return false
    const where = this.where
    this.transform(where === 'outside' ? this.oOutsideBtn : this.oInsideBtn, 'translate(' + pos.x + 'px ,' + pos.y + 'px)')
    let color = this.getColor(pos.x, pos.y)
    if (where === 'outside') {
      //如果是外层，要改变内层颜色
      this.createInsideColor(color)
      const { insideX, insideY } = this.opts
      color = this.getColor(insideX, insideY)
    }
    this.callback && this.callback(color)
  },

  getPosition(x, y) {
    // 判断外按钮位置
    let w = this.w,
      h = this.h,
      rectW = this.rectW,
      rectX = this.rectX

    // 获取圆心到点的距离
    const d = Math.sqrt(Math.pow((x - w / 2), 2) + Math.pow((y - h / 2), 2))

    // 判断在内层颜色内
    if ((x > rectX && x < rectX + rectW) && (y > rectX && y < rectX + rectW)) {
      this.where = 'inside'
    } else if (d >= this.insideRadius && d <= this.outsideRadius) {
      // 判断在外层颜色内
      this.where = 'outside'
    } else {
      console.log('no in color range')
      return false
    }
    const where = this.where,
      btnW = this.btnW,
      btnW2 = btnW / 2
    //计算是否有超出
    if (where === 'outside') {
      if (x < btnW2) {
        x = 0
      } else if (x > w - btnW2) {
        x = w - btnW
      }
      if (y < btnW2) {
        y = 0
      } else if (y > h - btnW2) {
        y = h - btnW
      }
    } else {
      var x1 = rectX - btnW2,
        y1 = rectW + rectX - btnW2,
        y2 = rectW + rectX - btnW
      if (x < x1) {
        x = rectX
      } else if (x > y1) {
        x = y2
      }
      if (y < x1) {
        y = rectX
      } else if (y > y1) {
        y = y2
      }

      this.opts.insideX = x
      this.opts.insideY = y
    }
    return { x, y }
  },

  transform(obj, data) {
    obj.style.WebkitTransform = data
    obj.style.transform = data
  },

  // 根据 x, y 坐标，获取 cnavas 某个点的颜色
  getColor(x, y) {
    const { data } = this.ctx.getImageData(x, y, 1, 1)
    return 'rgb(' + data[0] + ',' + data[1] +
        ',' + data[2] + ')'
  },

  getElemPos(domObj) {
    // 获取目标，到最外层的offsetLeft和offsetTop
    let left = 0
    let top = 0
    if (domObj.offsetParent) {
      while (domObj) {
        top += domObj.offsetTop
        left += domObj.offsetLeft
        domObj = domObj.offsetParent
      }
    } else if (domObj.x) {
      left += domObj.x
    } else if (domObj.x) {
      top += domObj.y
    }
    return {
      x: left,
      y: top
    }
  }
}

module.exports = ColorPicker
