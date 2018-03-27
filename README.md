## quickstart

## 源码目录介绍

	./js
	├── libs
	│   ├── symbol.js                          // ES6 Symbol简易兼容
	│   └── weapp-adapter.js                   // 小游戏适配器
	├── utils
	│   └── utils.js                           // 生成随机数等工具方法
	├── runtime
	│   ├── background.js                      // 背景类
	│   ├── floor.js                           // 台阶生成相关
	│   ├── leaves.js                          // 叶子生成相关
	│   └── robot.js                           // 游戏人物
	│                           
	└── main.js                           // 游戏入口主函数

1. weapp-adapter是官方实现了一个 Adapter，基于浏览器环境的游戏引擎在小游戏运行环境下的一层适配层，使游戏引擎在调用 DOM API 和访问 DOM 属性时不会产生错误
2. symbol 对于ES6中Symbol的极简兼容，没有用到



#技术实现
###参考资料
  [cynthia-指尖大冒险分析](https://www.tapd.cn/20874001/prong/stories/view/1120874001001045344?url_cache_key=03284e95cc1f3fbf21561e29e8eff0ed&action_entry_type=story_tree_list)

  [H5游戏开发：指尖大冒险](https://zhuanlan.zhihu.com/p/31487238)

###1. 背景层(树叶)的移动

对两侧树叶实现循环向下滑动的动画效果

实现步骤：

1. 同侧绘制两个树叶图，img1绘制在可视区域中，img2绘于img1之上

2. 滚动时，同时将img1与img2绘制参数y轴坐标加上同样的偏移值top
3. 判断偏移值是否大于图片显示高度，如果是的话，将偏移值置0，即完成图片移位（代码中采取图片高度为1300,屏幕高度小于1300，移动采用requestAnimationFrame实现，一个动作使用26fps实现动画效果,每个fps中top+2,每秒设60fps）
	
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

###2. 石阶的布局

石阶部分分为无障碍石阶和障碍石阶

**2.1  无障碍石阶**

无障碍阶砖组成一条畅通无阻的路径。 在游戏设定里，用户只能通过点击屏幕的左侧或者右侧区域来操控机器人的走向，那么下一个无障碍阶砖必然在当前阶砖的左上方或者右上方。用0，1分别表示该石阶在上一个石阶的左上测和右上测,就可以生成随机数组，值为[0,1]

**2.2 障碍石阶**

无障碍石阶的反向存在障碍石阶，障碍石阶的距离范围为1～3。每个距离范围的出现满足一定的概率。如0 -> 50%;1->20%;2->20%;30->10%,用 0、1、2、3 代表其相对距离倍数，0 代表不存在障碍物阶砖，1 代表相对一个阶砖的距离，以此类推.
根据阶梯的生成规律，建立两个数组

	//无障碍数组
    this.stairArr = []
    //障碍数组
    this.obstacleArr = []

**2.3 生成随机数**

    // 生成随机数i，min <= i < max
    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min) + min)
    }
无障碍石阶方向： getRandomInt(0,2)

障碍石阶距离： 由于各个距离的出现概率是不一样的，所以不能直接用上面的生成随机数函数（这个的概率是均分的），
所以先构成了一个满足概率的数组，再随机从概率数组中取值。
如 5，2，2，1的最小公倍数是10 ，那在概率数组中，出现0，1，2，3的次数分别为5，2，2，1，

	gcd(a, b) {
        var minNum = Math.min(a, b),
            maxNum = Math.max(a, b),
            i = minNum,
            vper = 0
        if (a === 0 || b === 0) {
            return maxNum
        }

        for (; i <= maxNum; i++) {
            vper = minNum * i
            if (vper % maxNum === 0) {
                return vper
                break
            }
        }
    }

    //求一个数组的最小公倍数
    gcds(arr) {
        var onum = 0,
            i = 0,
            len = arr.length,
            midNum = 0
        for (; i < len; i++) {
            onum = Math.floor(arr[i]) //去掉小数
            midNum = this.gcd(midNum, onum)
        }
        return midNum
    }
**2.4石阶位置**

利用随机算法生成无障碍数组和障碍数组后，需要在游戏容器上进行绘制阶梯，因此需要确定每一块阶砖的位置

每一块无障碍阶砖必然在上一块阶砖的左上方或者右上方，所以，我们对无障碍阶砖的位置计算时可以依据上一块阶砖的位置进行确定。

1. 第 n 块无障碍阶砖的 x 轴位置为上一块阶砖的 x 轴位置偏移半个阶砖的宽度，若是在左上方则向左偏移，反之向右偏移。
2. 而其 y 位置则是上一块阶砖的 y 轴位置向上偏移一个阶砖高度减去一定像素的高度

根据这个原理，可以确定石阶位置，但是由于使用原生canvas实现，所以在进行绘制时选择从最上方开始绘出石阶，因为下方的障碍物需要比上方的优先显示，确定石阶方向时从石阶数组后面往前取即可。

如何保证最下方的石阶处于屏幕中央？ 在绘制前进行计算，将石阶数组进行累加可算出总偏移量，即最上方的石阶处于屏幕中央减这个偏移量即可
	
	//计算最上面的台阶横坐标，（确保最下面砖块在屏幕中间）
	calculate_x() {
	    let result = 0
	
	    for (let i = 0; i < this.stairArr.length; i++) {
	        result += this.stairArr[i]
	    }
	    result = result * 2 - this.stairNum
	    return result * (this.width / 2) - this.width / 2 + screenWidth / 2
	}

障碍石阶根据这个无障碍的石阶位置乘上相应偏移量即可得到

**2.5动画的实现**

首先确定下一块生成的石阶位置是当前的左边还是右边，保持当前位置不变，同样适用requestAnimationFrame，每次偏移相邻石阶间距离/fps即可

**2.6石阶生成**
将石阶数组最前面的值pop,利用随机数组生成一个随机数push进数组即可， pop的值存入坠落数组，用于后面坠落石阶动画实现

**2.7石阶坠落**

实现上采用30fps进行坠落即0.5s,每次点击将上上一块的石阶进行坠落，30fps时将上一块石阶坠落，然后将人物所在位置石阶即人物坠落，实现上在y轴加上与fps值相关的偏移量即可。坠落后将坠落数组中该石阶值move.

	//移除已经下落的障碍砖
	for (let i = 0; i < move.length; i++) {
	    this.obs_sh[move[i]] = 0
	    this.obs_img[move[i]] = 0
	}

	//计算每次下落的位置
	dropInit_stair() {
		this.stair_x = this.calculate_x() + move_flag * this.width / (2 * 26)
		this.stair_y = - 12
	}
###3. 机器人
**3.1机器人方向**

开始时机器人面向的方向必定是下一个无障碍石阶方向，点击后跳跃，如果方向不一致，先将机器人进行转向，下一个正确的方向通过取出无障碍数组中的第一个值得到，机器人的方向切换通过canvas的transform实现

	//下个正确的方向
	this.next_direction = this.floor.getStairArr()[0]
	this.robot.update()
	this.robot.buildRobot(ctx, this.next_direction)

**3.2机器人跳动**

机器人跳动采用雪碧图加位置移动实现，每次跳动时，移动图片执行跳动效果，同时将机器人位置移至石阶位置上，最后跟着石阶一起回到屏幕中央位置

    //移动雪碧图
	if (this.start_x < 9 * 150 && this.start_y === 0 ){
	    this.start_x += 150
	}else if(this.start_x === 9 * 150 && this.start_y === 0){
	    this.start_y = 283
	    this.start_x = 0
	}else if(this.start_x < 9 * 150 && this.start_y === 283){
	    this.start_x += 150
	}

游戏结束先对当前障碍物石阶进行获取，判断是否在相邻位置，在相邻位置机器人跳动一下，否则机器人往障碍石阶方向下落，对y轴加上偏移量的值即可

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
###4.背景及面板
背景直接使用canvas进行颜色填充

	//背景
    fillbackground(){
        this.ctx.fillStyle = '#001605'
        this.ctx.fillRect(0, 0, screenWidth, screenHeight)
    }
开始面板绘制，箭头使用翻转进行绘制

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
###5.音效及震动等
音效及震动微信提供api，直接调用即可

	/**
	 * 统一的音效管理器
	 */
	export default class Music {
	    constructor() {
	        if (instance)
	            return instance
	        instance = this
	
	        this.bgmAudio = new Audio()
	        this.bgmAudio.loop = true
	        this.bgmAudio.src = 'audio/bgm.mp3'
	
	        this.playBgm()
	    }
	    
	    playBgm() {
	        this.bgmAudio.play()
	    }
	}
###6.游戏难度设置
游戏难度目前设置为根据分数阶段减少石阶下落的时间，每加10分，level -1 ,初始为30fps,最后保持在2fps
###7.问题
微信端对图片显示有限制，当图片分辨率大于2048是显示不出来，黑屏，机器人的雪碧图目前通过ps切成两段

目前小游戏未开放注册，无法发布到微信平台，只能在开发者账号上进行预览
