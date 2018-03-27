const screenWidth = window.innerWidth
const screenHeight = window.innerHeight

const LEFT_ARROW_SRC = 'images/left_arrow.png'

let left_arrow = new Image()
left_arrow.src = LEFT_ARROW_SRC

export default class BackGround{
    constructor(ctx){
        this.ctx = ctx
    }
    //背景
    fillbackground(){
        this.ctx.fillStyle = '#001605'
        this.ctx.fillRect(0, 0, screenWidth, screenHeight)
    }
    //游戏分数
    drawScore(score){
        //重置画笔，避免污染
        this.ctx.beginPath()

        //this.ctx.fillStyle = "#fff"
        //华文彩云
        this.ctx.font = "bold 40px Agency FB"
        this.ctx.strokeStyle = '#fff'
        this.ctx.lineWidth = 0.7
        this.ctx.strokeText(score, 20, 70)
    }
    //结束分数
    drawOverScore(score){
        //重置画笔，避免污染
        this.ctx.beginPath()
        this.ctx.fillStyle = "#e9ba12"
        //华文彩云
        this.ctx.font = "bold 70px Agency FB"
        this.ctx.textAlign = "center"
        this.ctx.strokeStyle = '#e9ba12'
        this.ctx.lineWidth = 1.5
        this.ctx.strokeText(score, screenWidth / 2 , screenHeight / 4 - 50)
        this.ctx.textAlign = 'left'
    }
    //开始面板
    drawStart(){
        //重置画笔，避免污染
        this.ctx.beginPath()

        this.ctx.fillStyle = 'rgba(0,0,0,0.8)'
        this.ctx.fillRect(screenWidth / 2 - 100, screenHeight / 2 - 150, 200, 240)

        this.ctx.fillStyle = "#e9ba12"
        this.ctx.font = "12px 宋体"
        this.ctx.strokeStyle = '#e9ba12'
        this.ctx.fillText("左右点击跳跃，避开障碍物", screenWidth / 2 - 75, screenHeight / 2 - 10)

        this.ctx.font = "24px Arial "
        this.ctx.fillText(
            'Start',
            screenWidth / 2 - 25,
            screenHeight / 2 + 40
        )
        this.drawDashLine(this.ctx, screenWidth / 2, screenHeight / 2 - 30, screenWidth / 2, screenHeight / 2 - 130)

        this.ctx.strokeStyle = "#e9ba12"
        this.ctx.fillStyle = "#00000000"
        this.ctx.lineJoin = "round";
        this.ctx.lineWidth = 0.51
        this.ctx.rect(screenWidth / 2 - 50, screenHeight / 2 + 10, 100, 40)
        this.ctx.stroke()


        this.ctx.drawImage(left_arrow, screenWidth / 2 - 75, screenHeight / 2 - 100, 40, 40)

        this.ctx.save()
        this.ctx.transform(-1, 0, 0, 1, screenWidth, 0)

        this.ctx.drawImage(left_arrow, screenWidth / 2 - 75, screenHeight / 2 - 100, 40, 40)

        this.ctx.restore()

        /**
         * 重新开始按钮区域
         * 方便简易判断按钮点击
         */
        this.btnArea = {
            startX: screenWidth / 2 - 50,
            startY: screenHeight / 2 + 10,
            endX: screenWidth / 2 + 50,
            endY: screenHeight / 2 + 50
        }
    }

    drawOver(){
        this.ctx.beginPath()
        this.ctx.fillStyle = 'rgba(0,0,0,0.8)'
        this.ctx.fillRect(screenWidth / 2 - 100, screenHeight / 2 - 150, 200, 240)

        this.ctx.fillStyle = "#e9ba12"
        this.ctx.font = "30px Arial"
        this.ctx.fillText(
            '游戏结束',
            screenWidth / 2 - 60,
            screenHeight / 2 - 60
        )
        this.ctx.font = "24px Arial"
        this.ctx.fillText(
            'Restart',
            screenWidth / 2 - 40,
            screenHeight / 2
        )
        this.ctx.strokeStyle = "#e9ba12"
        this.ctx.fillStyle = "#00000000"
        this.ctx.lineJoin = "round"
        this.ctx.lineWidth = 0.51
        this.ctx.rect(screenWidth / 2 - 50, screenHeight / 2 - 30, 100, 40)
        this.ctx.stroke()

        this.btnArea = {
            startX: screenWidth / 2 - 50,
            startY: screenHeight / 2 - 30,
            endX: screenWidth / 2 + 50,
            endY: screenHeight / 2 + 10
        }
    }

    //画虚线
    drawDashLine(ctx, x1, y1, x2, y2, dashLength) {
        var dashLen = dashLength === undefined ? 5 : dashLength,
            xpos = x2 - x1, //得到横向的宽度;
            ypos = y2 - y1, //得到纵向的高度;
            numDashes = Math.floor(Math.sqrt(xpos * xpos + ypos * ypos) / dashLen);
        //利用正切获取斜边的长度除以虚线长度，得到要分为多少段;
        for (var i = 0; i < numDashes; i++) {
            if (i % 2 === 0) {
                ctx.moveTo(x1 + (xpos / numDashes) * i, y1 + (ypos / numDashes) * i);
                //有了横向宽度和多少段，得出每一段是多长，起点 + 每段长度 * i = 要绘制的起点；
            } else {
                ctx.lineTo(x1 + (xpos / numDashes) * i, y1 + (ypos / numDashes) * i);
            }
        }
    }
}