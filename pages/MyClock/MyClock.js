// pages/MyClock/MyClock.js
import Request from "../../utils/request" //导入模块
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const date = new Date();
    const cur_day = date.getDate()
    const cur_month = date.getMonth() + 1
    const cur_year = date.getFullYear()
    this.listClock(cur_year, cur_month, cur_day)
  },
  handleSearch(e) {
    console.log(e.detail)
    this.listClock(parseInt(e.detail.year), parseInt(e.detail.month), parseInt(e.detail.day))
  },
  listClock(year, month, day) {
    if(month < 10)
      month = '0' + month
    if(day < 10)
      day = '0' + day
    wx.showLoading({
      title: '加载中',
    })
    let startDate = year + '-' + month + '-' + day + ' 00:00:00'
    let endDate = year + '-' + month + '-' + day + ' 23:59:59'
    Request.get('/admin/clock/searchMyClock?page.pn=1&page.size=1000&sort.crtTime=desc&search.crtTime_gte=' + startDate + '&search.crtTime_lte=' + endDate)
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