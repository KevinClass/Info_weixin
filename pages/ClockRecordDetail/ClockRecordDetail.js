// pages/ClockRecordDetail/ClockRecordDetail.js
import Request from "../../utils/request" //导入模块
Page({

  /**
   * 页面的初始数据
   */
  data: {
    clockId: undefined,
    clock: undefined,
    clockImageList: undefined
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    this.setData({clockId: options.id})
    wx.showLoading({
      title: '加载中',
    })
    Request.get('/admin/clock/' + options.id)
    .then(res => {
      console.log('result:' + JSON.stringify(res.data))
      if (res.data.status == 200) {
        that.setData({clock:res.data.data})
        Request.get('/admin/clockImage/search?page.pn=1&page.size=1000&search.clockId_eq='+res.data.data.id+'&sort.crtTime=desc')
        .then(res => {
          console.log('result:' + JSON.stringify(res.data))
          if (res.data.status == 200) {
            let {clockImageList} = that.data
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
            }).reject( () => {
              wx.hideLoading()
            }).catch( () => {
              wx.hideLoading()
            })
          }else {
            wx.hideLoading()
          }
        }).catch(err => {
          console.log('error',err)
          wx.hideLoading()
        })
      }else {
        wx.hideLoading()
      }
    }).catch(err => {
      console.log('error',err)
      wx.hideLoading()
    })
  },
  viewImage: function(e) {
    let url = e.currentTarget.dataset['index']
    wx.showLoading({
      title: '加载中',
    })
    wx.previewImage({
      current: url,
      urls: [url],
      complete: ()=>{
        wx.hideLoading({
          success: (res) => {},
        })
      }
    })
  }
})