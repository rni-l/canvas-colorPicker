# 这是一个使用canvas制作的，移动端颜色选择器。

这是[demo](https://yiiouo.github.io/canvas-colorPicker/)链接，用手机打开或者用移动端模式。

这里全采用canvas制作，没有使用到图片。

## 如何使用

只要把colorPicker.只要把colorPicker.css导入就好了。按下面代码调用即可:

		//html结构
		<div class='colorPickerbox'>
	    <canvas id='colorPicker'></canvas>
	    <div class="colorPickerBtnWrap"></div>
	  </div>

		//调用代码
		new ColorPicker({
      oBox: document.querySelector('.colorPickerbox'),//最外层
      oBtnWrap: document.querySelector('.btnWrap'),//按钮外层
      oCan: document.querySelector('#colorPicker'),//画布
      width: 200,//画布宽高
      height: 200,
      callback:function(color){//回调函数
        //color就是获取到的颜色
      }
    }).init()//初始化


## 制作外环颜色

首先把外环的颜色制作出来，这里使用了hsl来处理。
![Alt text](./color.png)

使用moveTo和lineTo，一条条线的绘制出来，

	for (var i = 0; i < 360; i += .1) {
    //获取度数
    var rad = i * (2 * Math.PI) / 360,
      c_x = Math.cos(rad),
      c_y = Math.sin(rad),
      //外环的厚度
      lineW = this.lineW
    ctx.strokeStyle = "hsl(" + i + ", 100%, 50%)";
    ctx.beginPath();
    ctx.moveTo(x + (x - lineW) * c_x, y + (y - lineW) * c_y);
    //求出另外两点坐标
    ctx.lineTo(x + x * c_x, y + y * c_y);
    ctx.stroke();
    ctx.closePath();}

## 绘制正方形的颜色。

这里是用从外环获取的颜色，加上白色从左到右的渐变，加上黑色从下到上的渐变，制造出来的。外环每次改变颜色后，正方形的颜色都要改变。

		//原色
		ctx.clearRect(iX, iX, iW, iW)
	  ctx.fillStyle = color
	  //只清除正方形那块区域
	  ctx.fillRect(iX, iX, iW, iW)
	  //白色渐变色
	  var g = ctx.createLinearGradient(iX, (iX + iW) / 2, iX + iW, (iX + iW) / 2)
	  g.addColorStop(0, "#FFFFFF")
	  g.addColorStop(1, "rgba(255,255,255,0)");
	  ctx.fillStyle = g;
	  ctx.fillRect(iX, iX, iW, iW);
	  //黑色渐变色
	  var g = ctx.createLinearGradient(iX, iX + iW, iX, iX)
	  g.addColorStop(0, "#000000")
	  g.addColorStop(1, "rgba(0,0,0,0)");
	  ctx.fillStyle = g;
	  ctx.fillRect(iX, iX, iW, iW);


## 获取颜色

获取颜色就是用到了canvas的getImageData，获取到x,y坐标后，`ctx.getImageData(x,y,1,1)`得到颜色的数据，最后组装下就获取到rgb了。

## 如何判断坐标是在圆环内？

这里先求出移动的点到圆心点的距离，再判断这段距离是否大于内圆的半径且小于外圆的半径，这样就可以了。




如果哪里有问题希望可以提出来，我再改进下，谢谢~~    :)
