export default new class guide {
    constructor() {
        this.$dom = {
            body: document.querySelector('body'),
        };
        this.linkStyle();

        return this.bindJsScopeToFn({
            create: this.create
        }, this);
    }

    // 先引入样式表
    linkStyle() {
        let headHTML = document.getElementsByTagName('head')[0].innerHTML;
        headHTML += '<link type="text/css" rel="stylesheet" href="https://cdn.kuaiyugo.com/test/tianmu/_tmSDK_floating.css">';
        document.getElementsByTagName('head')[0].innerHTML = headHTML;
    }

    create(isiOS) {
        // 创建容器
        this.$dom.floating = document.createElement('div');
        this.$dom.floating.setAttribute('class', '_tmSDK_floating');
        this.$dom.body.appendChild(this.$dom.floating);

        // 创建显示的图片
        this.$dom.floating_img = document.createElement('img');
        this.$dom.floating_img.setAttribute('class', '_tmSDK_floating_img');
        this.$dom.floating_img.setAttribute('src', isiOS ? 'https://cdn.kuaiyugo.com/test/tianmu/_tmSDK_ios_img.png' : 'https://cdn.kuaiyugo.com/test/tianmu/_tmSDK_android_img.png');
        this.$dom.floating.appendChild(this.$dom.floating_img);
    }

    /**
     * @description 绑定对象或函数作用域this
     */
    bindJsScopeToFn(target, scope) {
        if (scope) {
            if (this.getVariableType(target) === 'Function') {
                target = target.bind(scope);
            } else if (this.getVariableType(target) === 'Object') {
                Object.keys(target).forEach(key => {
                    target[key] = this.bindJsScopeToFn(target[key], scope);
                });
            }
        }
        return target;
    }

    /**
     * [getVariableType 获取变量的准确数据类型]
     * @Author   Lucas
     * @DateTime 2018-08-14
     * @param    {Object}   varable [变量]
     * @return   {String}           [数据类型，比如: String, Object, Array 等]
     */
    getVariableType(variable) {
        return Object.prototype.toString.call(variable).slice(8, -1);
    }
}