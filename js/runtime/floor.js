import Utils from '../utils/utils'

const screenWidth = window.innerWidth
const screenHeight = window.innerHeight

const BOX_IMG_SRC = 'images/box.png'

let box = new Image()
box.src = BOX_IMG_SRC

let move_flag = 0
//记录帧数
let AnimationFrame = 0
//障碍物图片起始横坐标(裁剪)
let obstacle_img = [0, 170, 340, 510, 680]

//和fps相关 ， 用于计算动画每帧的偏移量
let k = -2

export default class Floor {
    constructor(stairNum) {
        //总台阶数
        this.stairNum = stairNum
        //无障碍数组
        this.stairArr = []
        //障碍数组
        this.obstacleArr = []
        //障碍图片数组
        this.obstacle_imgArr = []
        //首次渲染会多运行的次数，用于避免首次渲染每次的台阶会被更新
        this.first = 3
        //台阶的宽高
        this.width = 80
        this.height = 67

        this.init()
    }

    init() {
        this.utils = new Utils()
        //即将下落的障碍数组
        //台阶从上往下画，障碍台阶基于无障碍，所以障碍台阶会比无障碍在上方1-3个位置，当无障碍下落时障碍砖也会消失，所以用该数组多保存三个用于渲染
        this.obs_sh = []
        //障碍图片
        this.obs_img = []
        //即将下落的无障碍台阶
        this.stair_sh = []
        //构建无障碍数组
        this.stairArr = this.utils.createRandomOneZero(this.stairNum)
        //构建障碍数组
        this.obstacleArr = this.utils.createRandomProbability([.5, .2, .2, .1], this.stairNum)

        //障碍台阶上的图片随机
        for (let i = 0; i < this.obstacleArr.length; i++) {
            this.obstacle_imgArr[i] = !this.obstacleArr[i] ? this.obstacleArr[i] : obstacle_img[this.utils.getRandomInt(0, 5)]
        }
        //初始化台阶位置
        this.init_stair()
    }
    //返回无障碍台阶。用于判断下次正确的方向
    getStairArr() {
        return this.stairArr
    }
    //返回障碍台阶的方向，用于机器人方向不正确时的动画选择（即撞墙或者下落）
    getObstacleArr() {
        return this.obstacleArr
    }

    init_stair() {
        //记录当前台阶位置，即最上面一个台阶
        if (this.first) {
            this.stair_x = this.calculate_x()
            this.stair_y = - 10
            this.first--
        } else {
            this.stair_x = this.calculate_x() + move_flag * this.width / 2 - AnimationFrame * (move_flag * this.width) / (2 * 26) 
            this.stair_y = - 63 + AnimationFrame * (53 / 26) 
            AnimationFrame += 1
        }
    }

    //计算最上面的台阶横坐标，（确保最下面砖块在屏幕中间）
    calculate_x() {
        let result = 0

        for (let i = 0; i < this.stairArr.length; i++) {
            result += this.stairArr[i]
        }
        result = result * 2 - this.stairNum
        return result * (this.width / 2) - this.width / 2 + screenWidth / 2
    }
    //更新障碍及无障碍数组，每次添加一个新的台阶，移除一个旧的
    update() {
        
        AnimationFrame = 0

        move_flag = this.stairArr.shift()

        this.stair_sh.push(move_flag)

        move_flag = move_flag ? 1 : -1

        this.obs_sh.push(this.obstacleArr.shift())
  
        this.stairArr = this.stairArr.concat(this.utils.createRandomOneZero(1))
        this.obstacleArr = this.obstacleArr.concat(this.utils.createRandomProbability([.5, .2, .2, .1], 1))

        this.obs_img.push(this.obstacle_imgArr.shift())
        this.obstacle_imgArr.push(!this.obstacleArr[7] ? this.obstacleArr[7] : obstacle_img[this.utils.getRandomInt(0, 5)])

        if (this.obs_sh.length > 5) {
            this.obs_sh.shift()
            this.obs_img.shift()
            this.stair_sh.shift()
        }
    }

    //没跳对方向,已经执行了一次update，会导致重置变量后再执行一次，fps变量值不对，所以在这里先重置为初始值 - 执行的次数
    restart(num){
        k = num
    }

    buildStair(ctx) {
        this.init_stair()
        ctx.drawImage(
            box,
            0,
            0,
            150,
            125,
            this.stair_x,
            this.stair_y,
            this.width,
            this.height
        )
        for (let i = this.stairArr.length + - 1; i >= 0; i--) {
            //无障碍
            let direction = this.stairArr[i] ? -1 : 1

            //障碍,无障碍砖的反方向，由于是从上往下画，所以值是相反的，即这里的结果为何无障碍砖同方向 
            let oppoDirection = this.stairArr[i] ? -1 : 1

            //碍数组存储的随机相对距离
            let n = this.obstacleArr[i]

            this.stair_x += direction * (this.width / 2)
            this.stair_y += 53

            this.obstacle_x = this.stair_x + oppoDirection * (this.width / 2) * n
            this.obstacle_y = this.stair_y - 53 * n

            if (n !== 0) {
                ctx.drawImage(
                    box,
                    0,
                    0,
                    150,
                    125,
                    this.obstacle_x,
                    this.obstacle_y,
                    this.width,
                    this.height
                )
                ctx.drawImage(
                    box,
                    this.obstacle_imgArr[i],
                    130,
                    165,
                    130,
                    this.obstacle_x,
                    this.obstacle_y - 30,
                    this.width,
                    this.height
                )
            }
            ctx.drawImage(
                box,
                0,
                0,
                150,
                125,
                this.stair_x,
                this.stair_y,
                this.width,
                this.height
            )
        }
        //用于监听已经下落的下标
        let move = []
        //显示机器人后两块台阶及五块障碍砖（为了与无障碍台阶保持统一水平轴），用于延迟下落动画
        for (let i = this.obs_img.length - 1; i >= 0; i--) {
            let direction = this.stair_sh[i] ? -1 : 1

            this.stair_x += direction * (this.width / 2)
            this.stair_y += 53

            let n = this.obs_sh[i]

            this.obstacle_x = this.stair_x + direction * (this.width / 2) * n
            this.obstacle_y = this.stair_y - 53 * n

            if (i >= this.obs_img.length - 2) {
                ctx.drawImage(
                    box,
                    0,
                    0,
                    150,
                    125,
                    this.stair_x,
                    this.stair_y > 470 ? this.stair_y + 20 * k : this.stair_y,
                    this.width,
                    this.height
                )
            }

            if (n !== 0) {
                ctx.drawImage(
                    box,
                    0,
                    0,
                    150,
                    125,
                    this.obstacle_x,
                    this.obstacle_y > 470 ? this.obstacle_y + 20 * k : this.obstacle_y,
                    this.width,
                    this.height
                )
                ctx.drawImage(
                    box,
                    this.obs_img[i],
                    130,
                    165,
                    130,
                    this.obstacle_x,
                    this.obstacle_y > 470 ? this.obstacle_y + 20 * k - 30 : this.obstacle_y - 30,
                    this.width,
                    this.height
                )
                //下落动画的砖块下标保存
                if (this.obstacle_y > 470) {
                    move.push(i)
                }
            }

        }
        if (k < 25) {
            k++
        } else {
            k = 0

            //移除已经下落的障碍砖
            for (let i = 0; i < move.length; i++) {
                this.obs_sh[move[i]] = 0
                this.obs_img[move[i]] = 0
            }
        }
    }
    //计算每次下落的位置
    dropInit_stair() {
        this.stair_x = this.calculate_x() + move_flag * this.width / (2 * 26)
        this.stair_y = - 12
    }
    //下落动画的实现（即时间导致游戏结束的台阶及机器人掉落动画）
    dropStair(ctx) {
        this.dropInit_stair()

        ctx.drawImage(
            box,
            0,
            0,
            150,
            125,
            this.stair_x,
            this.stair_y,
            this.width,
            this.height
        )
        for (let i = this.stairArr.length + - 1; i >= 0; i--) {
            //无障碍
            let direction = this.stairArr[i] ? -1 : 1

            //障碍,无障碍砖的反方向，由于是从上往下画，所以值是相反的，即这里的结果为何无障碍砖同方向 
            let oppoDirection = this.stairArr[i] ? -1 : 1

            //碍数组存储的随机相对距离
            let n = this.obstacleArr[i]

            this.stair_x += direction * (this.width / 2)
            this.stair_y += 53

            this.obstacle_x = this.stair_x + oppoDirection * (this.width / 2) * n
            this.obstacle_y = this.stair_y - 53 * n

            if (n !== 0) {
                ctx.drawImage(
                    box,
                    0,
                    0,
                    150,
                    125,
                    this.obstacle_x,
                    this.obstacle_y,
                    this.width,
                    this.height
                )
                ctx.drawImage(
                    box,
                    this.obstacle_imgArr[i],
                    130,
                    165,
                    130,
                    this.obstacle_x,
                    this.obstacle_y - 30,
                    this.width,
                    this.height
                )
            }

            ctx.drawImage(
                box,
                0,
                0,
                150,
                125,
                this.stair_x,
                this.stair_y > 400 && k > 20 ? this.stair_y + 25 * (k - 20) : this.stair_y,
                this.width,
                this.height
            )
        }

        //用于监听已经下落的下标
        let move = []
        let move2 = []
        //显示机器人后两块台阶及五块障碍砖（为了与无障碍台阶保持统一水平轴），用于延迟下落动画
        for (let i = this.obs_img.length - 1; i >= 0; i--) {
            let direction = this.stair_sh[i] ? -1 : 1

            this.stair_x += direction * (this.width / 2)
            this.stair_y += 53

            let n = this.obs_sh[i]

            this.obstacle_x = this.stair_x + direction * (this.width / 2) * n
            this.obstacle_y = this.stair_y - 53 * n
            //前20fps  掉落前一块台阶， 20-40fps将机器人所在y轴的台阶及机器人掉落
            if (i === this.obs_img.length - 1) {
                ctx.drawImage(
                    box,
                    0,
                    0,
                    150,
                    125,
                    this.stair_x,
                    this.stair_y > 460 ? this.stair_y + 20 * k : this.stair_y,
                    this.width,
                    this.height
                )
            }

            if (n !== 0) {

                ctx.drawImage(
                    box,
                    0,
                    0,
                    150,
                    125,
                    this.obstacle_x,
                    this.obstacle_y > 460 && k < 20? this.obstacle_y + 20 * k  : 
                        this.obstacle_y > 400 && k >=20 ? this.obstacle_y + 25 * (k - 20) : this.obstacle_y,
                    this.width,
                    this.height
                )
                ctx.drawImage(
                    box,
                    this.obs_img[i],
                    130,
                    165,
                    130,
                    this.obstacle_x,
                    this.obstacle_y > 460 ? this.obstacle_y + 20 * k  - 30 :
                        this.obstacle_y > 400 && k >= 20 ? this.obstacle_y + 25 * (k - 20) -30 :  this.obstacle_y - 30,
                    this.width,
                    this.height
                )
                //下落动画的砖块下标保存
                if (this.obstacle_y > 460 && k < 20 ){
                    move2.push(i)
                } 
                if(this.obstacle_y > 400 && k >= 20 ) {
                    move.push(i)
                }
            }

        }
        //第20fps 将前一块已经掉下的台阶从数组移除，避免后面的下落动画再次将台阶画出来
        if( k === 19){
            for (let i = 0; i < move2.length; i++) {
                this.obs_sh[move2[i]] = 0
                this.obs_img[move2[i]] = 0
            }
        }
        if (k < 40) {
            k++
        } else {
            k = 0

            //移除已经下落的障碍砖
            for (let i = 0; i < move.length; i++) {
                this.obs_sh[move[i]] = 0
                this.obs_img[move[i]] = 0
            }
        }
    }
}