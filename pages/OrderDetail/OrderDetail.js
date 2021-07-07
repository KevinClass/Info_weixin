// pages/OrderDetail/OrderDetail.js

import Request from "../../utils/request" //导入模块
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId: undefined,
    teamId: undefined,
    status: undefined
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('options:', options)
    this.setData({orderId: options.id, teamId: options.teamid, status: options.status})
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  onViewClick: function() {
    let that = this
    console.log("onViewClick")
    Request.get('/admin/order/' + this.data.orderId)
    .then(res => {
      console.log('result:' + JSON.stringify(res.data))
      if (res.data.status == 200) {
        if(res.data.data.teamId != undefined)
        {
          console.log('no teamId '+res.data.data.teamId)
          wx.showModal({
            title: '提示',
            content: '订单已分配，是否重新分配？',
            success (res) {
              if (res.confirm) {
                console.log('用户点击确定')
                wx.navigateTo({url: '../malloc/malloc?orderId=' + that.data.orderId});
              } else if (res.cancel) {
                return
              }
            }
          })
        }else{
          wx.navigateTo({url: '../malloc/malloc?orderId=' + that.data.orderId});
        }
        console.log('order:' + this.data.orderId)
      }
      this.data.loading = false
    }).catch(err => {
      console.log('error',err)
      this.data.loading = false
    })
  }
})