import Request from "../../utils/request"; //导入模块
import util from "../../utils/util"

Page({
  data: {
    dialogShow: false,
    showOneButtonDialog: false,
    buttons: [{
      text: '取消'
    }, {
      text: '确定'
    }],
    oneButton: [{
      text: '确定'
    }],
    formData: {},
    rules: [{
      name: 'name',
      rules: {
        required: true,
        message: '名称必填'
      },
    }, {
      name: 'phone',
      rules: [{
        mobile: true,
        message: '手机号不正确'
      }, {
        required: true,
        message: '手机号必填'
      }]
    }, {
      name: 'passwd',
      rules: {
        required: true,
        message: '注册密码必填'
      },
    }],
  },
  openConfirm: function () {
    this.setData({
      dialogShow: true
    })
  },
  tapDialogButton(e) {
    this.setData({
      dialogShow: false,
      showOneButtonDialog: false
    })
  },
  tapOneDialogButton(e) {
    this.setData({
      showOneButtonDialog: true
    })
  },
  // 手机号部分
  inputPhoneNum: function (e) {
    let phoneNumber = e.detail.value
    if (phoneNumber.length === 11) {
      let checkedNum = this.checkPhoneNum(phoneNumber)
    }
  },
  checkPhoneNum: function (phoneNumber) {
    let str = /^1\d{10}$/
    if (str.test(phoneNumber)) {
      return true
    } else {
      wx.showToast({
        title: '手机号不正确',
        icon: 'none'
      })
      return false
    }
  },
  formInputChange(e) {
    const {
      field
    } = e.currentTarget.dataset
    console.log('formInputChange:' + field)
    this.setData({
      [`formData.${field}`]: e.detail.value
    })
  },
  submitForm(e) {
    console.log('submitForm:' + this.formData)
    let _that = this;
    this.selectComponent('#form').validate((valid, errors) => {
      console.log('valid', valid, errors)
      if (!valid) {
        const firstError = Object.keys(errors)
        if (firstError.length) {
          this.setData({
            error: errors[firstError[0]].message
          })
        }
      } else {
        // wx.showToast({
        //   title: '校验通过'
        // })
        console.log('Request:' + Request)
        wx.login({
          success: res => {
            // 发送 res.code 到后台换取 openId, sessionKey, unionId
            console.log('jscode:' + res.code)
            this.setData({
              [`formData.jscode`]: res.code
            })
            console.log('this.formData:' + JSON.stringify(_that.data.formData))
            Request.post('/jwt/RegeditWeixin', JSON.stringify(_that.data.formData), "{'content-type': 'application/json'}")
              .then(res => {
                console.log('result:' + JSON.stringify(res.data))
                if(res.data.status == 500)
                {
                  wx.showToast({
                      title: res.data.message,
                      icon: 'none'
                    })
                    wx.reLaunch({url: '../index/index'})
                }else if(res.data.status == 200) {
                  wx.setStorageSync('token', res.data.data)
                  util.getUserTeamInfo();
                  wx.reLaunch({url: '../index/index'})
                }

              }).catch(err => {
                console.log('error:' + JSON.stringify(err.data))
              })
          }
        })
      }
    })
  }
});