import Message from './Message';
import axios from 'axios';
import md5 from "md5";

const querySelector = document.querySelector.bind(document);

const validateErrorMsg = {
    mobile: {
        require: '手机号码不能为空'
    },
    mobileError: {
        require: '请输入正确的手机号'
    },
    verification: {
        require: '验证码不能为空'
    },
    conditions: {
        require: '请阅读并同意《用户协议》和《隐私政策》'
    }
};

const deafultTime = 60; // 重新发送验证码的时间

class payPop {
    constructor({isBind, open_id = "", loginSuccessCallback, loginFailCallback, programId}) {
        this.isBind = isBind;
        this.open_id = open_id;
        this.loginSuccessCallback = loginSuccessCallback;
        this.loginFailCallback = loginFailCallback;
        this.linkStyle();

        this.$dom = {
            body: document.querySelector('body'),
        };

        this.programId = programId;
        this.isLoging = false;
        this.mobile = '';
        this.verification = '';
        this.conditions = '';
        this.verificationStep = 0; // 标识短信验证码登录当前在第几步（0：初始，1：已发送短信验证码）
        this.verificationWaitTimer = null;
        this.time = deafultTime;

        this.create();

    }

    // 先引入样式表
    linkStyle() {
        let headHTML = document.getElementsByTagName('head')[0].innerHTML;
        headHTML += '<link type="text/css" rel="stylesheet" href="https://cdn.kuaiyugo.com/test/tianmu/_tmSDK_login.css">';
        document.getElementsByTagName('head')[0].innerHTML = headHTML;
    }

    create() {
        // 创建容器
        this.$dom.login_pop = document.createElement('div');
        this.$dom.body.appendChild(this.$dom.login_pop);

        this.$dom.login_pop.innerHTML = this.getInnerHtml();

        // 获取元素保存
        this.$dom.loginWrap = querySelector('#j-verification-login');
        this.$dom.phoneInput = querySelector('#j-phone-verification-input');
        this.$dom.verificationInput = querySelector('#j-verification-input');
        this.$dom.time = querySelector('.j-time');
        this.$dom.closeBtn = querySelector('._tmSDK_login_pop_box_close');
        this.$dom.timeWrap = querySelector('.j-time-wrap');
        this.$dom.sendverficationBtn = querySelector('#j-send-verfication-btn');
        this.$dom.loginBtn = querySelector('#j-verification-login-btn');
        this.$dom.conditions = querySelector('#j-register-conditions');
        this.$dom.conditions_0 = querySelector('#j-register-conditions-0');
        this.$dom.conditions_1 = querySelector('#j-register-conditions-1');

        // 按钮绑定事件
        this.initEvent();
    }

    getInnerHtml() {
        let title = this.isBind ? '绑定' : '登录';
        return `
      <div class="_tmSDK_login_pop">
        <div class="_tmSDK_login_pop_box" id="j-verification-login">
            <div class="_tmSDK_login_pop_box_close">
                <img src="https://cdn.kuaiyugo.com/test/tianmu/_tmSDK_pay_pop_close.png">
            </div>
            <h3 class="_tmSDK_login_pop_box_title">手机号${title}</h3>
            <div class="_tmSDK_login_pop_box_content">
                <div class="_tmSDK_login_pop_box_form_row">
                    <input class="form-input phone" id="j-phone-verification-input" type="text" name="phone" placeholder="手机号码">
                </div>
                <div class="_tmSDK_login_pop_box_form_row">
                    <input class="form-input" id="j-verification-input" type="text" name="password" placeholder="短信验证码">
                    <div class="send-verification-wrap">
                        <div class="send-verfication-btn z-active" id="j-send-verfication-btn">获取验证码</div>
                        <div class="m-time-wrap j-time-wrap">
                            <span>剩余</span>
                            <span class="j-time">30</span>
                            <span>秒</span>
                        </div>
                    </div>
                </div>
                <div class="_tmSDK_login_pop_box_form_row">
                    <div class="form-row">
                        <input id="j-register-conditions" type="checkbox" style="vertical-align: middle;">
                        <label for="j-register-conditions" style="vertical-align: middle;">
                            <span style="cursor: pointer;">阅读并同意<a id="j-register-conditions-0" href="javascript:void(0)">《用户协议》</a>和<a id="j-register-conditions-1" href="javascript:void(0)">《隐私政策》</a></span>
                        </label>
                    </div>
                    <button class="u-login-btn" id="j-verification-login-btn">进入游戏</button>
                </div>
            </div>
        </div>
      </div>`;
    }

    getCommonBoxHtml(url) {
        return `
        <div class="_tmSDK_login_pop_conditions">
            <div class="_tmSDK_login_pop_conditions_box">
                <div class="_tmSDK_login_pop_conditions_close">
                    <img src="https://cdn.kuaiyugo.com/test/tianmu/_tmSDK_pay_pop_close.png">
                </div>
                <iframe class="_tmSDK_login_pop_conditions_full_screen" frameborder="0" src="${url}"></iframe>
            </div>
        </div>`;
    }

    initEvent() {
        this.initSendVerificationEvent();
        this.initLoginEvent();
        this.initConditionsEvent();
    }

    // 初始化验证码发送事件
    initSendVerificationEvent() {
        this.$dom.sendverficationBtn.addEventListener('click', e => {
            this.getVerificationCode();
        });
    }

    // 初始化验证码登录事件
    initLoginEvent() {
        this.$dom.loginBtn.addEventListener('click', e => {
            this._login.call(this);
        });

        this.$dom.loginWrap.addEventListener('keypress', e => {
            let theEvent = e || window.event;
            let code = theEvent.keyCode || theEvent.which || theEvent.charCode;
            if (code == 13) {
                e.preventDefault();
                this.$dom.loginBtn && this.$dom.loginBtn.click();
            }
        });
        this.$dom.closeBtn.addEventListener('click', e => {
            this.remove();
        });
    }

    // 初始化隐私政策
    initConditionsEvent() {
        this.$dom.conditions_0.addEventListener('click', e => {
            this.$dom.conditionsBox = document.createElement('div');
            this.$dom.body.appendChild(this.$dom.conditionsBox);
            this.$dom.conditionsBox.innerHTML = this.getCommonBoxHtml('https://cdn.kuaiyugo.com/test/tianmu/_tmSDK_agreement.html');
            // 绑定关闭事件
            this.removeConditions();
        });

        this.$dom.conditions_1.addEventListener('click', e => {
            this.$dom.conditionsBox = document.createElement('div');
            this.$dom.body.appendChild(this.$dom.conditionsBox);
            this.$dom.conditionsBox.innerHTML = this.getCommonBoxHtml('https://cdn.kuaiyugo.com/test/tianmu/_tmSDK_privacy.html');
            // 绑定关闭事件
            this.removeConditions();
        });
    }

    removeConditions() {
        this.$dom.conditions_close = querySelector('._tmSDK_login_pop_conditions_close');
        this.$dom.conditions_close.addEventListener('click', e => {
            this.$dom.body.removeChild(this.$dom.conditionsBox);
            this.$dom.conditions_close.removeEventListener('click');
            this.$dom.conditions_close = null;
            this.$dom.conditionsBox = null;
        });
    }

    sign({signBody, programId}) {
        let signatureStr = Object.keys(signBody).filter(function (key) {
            return signBody[key] !== undefined && signBody[key] !== '' && key !== "sign";
        }).sort().map(function (key) {
            return key + '=' + signBody[key];
        }).join('&') + programId;
        return md5(signatureStr);
    }

    // 获取短信验证码
    getVerificationCode() {
        this.mobile = this.$dom.phoneInput.value;
        if (!this.mobile) {
            Message.error({
                content: validateErrorMsg.mobile.require
            });
            return false;
        }

        // 校验手机格式
        if (!this.isMobile(this.mobile)) {
            Message.error({
                content: validateErrorMsg.mobileError.require
            });
            return false;
        }

        let data = {
            phone: this.mobile,
            type: this.isBind ? 'BIND_PHONE' : 'LOGIN',
            timestamp: new Date().getTime()
        }
        let self = this;

        // 请求
        axios.post(`https://api.kuaiyugo.com/api/platuser/v1/programs/${this.programId}/captcha`,
            Object.assign(data, {
                sign: this.sign({signBody: data, programId: this.programId})
            })
        ).then(function (response) {
            console.log('captcha', response.data)
            if (response.data.err === 0) {
                // 获取成功执行
                self.time = deafultTime;
                self.$dom.time.innerHTML = self.time;
                self.initVerificationTimer();
            } else {
                Message.error({
                    content: response.data.msg
                });
            }
        })
    }

    // 初始化验证码定时器
    initVerificationTimer() {
        if (this.time <= 0) {
            clearTimeout(this.verificationWaitTimer);
            this.verificationWaitTimer = null;
            this.$dom.sendverficationBtn.classList.add('z-active');
            this.$dom.timeWrap.classList.remove('z-active');
            return;
        }

        this.$dom.sendverficationBtn.classList.remove('z-active');
        this.$dom.timeWrap.classList.add('z-active');

        this.verificationWaitTimer = setTimeout(() => {
            this.time -= 1;
            this.$dom.time.innerHTML = this.time;
            this.initVerificationTimer();
        }, 1000);
    }

    _login() {
        if (this.isLoging) {
            return;
        }

        this.mobile = this.$dom.phoneInput.value;
        this.verification = this.$dom.verificationInput.value;
        this.conditions = this.$dom.conditions.checked;

        let data = {
            mobile: this.mobile,
            verification: this.verification,
            conditions: this.conditions
        };

        if (!this._validateFormData(data)) {
            return;
        }

        this.isLoging = true;

        if (this.isBind) {
            let _data = {
                open_id: this.open_id,
                phone: this.mobile,
                verify_code: this.verification,
                timestamp: new Date().getTime()
            }

            let self = this;

            // 登录请求
            axios.post(`https://api.kuaiyugo.com/api/platuser/v1/programs/${this.programId}/bind_phone`, Object.assign(
                _data,
                {
                    sign: this.sign({signBody: _data, programId: this.programId})
                }
            )).then(function (response) {
                self.isLoging = false;
                if (response.data.err === 0) {
                    self.remove();
                    // 请求成功
                    self.loginSuccessCallback && self.loginSuccessCallback(response);
                } else {
                    self.loginFailCallback && self.loginFailCallback(response.data.msg);
                    // 请求失败
                    Message.error({
                        content: response.data.msg
                    });
                }
            });
        } else {
            let _data = {
                phone: this.mobile,
                verify_code: this.verification,
                timestamp: new Date().getTime()
            }

            let self = this;

            // 登录请求
            axios.post(`https://api.kuaiyugo.com/api/platuser/v1/programs/${this.programId}/account_sessions`, Object.assign(
                _data,
                {
                    sign: this.sign({signBody: _data, programId: this.programId})
                }
            )).then(function (response) {
                self.isLoging = false;
                if (response.data.err === 0) {
                    self.remove();
                    localStorage.setItem("token", response.data.data.token);
                    // 请求成功
                    self.loginSuccessCallback && self.loginSuccessCallback(response);
                } else {
                    self.loginFailCallback && self.loginFailCallback(response.data.msg);
                    localStorage.removeItem("token");
                    // 请求失败
                    Message.error({
                        content: response.data.msg
                    });
                }
            });
        }

    }

    // 校验表单信息
    _validateFormData(data) {
        if (!data.mobile) {
            Message.error({
                content: validateErrorMsg.mobile.require
            });
            return false;
        }
        if (!data.verification) {
            Message.error({
                content: validateErrorMsg.verification.require
            });
            return false;
        }

        if (!data.conditions) {
            Message.error({
                content: validateErrorMsg.conditions.require
            });
            return false;
        }

        return true;
    }

    // 清空表单信息
    _cleanFormData() {
        this.$dom.phoneInput.value = '';
        this.$dom.verificationInput.value = '';
    }

    remove() {
        this.$dom.body.removeChild(this.$dom.login_pop);
    }

    // 手机号校验
    isMobile(mobile) {
        const mobileRegex = /^[1](([3][0-9])|([4][5-9])|([5][0-3,5-9])|([6][5,6])|([7][0-8])|([8][0-9])|([9][1,8,9]))[0-9]{8}$/g;
        return mobileRegex.test(mobile);
    }
}

export default payPop;