export default new class payPop {
    constructor() {
        this.$dom = {
            body: document.querySelector('body'),
        };
        this.linkStyle();
    }

    // 先引入样式表
    linkStyle(){
        let headHTML = document.getElementsByTagName('head')[0].innerHTML;
        headHTML += '<link type="text/css" rel="stylesheet" href="https://cdn.kuaiyugo.com/test/tianmu/_tmSDK_loading.css">';
        document.getElementsByTagName('head')[0].innerHTML = headHTML;
    }

    show() {
        if (this.$dom.loading) {
            this.$dom.loading.setAttribute('class', '_tmSDK_loading _tmSDK_loading_show');
            return;
        }
        this.$dom.loading = document.createElement('div');
        this.$dom.loading.setAttribute('class', '_tmSDK_loading _tmSDK_loading_show');
        this.$dom.body.appendChild(this.$dom.loading);

        // 创建显示的图片
        let loader = document.createElement('div');
        loader.setAttribute('class', '_tmSDK_loading_loader');
        this.$dom.loading.appendChild(loader);
    }

    hide() {
        this.$dom.loading.setAttribute('class', '_tmSDK_loading _tmSDK_loading_hide');
    }
}