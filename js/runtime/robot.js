const screenWidth = window.innerWidth
const screenHeight = window.innerHeight
const ROBOT_SRC = 'images/robot.png'

let robot = new Image()
robot.src = ROBOT_SRC

let i = 0
export default class Robot {
    constructor() {
        //机器人的宽高
        this.width = 65
        this.height = 150

        //人物位置
        this.x = screenWidth / 2 - 20
        this.y = 53 * 6 - 20

        this.start_x = 0
        this.start_y = 0
    }

    update() {
        if (this.start_x < 9 * 150 && this.start_y === 0 ){
            this.start_x += 150
        }else if(this.start_x === 9 * 150 && this.start_y === 0){
            this.start_y = 283
            this.start_x = 0
        }else if(this.start_x < 9 * 150 && this.start_y === 283){
            this.start_x += 150
        }

        if (i++ < 13) {
            //53为每次下落的高度  每次下落分26次画 实现动画
            this.y -= 53 / 26
            //80为砖块宽度  每次移动的宽度为一般的砖块宽度  即 80 / 2    
            this.x -= 80 / 52
        } else {
            this.y += 53 / 26
            this.x += 80 / 52
        }
        i = i === 26 ? 0 : i
    }
    reset() {
        this.start_x = 0
        this.start_y = 0
        this.x = screenWidth / 2 - 20
        this.y = 53 * 6 - 20
    }

    // set_y(num) {
    //     this.y += num
    // }

    jump_dead(flag) {
        if (this.start_x < 9 * 150 && this.start_y === 0) {
            this.start_x += 150
        } else if (this.start_x === 9 * 150) {
            this.start_y = 283
            this.start_x = 0
        } else if (this.start_x < 9 * 150 && this.start_y === 283) {
            this.start_x += 150
        }

        if (flag) {
            if (i++ < 13) {
                this.y -= 5
                this.x -= 7
            } else {
                this.y += 42
            }
        } else {
            this.y += 53 / 26
            this.x -= 80 / 52
        }
        i = i === 26 ? 0 : i
    }

    time_dead() {
        if (this.start_x < 9 * 150 && this.start_y === 0) {
            this.start_x += 150
        } else if (this.start_x === 9 * 150 && this.start_y === 0) {
            this.start_y = 283
            this.start_x = 0
        } else if (this.start_x < 9 * 150 && this.start_y === 283) {
            this.start_x += 150
        }

        if (i++ < 10) {
            this.y -= 4
        } else {
            this.y += 50
        }
        i = i === 21 ? 0 : i
    }

    buildRobot(ctx, next_direction) {
        if (next_direction) {

            ctx.save()
            ctx.transform(-1, 0, 0, 1, screenWidth, 0)
            ctx.drawImage(
                robot,
                this.start_x,
                this.start_y,
                132,
                285,
                this.x,
                this.y,
                this.width,
                this.height
            )
            ctx.restore()

        } else {
            ctx.drawImage(
                robot,
                this.start_x,
                this.start_y,
                132,
                285,
                this.x,
                this.y,
                this.width,
                this.height
            )
        }
    }
}