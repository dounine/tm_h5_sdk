export default new class payPop {
    constructor() {
        this.$dom = {
            body: document.querySelector('body'),
        };
        this.weChartCallBack = null;
        this.alipayCallBack = null;
        this.closeCallBack = null;

        this.linkStyle();

        return this.bindJsScopeToFn({
            create: this.create,
            remove: this.remove
        }, this);
    }

    // 先引入样式表
    linkStyle() {
        let headHTML = document.getElementsByTagName('head')[0].innerHTML;
        headHTML += '<link type="text/css" rel="stylesheet" href="https://cdn.kuaiyugo.com/test/tianmu/_tmSDK_pay_pop.css">';
        document.getElementsByTagName('head')[0].innerHTML = headHTML;
    }

    create({weChart = null, alipay = null, close = null} = {}) {
        this.weChartCallBack = weChart || function () {
        };
        this.alipayCallBack = alipay || function () {
        };
        this.closeCallBack = close || function () {
        };
        // 创建容器
        this.$dom.pay_pop = document.createElement('div');
        this.$dom.pay_pop.setAttribute('class', '_tmSDK_pay_pop');
        this.$dom.body.appendChild(this.$dom.pay_pop);

        // 创建弹框
        this.$dom.pay_pop_box = document.createElement('div');
        this.$dom.pay_pop_box.setAttribute('class', '_tmSDK_pay_pop_box');
        this.$dom.pay_pop.appendChild(this.$dom.pay_pop_box);

        // 创建关闭按钮
        this.$dom.pay_pop_close = document.createElement('div');
        this.$dom.pay_pop_close.setAttribute('class', '_tmSDK_pay_pop_box_close');
        let pay_pop_close_img = document.createElement('img');
        pay_pop_close_img.setAttribute('class', '_tmSDK_pay_pop_box_close_img');
        pay_pop_close_img.setAttribute('src', 'https://cdn.kuaiyugo.com/test/tianmu/_tmSDK_pay_pop_close.png');
        this.$dom.pay_pop_close.appendChild(pay_pop_close_img);
        this.$dom.pay_pop_box.appendChild(this.$dom.pay_pop_close);

        // 创建弹框标题
        let pay_pop_box_title = document.createElement('h3');
        pay_pop_box_title.setAttribute('class', '_tmSDK_pay_pop_box_title');
        pay_pop_box_title.innerHTML = '请选择支付方式';
        this.$dom.pay_pop_box.appendChild(pay_pop_box_title);

        // 创建内容
        let pay_pop_box_btn = document.createElement('div');
        pay_pop_box_btn.setAttribute('class', '_tmSDK_pay_pop_box_btn');
        this.$dom.weChart = document.createElement('i');
        this.$dom.alipay = document.createElement('i');
        this.$dom.weChart.setAttribute('class', '_tmSDK_pay_pop_box_btn_img _tmSDK_pay_pop_box_btn_weChart');
        this.$dom.alipay.setAttribute('class', '_tmSDK_pay_pop_box_btn_img _tmSDK_pay_pop_box_btn_alipay');
        pay_pop_box_btn.appendChild(this.$dom.weChart);
        pay_pop_box_btn.appendChild(this.$dom.alipay);
        this.$dom.pay_pop_box.appendChild(pay_pop_box_btn);

        // 按钮绑定事件
        this.initEvent();
    }

    initEvent() {
        this.initRegisterEntryEvent();
    }

    initRegisterEntryEvent() {
        this.isRemove = true;
        this.$dom.pay_pop_close.addEventListener('click', e => {
            console.log('CLOSE BTN CLIICK');
            this.closeCallBack && this.closeCallBack();
            this.remove();
        });

        this.$dom.weChart.addEventListener('click', e => {
            console.log('WECHART BTN CLIICK');
            if (this.isRemove) {
                this.weChartCallBack && this.weChartCallBack();
            }
            this.isRemove = false;
        });

        this.$dom.alipay.addEventListener('click', e => {
            console.log('ALIPAY BTN CLIICK');
            if (this.isRemove) {
                this.alipayCallBack && this.alipayCallBack();
            }
            this.isRemove = false;
        });
    }

    remove() {
        this.isRemove = true;
        this.$dom.body.removeChild(this.$dom.pay_pop);
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