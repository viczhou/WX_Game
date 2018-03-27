import BackGround from './runtime/background'
import Leaves from './runtime/leaves'
import Floor from './runtime/floor'
import Robot from './runtime/robot'
import Music from './runtime/music'

const screenWidth = window.innerWidth
const screenHeight = window.innerHeight

//获取画布
let ctx = canvas.getContext('2d')

let preImg = ['images/left_arrow.png', 'images/box.png', 'images/left.png', 'images/right.png', 'images/robot.png']

let frameNum = 0
//结束动画的request ID
let overAniNum = 0
//用于帧率计数
let clickNum = 0
//游戏难度设置
let level = 30

let score = 0
//事件值
let event_bac
//防重复点击标志位
let flag = false

export default class Main {
    constructor() {
        this.initBind = this.init.bind(this)
        //预加载图片资源，加载完再开始渲染
        this.preloading(preImg, this.initBind)
    }

    init() {
        // 用做定时，30fps未点击屏幕，台阶自动下落
        this.click = 0
        //判断是否首次加载
        this.isStart = false
        //判断是否启动定时
        this.reStart = false

        this.bg = new BackGround(ctx)
        //填充背景
        this.bg.fillbackground()

        this.floor = new Floor(8)
        //建立台阶
        this.floor.buildStair(ctx)
        //机器人的方向，通过获取无障碍台阶数组，取得第一位来判断方向，即机器人的方向为下一个台阶所在方向
        this.next_direction = this.floor.getStairArr()[0]

        this.robot = new Robot()
        // 构建机器人
        this.robot.buildRobot(ctx, this.next_direction)

        this.leaves = new Leaves(ctx)
        //渲染两侧树叶
        this.leaves.render()
        //开始面板
        this.bg.drawStart()
        //画出初始分数
        this.bg.drawScore(score)
        this.touchHandlerBind = this.touchHandler.bind(this)
        canvas.addEventListener('touchstart', this.touchHandlerBind)

        //背景音乐类
        // this.music = new Music()
        // wx.onShow(function () {
        //     this.music.playBgm()
        // }.bind(this))
    }

    //开始游戏按钮监听事件
    touchHandler(e) {
        let x = e.touches[0].clientX
        let y = e.touches[0].clientY

        let area = this.bg.btnArea

        if (x >= area.startX
            && x <= area.endX
            && y >= area.startY
            && y <= area.endY) {
            //点击开始后 ，移除开始面板事件监听，开始主逻辑
            canvas.removeEventListener('touchstart', this.touchHandlerBind)
            this.start()

            flag = false
        }
    }

    start() {
        score = 0
        //restart时 ，初始化台阶 ，首次加载不需要初始化，前面已经初始化过了
        if (this.isStart) {
            this.floor.init()
        }

        this.bg.fillbackground()
        this.floor.buildStair(ctx)
        this.robot.reset()
        this.robot.buildRobot(ctx, this.floor.getStairArr()[0])
        this.leaves.render()

        //游戏主逻辑事件
        this.loopBind = this.loop.bind(this)
        //时间截止动作事件
        this.timeOverBind = this.timeOver.bind(this)
        //开启时间监听
        this.overId = window.requestAnimationFrame(this.timeOverBind)
        //主逻辑点击事件监听
        canvas.addEventListener('touchstart', this.loopBind, true)

        //时间结束动画计数
        this.timeOverAniBind = this.timeOverAni.bind(this)
        //游戏逻辑  点错方向时相关动作
        this.clickOverAniBind = this.clickOverAni.bind(this)

        this.bg.drawScore(score)
    }

    loop(event) {

        //为了解决点击事件bug,在结束动作还未执行前监听到点击动作，会造成的异常
        if (flag) {
            return
        }
        //取得event ,为了避免出现在第一次事件的帧循环中捕获到第二次事件， 从而导致第二次事件发生时，event值为空
        if (event.touches) {
            event_bac = event
        }

        this.click = 0
        this.isStart = true
        this.reStart = true
        //判断是否是每次动作开始
        if (frameNum === 0) {
            //下个正确的方向
            this.next_direction = this.floor.getStairArr()[0]
            //获取当前台阶上的障碍台阶
            this.obstacle_direction = this.floor.getObstacleArr()[0]
            //更新台阶
            this.floor.update()

            let x = event_bac.touches[0].clientX

            let clickBtn = x < screenWidth / 2 ? 0 : 1
            //判断到游戏结束
            if (clickBtn !== this.next_direction) {
                flag = true
                window.cancelAnimationFrame(this.overId)
                this.reStart = false
                //启动死亡动画
                window.requestAnimationFrame(this.clickOverAniBind)
                this.gameOver()

                //重置K值 用于计数
                this.floor.restart(-1)

                return
            }
            score++
        }
        //fps帧值
        frameNum++

        //每个动作设为26帧的动画
        if (frameNum < 26) {
            this.aniId = window.requestAnimationFrame(this.loopBind, canvas)
        }

        this.bg.fillbackground()

        this.floor.buildStair(ctx)

        this.robot.update()
        this.robot.buildRobot(ctx, this.next_direction)

        this.leaves.update()
        this.leaves.render()

        this.bg.drawScore(score)
        if(score < 281){
            level = 30 - Math.floor(score / 10)  
        }

        //每次动作最后一帧重置帧值，以及机器人位置（雪碧图）
        if (frameNum === 26) {
            frameNum = 0
            this.robot.reset()
        }

    }
    //游戏点击死亡事件回调
    clickOverAni() {
        //事件动作的帧值，用于动画
        clickNum++
        this.bg.fillbackground()

        this.floor.buildStair(ctx)
        //判断是否在这次的错误方向存在相邻的障碍台阶
        if (this.obstacle_direction === 1) {
            //存在，机器人实现撞台阶动画
            this.robot.jump_dead(false)
        } else {
            //机器人下落动画
            this.robot.jump_dead(true)
        }

        this.robot.buildRobot(ctx, this.next_direction ? 0 : 1)
        this.leaves.render()

        if (clickNum < 26) {
            window.requestAnimationFrame(this.clickOverAniBind)
        } else {
            //结束后震动
            wx.vibrateLong()
            this.bg.drawOver()
            //重置帧
            clickNum = 0
            //游戏结束后，结束面板上方显示总分数
            this.bg.drawOverScore(score)
        }
    }

    //定时不点击 结束游戏 30fps 
    timeOver() {
        this.overId = window.requestAnimationFrame(this.timeOverBind)
        //判断是否已经开始游戏，开始后才启动监听
        if (this.reStart) {
            this.click++
            //到达30 fps 游戏结束
            if (this.click === level) {
                //取消监听
                window.cancelAnimationFrame(this.overId)
                //启动结束动画，台阶下落
                window.requestAnimationFrame(this.timeOverAniBind)
                this.gameOver()
                this.floor.restart(-1)
                console.log('over~~~~~')
            }
        }
    }
    //台阶下落动画 
    timeOverAni() {
        //fps
        overAniNum++

        this.bg.fillbackground()
        //绘出台阶
        this.floor.dropStair(ctx)
        //40fps   前20掉落前一块台阶，后20 掉落当前及机器人 
        if (overAniNum >= 20) {
            this.robot.time_dead()
        }

        this.robot.buildRobot(ctx, this.next_direction)

        this.leaves.render()

        if (overAniNum < 40) {
            window.requestAnimationFrame(this.timeOverAniBind)
        } else {
            wx.vibrateLong()

            //结束面板 
            this.bg.drawOver()
            //重置动画帧
            overAniNum = 0
            //绘制总分数
            this.bg.drawOverScore(score)
        }
    }

    //游戏结束相关动作
    gameOver() {
        //移除游戏逻辑的点击事件
        canvas.removeEventListener('touchstart', this.loopBind)
        
        let that = this

        //避免还未渲染完动画  就监听到重新开始事件，执行
        setTimeout(function () {
            canvas.addEventListener('touchstart', that.touchHandlerBind)
        }, 500)

        console.log('得分：' + score)
    }

    //图片预加载
    preloading(preImgs, success) {

        let loadLen = preImgs.length;

        preImgs.forEach(function (img) {
            let $img = new Image();
            $img.onload = function () {
                loading();
            }
            $img.src = img;
        });

        /**
         * 判断是否完成加载
         * @return {undefined}
         */
        function loading() {
            console.log('LOADING... ' + (5 - loadLen + 1) * 20 + '%')
            if (!--loadLen) {
                console.log('加载完成')
                success && success();
            }
        }
    }
}