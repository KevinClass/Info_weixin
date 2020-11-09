//index.js
//获取应用实例
const app = getApp()
import Request from "../../utils/request"; //导入模块
import util from "../../utils/util"
import event from "../../utils/event"


Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    imageSrc: '',
    index: 0,
    teamName: '',
    teamId: 0,
    list: [{
        "text": "订单",
        "iconPath": "/images/dingdanup.png",
        "selectedIconPath": "/images/dingdandown.png",
        // dot: true
      },
      {
        "text": "我的",
        "iconPath": "/images/renyuanup.png",
        "selectedIconPath": "/images/renyuandown.png",
        // badge: 'New'
      }
    ]
  },
  onClockKey(e) {
    wx.navigateTo({
      url: '../../pages/clock/clock'
    })
  },
  onShow: function() {
   
  },
  tabChange: function(e) {
      // this.data.index = e.detail.index
      this.setData({
        index: e.detail.index
      })
      console.log('tab change:' + this.data.index, e)
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onUnload: function() {
    // Do something when page close.
    event.unRegedit('user', this.notice)
  },
  notice (res, that) {
    console.log('notice', res, that)
    util.getUserTeamInfo().then(res=>{
        app.globalData.sysUser = res.data
        that.setData({
          ['userInfo.nickName']: res.data.name,
          teamName: res.data.teamName,
          teamId: res.data.teamId
        }, ()=> {
          event.notice('order', res.data)
        });
      })
  },
  onLoad: function () {
    event.regedit('user', this.notice, this)
    console.log('index onLoad');
    if (app.globalData.userInfo) {
      console.log('app.globalData.userInfo',app.globalData.userInfo)
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
      this.loginInfo()
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      console.log('index set userInfoReadyCallback ' + this.data.canIUse)
      app.userInfoReadyCallback = res => {
        console.log('index userInfoReadyCallback')
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        console.log('index loginInfo')
        this.loginInfo()
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
          loginInfo()
        }
      })
    }
  },
  changeClick: function(e) {
    console.log('changeClick')
    this.setData({
      index: 1
    })
  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
    this.loginInfo()
  },
  chooseimage: function () {
    var _this = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        console.log(res.tempFilePaths[0]);
        _this.setData({
          imageSrc: res.tempFilePaths[0]
        });
        // 　wx.uploadFile({
        //   　　　　url: ‘’, // 图片上传服务器真实的接口地址
        //   　　　　filePath: imgPath,
        //   　　　　name: ‘imgFile’,
        //   　　　　success: function (res) {
        //   　　　　　　wx.showToast({
        //   　　　　　　　　title: ‘图片上传成功’,
        //   　　　　　　　　icon: ‘success’,
        //   　　　　　　　　duration: 2000
        //   　　　　　　})
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        // _this.setData({
        //   tempFilePaths:res.tempFilePaths
        // })
      }
    })
  },
  loginInfo: function () {
    const that = this
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log('jscode:' + res.code)
        Request.get('/jwt/tokenWeiXin?code=' + res.code)
          .then(res => {
            console.log('result:' + JSON.stringify(res.data))
            if (res.data.status == 4000) {
              console.log('regedit')
              wx.navigateTo({
                url: '../regedit/regedit'
              })
            }else (res.data.status == 200) 
            {
              wx.setStorageSync('token', res.data.data)
              console.log('token:' + wx.getStorageSync('token'))
              util.getUserTeamInfo().then(res=>{
                app.globalData.sysUser = res.data
                that.setData({
                  ['userInfo.nickName']: res.data.name,
                  teamName: res.data.teamName,
                  teamId: res.data.teamId
                }, ()=> {
                  event.notice('order', res.data)
                })
              });
            }
          }).catch(err => {
            console.log('error',err)
          })
      }
    })
  }
})