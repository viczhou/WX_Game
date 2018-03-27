export default class Utils {

    // 生成随机数i，min <= i < max
    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min) + min)
    }

    //生成无障碍砖块
    createRandomOneZero(length) {
        if (length <= 1) {
            return this.getRandomInt(0, 2)
        } else {
            var arr = []
            for (var i = 0; i < length; i++) {
                arr.push(this.getRandomInt(0, 2))
            }
            return arr
        }

    }
    //生成障碍砖块
    //probability概率
    createRandomProbability(probability = [.5, .2, .2, .1], length) {
        // todo
        var largeNum = this.gcds([5, 2, 2, 1])
        var l = 0
        var oppArr = []
        for (var i = 0; i < probability.length; i++) {
            let k = largeNum * probability[i] + l
            while (l < k) {
                oppArr[l] = i
                l++
            }
        }
        if (length === 1) {
            return oppArr[this.getRandomInt(0, oppArr.length)];
        } else {
            var arr = []
            for (var i = 0; i < length; i++) {
                arr.push(oppArr[this.getRandomInt(0, oppArr.length)]);
            }
            return arr
        }

    }
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

}