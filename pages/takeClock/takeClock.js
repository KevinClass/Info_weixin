// pages/takeClock/takeClock.js
import QQMapWX from '../../libs/qqmap-wx-jssdk.js';
import Request from "../../utils/request"; //导入模块
import util from "../../utils/util"
var qqmapsdk = new QQMapWX({
  key: 'IXXBZ-W7SW3-ZRV3D-YYC53-ULSXF-UBFND'//申请的开发者秘钥key
});
Page({

  /**
   * 页面的初始数据
   */
  data: {
    address: '',
    orderId: undefined,
    teamId: undefined,
    picNum: 0,
    orderNo: '',
    orderName: '',
    imageList: [],
    formData: {},
    type: 0,
    rules: [{
      name: 'address',
      rules: {
        required: true,
        message: '请获取地址'
      },
    }, {
      name: 'person',
      rules: [{
        required: true,
        message: '请输入人数'
      }]
    }],
  },
  onLoad: function(options) {
    console.log(options)
    this.data.orderId = options.orderId
    this.data.teamId = options.teamId
    this.setData({type: options.type})

    let that = this
    Request.get('/admin/order/' + options.orderId)
    .then(res => {
      console.log('result:' + JSON.stringify(res.data))
      if (res.data.status == 200) {
        console.log('res.data.data.status',res.data.data.status)
        if(res.data.data.status === '03')
        {
          wx.navigateBack({
            delta: 0,
            success: ()=>{
              wx.showToast({
                title: '订单已完结',
                icon: 'none',
                duration: 2000
              })
            }
          })
        }
        that.setData({orderNo:res.data.data.orderNo, orderName: res.data.data.orderName})
      }
    }).catch(err => {
      console.log('error',err)
      this.data.loading = false
    })
  },
  getAddr() {
    let that = this
    wx.getLocation({
      success: function(res) {
          console.log(res)
          let {formData} = that.data;
          formData.latitude = res.latitude
          formData.longitude = res.longitude
          console.log(formData.latitude, formData.longitude)
          // 调用sdk接口
          qqmapsdk.reverseGeocoder({
              location: {
                  latitude: res.latitude,
                  longitude: res.longitude
              },
              get_poi: 1,
              success: function (res) {
                //获取当前地址成功
                console.log(res);
                that.setData({address: res.result.address})
                that.data.formData.address = that.data.address
                console.log(that.data.address);
              },
              fail: function (res) {
                  console.log('获取当前地址失败', res);
              }
          });
      },
    })
  },
  takePhoto() {
    var _this = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        // _this.setData({
        //   tempFilePaths:res.tempFilePaths
        // })
        let {imageList} = _this.data
        let {photoNum} = _this.data
        imageList.push(res.tempFilePaths)
        console.log(res.tempFilePaths)
        photoNum = imageList.length
        _this.setData({imageList,photoNum})
      }
    })
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
  takeClock() {
    let {formData} = this.data
    if(formData.address == undefined || formData.address.length < 1) {
      this.setData({
        error: '请获取地址'
      })
      return
    }
    if(formData.person == undefined || formData.person.length < 1) {
      this.setData({
        error: '请输入人数'
      })
      return
    }
    formData.picNum = this.data.photoNum
    formData.type = this.data.type
    formData.orderId = this.data.orderId
    console.log('formData', formData)
    let _that = this
    Request.post('/admin/clock/add', JSON.stringify(_that.data.formData))
    .then(res => {
      console.log('result:' + JSON.stringify(res.data))
      if(res.data.status == 500)
      {
        wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
      }else if(res.data.status == 200) {
        let p = new Array()
        let {imageList} = _that.data
        imageList.forEach((item) => {
          console.log('upload')
          p.push(new Promise((resolve, reject) => {
            Request.upload('/admin/clockImage/upload?orderId=' + this.data.orderId + '&clockId=' + res.data.data, 'file', item.toString())
            .then(res=> {
              console.log(res)
              resolve()
            }).catch(err => {
              console.log('error',err)
              reject()
            })
          }))
        })
        Promise.all(p).then(() => {
          wx.showToast({
            title: '打卡成功',
            icon: 'success',
            duration: 2000,
            mask: true,
            success: () => {setTimeout(() => {
              wx.navigateBack()
            }, 2000)}
          })
        })
      }

    }).catch(err => {
      console.log('error:', err)
    })
  }
})