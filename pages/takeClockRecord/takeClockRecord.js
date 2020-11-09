// pages/takeClockRecord/takeClockRecord.js
import Request from "../../utils/request" //导入模块
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId: undefined,
    clockList: undefined
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({orderId: options.orderId})
    wx.showLoading({
      title: '加载中',
    })
    Request.get('/admin/clock/search?page.pn=1&page.size=1000&search.orderId_eq='+options.orderId+'&sort.crtTime=desc')
    .then(res => {
      console.log('result:' + JSON.stringify(res.data))
      if (res.data.status == 200) {
        this.setData({
          clockList: res.data.data.rows,
        })
      }
      wx.hideLoading()
    }).catch(err => {
      console.log('error',err)
      wx.hideLoading()
    })
  }
})