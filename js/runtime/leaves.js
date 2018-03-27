const screenWidth = window.innerWidth
const screenHeight = window.innerHeight

const IMG_LEAF_LEFT = 'images/left.png'
const IMG_LEAF_RIGHT = 'images/right.png'

const LEAF_WIDTH = screenWidth * 0.3
const LEAF_HEIGHT = 1300

let left = new Image()
let right = new Image()

left.src = IMG_LEAF_LEFT
right.src = IMG_LEAF_RIGHT

export default class Leaves {
    constructor(ctx) {
        this.ctx = ctx
        this.top = 0
    }
    //更新位置，每次下移2ps  实现动画
    update() {
        this.top += 2
        if (this.top >= 1300)
            this.top = 0
    }
    //左边右边各画两个叶子 实现衔接动画
    render() {
        this.ctx.drawImage(
            left,
            0,
            -1300 + this.top,
            LEAF_WIDTH,
            LEAF_HEIGHT
        )

        this.ctx.drawImage(
            left,
            0,
            this.top,
            LEAF_WIDTH,
            LEAF_HEIGHT
        )
        this.ctx.drawImage(
            right,
            screenWidth * 0.7,
            -1300 + this.top,
            LEAF_WIDTH,
            LEAF_HEIGHT
        )

        this.ctx.drawImage(
            right,
            screenWidth * 0.7,
            this.top,
            LEAF_WIDTH,
            LEAF_HEIGHT
        )
    }
}
