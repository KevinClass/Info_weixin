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
    formData: {person:undefined},
    clockDate: '',
    clockStr: '',
    endOrder: false,
    clockImageList: [],
    type: 0,
    clockData: undefined
  },
  onLoad: function(options) {
    console.log(options)
    this.data.orderId = options.orderId
    this.data.teamId = options.teamId
    // this.data.clockDate = options.clockDate
    let {clockDate} = this.data
    let {clockStr} = this.data
    clockDate = new Date().Format("yyyyMMdd")
    clockStr = new Date().Format("yyyy年MM月dd日")
    this.setData({type: options.type, clockDate, clockStr})
    console.log('clockDate:', clockDate)
    wx.showLoading({
      title: '加载中',
    })
    let that = this
    Request.get('/admin/order/' + options.orderId)
    .then(res => {
      console.log('result:' + JSON.stringify(res.data))
      if (res.data.status == 200) {
        that.setData({orderNo:res.data.data.orderNo, orderName: res.data.data.orderName})
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
        }else {
          Request.get('/admin/clock/search?search.orderId_eq=' + options.orderId + '&search.type_eq=' + options.type + '&search.clockDate_eq=' + this.data.clockDate)
          .then(res => {
            console.log('result:' + JSON.stringify(res.data))
            if (res.data.status == 200) {
              if(res.data.data.total == 0)
              {
                wx.hideLoading()
                return
              }else {
                let {formData} = that.data
                that.data.clockData = res.data.data.rows[0]
                formData = res.data.data.rows[0]
                console.log('clock data:', formData)
                that.setData({formData: formData})
                Request.get('/admin/clockImage/search?page.pn=1&page.size=1000&search.clockId_eq='+formData.id+'&sort.crtTime=desc')
                .then(res => {
                  console.log('result:' + JSON.stringify(res.data))
                  if (res.data.status == 200) {
                    let {clockImageList} = that.data
                    if(res.data.data.total > 0) {
                      clockImageList = res.data.data.rows
                      let p = new Array()
                      clockImageList.forEach((item) => {
                        p.push(new Promise((resolve, reject) => {
                          Request.getBit('/admin/orderDetail/image?name=' + item.patch)
                          .then(res=> {
                            let url ='data:image/png;base64,'+wx.arrayBufferToBase64(res.data)
                            item.url = url
                            resolve()
                          }).catch(err => {
                            console.log('error',err)
                            reject()
                          })
                        }))
                      })
                      Promise.all(p).then(() => {
                        wx.hideLoading()
                        that.setData({clockImageList})
                      })
                    }
                  }else {
                    wx.hideLoading()
                  }
                }).catch(err => {
                  console.log('error',err)
                  wx.hideLoading()
                })
              }
            }else {
              wx.hideLoading()
            }
          })
          wx.hideLoading()
        }
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
                that.data.formData.address = res.result.address
                that.setData({formData: formData})
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
      count: 6, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        // _this.setData({
        //   tempFilePaths:res.tempFilePaths
        // })
        let {imageList} = _this.data
        let {photoNum} = _this.data
        res.tempFilePaths.forEach(item => {
          imageList.push(item)
          console.log(item)
        })
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
      [`${field}`]: e.detail.value
    })
  },
  checkboxChange(e) {
    console.log('checkbox发生change事件，携带value值为：', e.detail.value)
    if(e.detail.value == 'endOrder') {
      this.data.endOrder = true
    }else {
      this.data.endOrder = false
    }
  },
  endClock(e) {
    let type = e.currentTarget.dataset.index
    let that = this
    wx.showModal({
      title: '提示',
      content: '是否要完结这工单？',
      success (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          that.takeClock(e)
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  takeClock(e) {
    let type = e.currentTarget.dataset.index
    console.log('takeClock事件，携带value值为：', e.currentTarget.dataset.index)
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
    formData.clockDate = this.data.clockDate
    formData.type = type
    formData.orderId = this.data.orderId
    console.log('formData', formData)
    let _that = this
    if(formData.id == undefined) {
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
    } else {
      Request.put('/admin/clock/'+formData.id, JSON.stringify(formData))
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
              console.log('url:', '/admin/clockImage/upload?orderId=' + this.data.orderId + '&clockId=' + formData.id)
              Request.upload('/admin/clockImage/upload?orderId=' + this.data.orderId + '&clockId=' + formData.id, 'file', item.toString())
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
  }
})